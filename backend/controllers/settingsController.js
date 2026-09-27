const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('../services/excelService');
const { ok, fail, asyncHandler } = require('../utils/http');
const { nowISO } = require('../utils/id');
const { DEFAULT_SETTINGS, DEFAULT_NOTIFICATIONS, GALLERY_DIR, AVATARS_DIR } = require('../config/database');

const OWNED_TABLES = ['settings', 'journal_entries', 'moods', 'plannings', 'routines', 'gallery', 'avatars'];

function boolStr(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') return value === 'true' ? 'true' : 'false';
  return value ? 'true' : 'false';
}

function normalizeNotifications(input = {}) {
  const next = { ...DEFAULT_NOTIFICATIONS, ...input };

  const pairs = [
    ['email', 'email_notifications'],
    ['journal_reminders', 'journal_reminders'],
  ];
  for (const [camel, snake] of pairs) {
    if (input[camel] !== undefined) next[snake] = boolStr(input[camel]);
  }
  if (input.email_notifications !== undefined) next.email_notifications = boolStr(input.email_notifications);
  if (input.journal_reminders !== undefined) next.journal_reminders = boolStr(input.journal_reminders);

  next.email = next.email_notifications !== 'false';
  next.push = next.push === true || next.push === 'true';
  next.dailyReminder = next.dailyReminder === true || next.dailyReminder === 'true';
  next.reminderTime = next.reminderTime || '20:00';
  return next;
}

async function settingsFor(userId) {
  let settings = await db.findOne('settings', (s) => s.user_id === userId);
  if (!settings) {
    settings = {
      user_id: userId,
      ...DEFAULT_SETTINGS,
      notifications: { ...DEFAULT_SETTINGS.notifications },
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    await db.insert('settings', settings);
  }
  if (!settings.notifications || Object.keys(settings.notifications).length === 0) {
    settings.notifications = { ...DEFAULT_NOTIFICATIONS };
  }
  return settings;
}

async function mergedProfile(user) {
  const settings = await settingsFor(user.id);
  return {
    userId: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '/avatars/av1.svg',
    role: user.role || 'user',
    theme: settings.theme || 'light',
    language: settings.language || 'fr',
    notifications: normalizeNotifications(settings.notifications),
    journalPrivacy: settings.journal_privacy || 'private',
    dateFormat: settings.date_format || 'DD/MM/YYYY',
    created_at: user.created_at,
    createdAt: user.created_at,
    updated_at: settings.updated_at || user.updated_at,
    updatedAt: settings.updated_at || user.updated_at,
  };
}

const getSettings = asyncHandler(async (req, res) => ok(res, await mergedProfile(req.user)));

const updateProfile = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const userPatch = { updated_at: nowISO() };
  const settingsPatch = { updated_at: nowISO() };

  if (body.name !== undefined) {
    if (!String(body.name).trim()) return fail(res, 400, 'Nom invalide', 'VALIDATION');
    userPatch.name = String(body.name).trim();
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'Adresse email invalide', 'VALIDATION');
    const existing = await db.findOne('users', (u) => u.id !== req.userId && String(u.email).toLowerCase() === email);
    if (existing) return fail(res, 409, 'Email déjà utilisé par un autre compte', 'EMAIL_TAKEN');
    userPatch.email = email;
  }

  if (body.theme !== undefined) settingsPatch.theme = body.theme;
  if (body.language !== undefined) settingsPatch.language = body.language;
  if (body.dateFormat !== undefined) settingsPatch.date_format = body.dateFormat;
  if (body.date_format !== undefined) settingsPatch.date_format = body.date_format;
  if (body.journalPrivacy !== undefined) settingsPatch.journal_privacy = body.journalPrivacy;
  if (body.journal_privacy !== undefined) settingsPatch.journal_privacy = body.journal_privacy;

  await db.update('users', (u) => u.id === req.userId, userPatch);
  const settings = await settingsFor(req.userId);
  await db.update('settings', (s) => s.user_id === req.userId, settingsPatch);

  const updatedUser = await db.findById('users', req.userId);
  const merged = await mergedProfile(updatedUser || { ...req.user, ...userPatch });
  return ok(res, { ...merged, settings }, 'Profil mis à jour avec succès');
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, new_password } = req.body || {};
  const nextPassword = newPassword || new_password;

  if (!currentPassword || !nextPassword) {
    return fail(res, 400, 'Mot de passe actuel ou nouveau mot de passe manquant', 'VALIDATION');
  }
  if (String(nextPassword).length < 6) {
    return fail(res, 400, 'Le nouveau mot de passe doit contenir au moins 6 caractères', 'VALIDATION');
  }

  const match = await bcrypt.compare(String(currentPassword), req.user.password);
  if (!match) return fail(res, 401, 'Mot de passe actuel incorrect', 'INVALID_PASSWORD');

  await db.update('users', (u) => u.id === req.userId, {
    password: await bcrypt.hash(String(nextPassword), 10),
    updated_at: nowISO(),
  });

  return ok(res, null, 'Mot de passe mis à jour avec succès');
});

const updateNotifications = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const allowed = ['email', 'push', 'dailyReminder', 'reminderTime', 'email_notifications', 'journal_reminders'];
  const incoming = {};
  for (const key of allowed) {
    if (body[key] !== undefined) incoming[key] = body[key];
  }
  if (Object.keys(incoming).length === 0) {
    return fail(res, 400, 'Aucune préférence de notification fournie', 'VALIDATION');
  }

  const settings = await settingsFor(req.userId);
  const notifications = normalizeNotifications({ ...settings.notifications, ...incoming });
  await db.update('settings', (s) => s.user_id === req.userId, { notifications, updated_at: nowISO() });

  return ok(res, { notifications }, 'Préférences de notification mises à jour');
});

const removeAccount = asyncHandler(async (req, res) => {
  const { password } = req.body || {};
  if (!password) return fail(res, 400, 'Mot de passe manquant', 'VALIDATION');

  const match = await bcrypt.compare(String(password), req.user.password);
  if (!match) return fail(res, 401, 'Mot de passe incorrect', 'INVALID_PASSWORD');

  const galleryRows = await db.filter('gallery', (r) => r.user_id === req.userId);
  for (const row of galleryRows) {
    if (row.filename) {
      fs.promises.unlink(path.join(GALLERY_DIR, path.basename(row.filename))).catch(() => {});
    }
  }
  const avatarRows = await db.filter('avatars', (r) => r.user_id === req.userId);
  for (const row of avatarRows) {
    if (row.url && row.url.startsWith('/uploads/avatars/')) {
      fs.promises.unlink(path.join(AVATARS_DIR, path.basename(row.url))).catch(() => {});
    }
  }

  for (const table of OWNED_TABLES) {
    await db.remove(table, (row) => row.user_id === req.userId || row.id === req.userId);
  }
  await db.remove('users', (row) => row.id === req.userId);

  return ok(res, null, 'Compte supprimé avec succès');
});

module.exports = {
  getSettings,
  updateProfile,
  updatePassword,
  updateNotifications,
  removeAccount,
  settingsFor,
  mergedProfile,
  normalizeNotifications,
};
