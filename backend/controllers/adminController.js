const fs = require('fs');
const path = require('path');
const db = require('../services/excelService');
const { ok, fail, asyncHandler } = require('../utils/http');
const { publicUser } = require('./authController');
const { GALLERY_DIR, AVATARS_DIR } = require('../config/database');

const users = asyncHandler(async (req, res) => {
  const rows = await db.getAll('users');
  const list = [];

  for (const row of rows) {
    const [entries, moods, images] = await Promise.all([
      db.filter('journal_entries', (r) => r.user_id === row.id),
      db.filter('moods', (r) => r.user_id === row.id),
      db.filter('gallery', (r) => r.user_id === row.id),
    ]);
    list.push({
      ...publicUser(row),
      entries: entries.length,
      moods: moods.length,
      images: images.length,
    });
  }

  list.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return ok(res, { users: list, total: list.length });
});

const removeUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.userId) {
    return fail(res, 400, 'Impossible de supprimer son propre compte depuis l\'administration', 'VALIDATION');
  }

  const target = await db.findById('users', targetId);
  if (!target) return fail(res, 404, 'Utilisateur introuvable', 'NOT_FOUND');

  const [images, customAvatars] = await Promise.all([
    db.filter('gallery', (row) => row.user_id === targetId),
    db.filter('avatars', (row) => row.user_id === targetId && row.is_default !== true),
  ]);
  for (const row of images) {
    if (row.filename) {
      fs.promises.unlink(path.join(GALLERY_DIR, path.basename(row.filename))).catch(() => {});
    }
  }
  for (const row of customAvatars) {
    if (row.url && row.url.startsWith('/uploads/avatars/')) {
      fs.promises.unlink(path.join(AVATARS_DIR, path.basename(row.url))).catch(() => {});
    }
  }

  const owned = ['settings', 'journal_entries', 'moods', 'plannings', 'routines', 'gallery', 'avatars'];
  for (const table of owned) {
    await db.remove(table, (row) => row.user_id === targetId);
  }
  await db.remove('users', (row) => row.id === targetId);

  return ok(res, null, `Compte de ${target.email} supprimé`);
});

const overview = asyncHandler(async (req, res) => {
  const [userRows, entryRows, moodRows, planRows, routineRows, galleryRows] = await Promise.all([
    db.getAll('users'),
    db.getAll('journal_entries'),
    db.getAll('moods'),
    db.getAll('plannings'),
    db.getAll('routines'),
    db.getAll('gallery'),
  ]);

  return ok(res, {
    users: userRows.length,
    admins: userRows.filter((u) => u.role === 'admin').length,
    journal_entries: entryRows.length,
    moods: moodRows.length,
    plannings: planRows.length,
    routines: routineRows.length,
    gallery: galleryRows.length,
  });
});

module.exports = { users, removeUser, overview };
