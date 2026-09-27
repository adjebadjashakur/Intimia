const db = require('../services/excelService');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, today } = require('../utils/id');

function publicMood(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    mood: row.mood || '',
    score: row.score === '' || row.score === null ? null : row.score,
    note: row.note || '',
    date: row.date,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const rows = await db.filter('moods', (r) => r.user_id === req.userId);
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return ok(res, { moods: rows.map(publicMood), total: rows.length });
});

const create = asyncHandler(async (req, res) => {
  const { mood, score, note, date } = req.body || {};
  const day = date ? String(date).split('T')[0] : today();

  const hasScore = score !== undefined && score !== null && score !== '';
  const hasMood = mood !== undefined && mood !== null && String(mood).trim() !== '';

  if (!hasScore && !hasMood) {
    return fail(res, 400, 'Une humeur (mood) ou un score est requis', 'VALIDATION');
  }

  let parsedScore = null;
  if (hasScore) {
    parsedScore = Number(score);
    if (Number.isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
      return fail(res, 400, 'Le score doit être un nombre entre 1 et 5', 'VALIDATION');
    }
  }

  const now = nowISO();
  const existing = await db.findOne('moods', (r) => r.user_id === req.userId && r.date === day);

  if (existing) {
    const patch = { updated_at: now };
    if (hasMood) patch.mood = String(mood).trim();
    if (hasScore) patch.score = parsedScore;
    if (note !== undefined) patch.note = note || '';
    const updated = await db.update('moods', (r) => r.id === existing.id, patch);
    return ok(res, publicMood(updated), 'Humeur mise à jour avec succès');
  }

  const row = {
    id: genId('mood'),
    user_id: req.userId,
    mood: hasMood ? String(mood).trim() : '',
    score: parsedScore === null ? '' : parsedScore,
    note: note || '',
    date: day,
    created_at: now,
    updated_at: now,
  };

  await db.insert('moods', row);
  return created(res, publicMood(row), 'Humeur enregistrée avec succès');
});

module.exports = { list, create };
