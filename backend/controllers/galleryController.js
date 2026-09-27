const fs = require('fs');
const path = require('path');
const db = require('../services/excelService');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, today } = require('../utils/id');
const { pickFile } = require('../middleware/upload');
const { GALLERY_DIR } = require('../config/database');

function publicImage(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    url: row.url,
    photo_url: row.url,
    image: row.url,
    filename: row.filename,
    caption: row.caption || '',
    category: row.category || '',
    date: row.date,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  let rows = await db.filter('gallery', (r) => r.user_id === req.userId);
  if (category) rows = rows.filter((r) => String(r.category).toLowerCase() === String(category).toLowerCase());

  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = rows.length;
  const paged = rows.slice((page - 1) * limit, (page - 1) * limit + limit).map(publicImage);

  return ok(res, {
    photos: paged,
    images: paged,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

const create = asyncHandler(async (req, res) => {
  const file = pickFile(req, ['photo', 'image', 'gallery']);
  if (!file) return fail(res, 400, 'Aucun fichier image envoyé', 'VALIDATION');

  const now = nowISO();
  const row = {
    id: genId('gal'),
    user_id: req.userId,
    url: `/uploads/gallery/${file.filename}`,
    filename: file.filename,
    caption: (req.body && req.body.caption) || '',
    category: (req.body && req.body.category) || '',
    date: today(),
    created_at: now,
    updated_at: now,
  };

  await db.insert('gallery', row);
  return created(res, publicImage(row), 'Image ajoutée avec succès');
});

const update = asyncHandler(async (req, res) => {
  const row = await db.findById('gallery', req.params.id);
  if (!row) return fail(res, 404, 'Image introuvable', 'NOT_FOUND');
  if (row.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  const { caption, category } = req.body || {};
  const patch = { updated_at: nowISO() };
  if (caption !== undefined) patch.caption = caption || '';
  if (category !== undefined) patch.category = category || '';

  const updated = await db.update('gallery', (r) => r.id === row.id, patch);
  return ok(res, publicImage(updated), 'Image mise à jour avec succès');
});

const remove = asyncHandler(async (req, res) => {
  const row = await db.findById('gallery', req.params.id);
  if (!row) return fail(res, 404, 'Image introuvable', 'NOT_FOUND');
  if (row.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  if (row.filename) {
    const target = path.join(GALLERY_DIR, path.basename(row.filename));
    fs.promises.unlink(target).catch(() => {});
  }

  await db.remove('gallery', (r) => r.id === row.id);
  return ok(res, null, 'Image supprimée avec succès');
});

module.exports = { list, create, update, remove };
