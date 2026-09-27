const fs = require('fs');
const path = require('path');
const db = require('../services/excelService');
const { ok, fail, asyncHandler } = require('../utils/http');
const { nowISO } = require('../utils/id');
const { pickFile } = require('../middleware/upload');
const { AVATARS_DIR } = require('../config/database');

const BUILTIN_AVATARS = Array.from({ length: 10 }, (_, i) => ({
  id: `avt_${i + 1}`,
  url: `/avatars/av${i + 1}.svg`,
  name: `Avatar ${i + 1}`,
  isDefault: true,
}));

async function defaultAvatars() {
  const rows = await db.filter('avatars', (r) => r.is_default === true || r.is_default === 'true');
  if (rows.length === 0) return BUILTIN_AVATARS;
  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    name: row.name || 'Avatar',
    isDefault: true,
  }));
}

async function customAvatars(userId) {
  const rows = await db.filter(
    'avatars',
    (r) => r.user_id === userId && r.is_default !== true && r.is_default !== 'true'
  );
  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    name: row.name || 'Avatar personnalisé',
    isDefault: false,
  }));
}

const list = asyncHandler(async (req, res) => {
  const [defaults, custom] = await Promise.all([defaultAvatars(), customAvatars(req.userId)]);
  const avatars = [...defaults, ...custom];
  const current = req.user.avatar || defaults[0].url;
  const currentDefault = defaults.find((a) => a.url === current);

  return ok(res, {
    avatars,
    current,
    currentAvatar: currentDefault ? currentDefault.id : current,
  });
});

const select = asyncHandler(async (req, res) => {
  const { avatar, avatarId, avatar_id } = req.body || {};
  const requested = avatarId || avatar_id || avatar;
  if (!requested) return fail(res, 400, 'Avatar ID manquant', 'VALIDATION');

  const raw = String(requested);
  const [defaults, custom] = await Promise.all([defaultAvatars(), customAvatars(req.userId)]);

  const asDefault = defaults.find((a) => a.id === raw || a.url === raw);
  if (asDefault) {
    await db.update('users', (u) => u.id === req.userId, { avatar: asDefault.url, updated_at: nowISO() });
    return ok(res, { avatarId: asDefault.id, avatarUrl: asDefault.url, avatar: asDefault.url }, 'Avatar mis à jour avec succès');
  }

  const asCustom = custom.find((a) => a.id === raw || a.url === raw);
  if (asCustom) {
    await db.update('users', (u) => u.id === req.userId, { avatar: asCustom.url, updated_at: nowISO() });
    return ok(res, { avatarId: asCustom.id, avatarUrl: asCustom.url, avatar: asCustom.url }, 'Avatar mis à jour avec succès');
  }

  return fail(res, 404, 'Avatar introuvable', 'NOT_FOUND');
});

const upload = asyncHandler(async (req, res) => {
  const file = pickFile(req, ['avatar', 'photo', 'image']);
  if (!file) return fail(res, 400, 'Aucun fichier envoyé', 'VALIDATION');

  const url = `/uploads/avatars/${file.filename}`;
  const now = nowISO();

  const existing = await db.findOne('avatars', (r) => r.user_id === req.userId && r.is_default !== true);
  if (existing) {
    if (existing.url && existing.url.startsWith('/uploads/avatars/') && existing.url !== url) {
      fs.promises.unlink(path.join(AVATARS_DIR, path.basename(existing.url))).catch(() => {});
    }
    await db.update('avatars', (r) => r.id === existing.id && r.user_id === req.userId, { url, name: 'Avatar personnalisé' });
  } else {
    await db.insert('avatars', {
      id: req.userId,
      user_id: req.userId,
      url,
      name: 'Avatar personnalisé',
      is_default: false,
      created_at: now,
    });
  }

  await db.update('users', (u) => u.id === req.userId, { avatar: url, updated_at: now });

  return ok(res, {
    avatarId: req.userId,
    avatarUrl: url,
    avatar: url,
    avatar_url: url,
  }, 'Avatar uploadé avec succès');
});

module.exports = { list, select, upload, BUILTIN_AVATARS };
