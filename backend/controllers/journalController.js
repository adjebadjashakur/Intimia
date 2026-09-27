const db = require('../services/excelService');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, today } = require('../utils/id');

function publicEntry(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    title: row.title,
    content: row.content,
    date: row.date,
    mood: row.mood || null,
    font_family: row.font_family || '',
    font_size: row.font_size || 16,
    text_color: row.text_color || '#000000',
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function isOwner(row, userId) {
  return row.user_id === userId;
}

const list = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  let rows = await db.filter('journal_entries', (r) => r.user_id === req.userId);
  if (date) rows = rows.filter((r) => String(r.date).split('T')[0] === date);

  rows.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  const total = rows.length;
  const start = (page - 1) * limit;
  const paged = rows.slice(start, start + limit);

  return ok(res, {
    entries: paged.map(publicEntry),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

const create = asyncHandler(async (req, res) => {
  const { title, content, date, mood, font_family, font_size, text_color } = req.body || {};
  if (!title || !String(title).trim()) return fail(res, 400, 'Titre requis', 'VALIDATION');
  if (content === undefined || content === null) return fail(res, 400, 'Contenu requis', 'VALIDATION');

  const now = nowISO();
  const row = {
    id: genId('jnl'),
    user_id: req.userId,
    title: String(title).trim(),
    content: String(content),
    date: date ? String(date).split('T')[0] : today(),
    mood: mood || '',
    font_family: font_family || 'Quicksand',
    font_size: Number(font_size) || 16,
    text_color: text_color || '#000000',
    created_at: now,
    updated_at: now,
  };

  await db.insert('journal_entries', row);
  return created(res, publicEntry(row), 'Entrée créée avec succès');
});

const update = asyncHandler(async (req, res) => {
  const row = await db.findById('journal_entries', req.params.id);
  if (!row) return fail(res, 404, 'Entrée introuvable', 'NOT_FOUND');
  if (!isOwner(row, req.userId)) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  const { title, content, date, mood, font_family, font_size, text_color } = req.body || {};
  const patch = { updated_at: nowISO() };
  if (title !== undefined) patch.title = String(title).trim();
  if (content !== undefined) patch.content = String(content);
  if (date !== undefined) patch.date = String(date).split('T')[0];
  if (mood !== undefined) patch.mood = mood || '';
  if (font_family !== undefined) patch.font_family = font_family;
  if (font_size !== undefined) patch.font_size = Number(font_size) || 16;
  if (text_color !== undefined) patch.text_color = text_color;

  const updated = await db.update('journal_entries', (r) => r.id === row.id, patch);
  return ok(res, publicEntry(updated), 'Entrée mise à jour avec succès');
});

const remove = asyncHandler(async (req, res) => {
  const row = await db.findById('journal_entries', req.params.id);
  if (!row) return fail(res, 404, 'Entrée introuvable', 'NOT_FOUND');
  if (!isOwner(row, req.userId)) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  await db.remove('journal_entries', (r) => r.id === row.id);
  return ok(res, null, 'Entrée supprimée avec succès');
});

module.exports = { list, create, update, remove };
