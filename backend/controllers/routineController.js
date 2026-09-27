const db = require('../services/excelService');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, today } = require('../utils/id');

const PERIODS = ['matin', 'soir'];

function publicRoutine(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    name: row.name || row.title || '',
    title: row.name || row.title || '',
    description: row.description || '',
    period: row.period || 'matin',
    type: row.period || 'matin',
    completed: row.completed === true,
    is_completed: row.completed === true,
    date: row.date,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const { date, completed } = req.query;
  let rows = await db.filter('routines', (r) => r.user_id === req.userId);

  if (date && date !== 'all') {
    const target = String(date).split('T')[0];
    rows = rows.filter((r) => r.date === target);
  } else if (!date) {
    rows = rows.filter((r) => r.date === today());
  }
  if (completed !== undefined && completed !== '') {
    const wanted = completed === 'true' || completed === true;
    rows = rows.filter((r) => (r.completed === true) === wanted);
  }

  rows.sort((a, b) => String(a.period || '').localeCompare(String(b.period || '')) || String(a.created_at).localeCompare(String(b.created_at)));
  return ok(res, rows.map(publicRoutine));
});

const create = asyncHandler(async (req, res) => {
  const { title, name, description, date, period, type } = req.body || {};
  const label = title || name;
  if (!label || !String(label).trim()) return fail(res, 400, 'Le titre est requis', 'VALIDATION');

  const rawPeriod = period || type || 'matin';
  const normalizedPeriod = PERIODS.includes(String(rawPeriod).toLowerCase())
    ? String(rawPeriod).toLowerCase()
    : 'matin';

  const now = nowISO();
  const row = {
    id: genId('rut'),
    user_id: req.userId,
    name: String(label).trim(),
    description: description || '',
    period: normalizedPeriod,
    completed: false,
    date: date ? String(date).split('T')[0] : today(),
    created_at: now,
    updated_at: now,
  };

  await db.insert('routines', row);
  return created(res, publicRoutine(row), 'Routine créée avec succès');
});

const toggle = asyncHandler(async (req, res) => {
  const row = await db.findById('routines', req.params.id);
  if (!row) return fail(res, 404, 'Routine introuvable', 'NOT_FOUND');
  if (row.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  const updated = await db.update('routines', (r) => r.id === row.id, {
    completed: row.completed !== true,
    updated_at: nowISO(),
  });

  return ok(res, publicRoutine(updated), 'État de la routine mis à jour');
});

const remove = asyncHandler(async (req, res) => {
  const row = await db.findById('routines', req.params.id);
  if (!row) return fail(res, 404, 'Routine introuvable', 'NOT_FOUND');
  if (row.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  await db.remove('routines', (r) => r.id === row.id);
  return ok(res, null, 'Routine supprimée avec succès');
});

module.exports = { list, create, toggle, remove };
