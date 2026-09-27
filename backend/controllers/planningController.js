const db = require('../services/excelService');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, today } = require('../utils/id');

function publicPlan(row) {
  return {
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    title: row.title || '',
    description: row.description || '',
    content: row.content || row.description || row.title || '',
    text: row.content || row.description || row.title || '',
    planned_date: row.date,
    date: row.date,
    time: row.time || '',
    duration: row.duration === '' ? null : row.duration,
    completed: row.completed === true,
    created_at: row.created_at,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function weekRange(week) {
  const match = /^(\d{4})-W(\d{2})$/.exec(String(week));
  if (!match) return null;
  const year = Number(match[1]);
  const weekNum = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNum - 1) * 7);
  const start = monday.toISOString().split('T')[0];
  const end = new Date(monday.getTime() + 6 * 86400000).toISOString().split('T')[0];
  return { start, end };
}

const list = asyncHandler(async (req, res) => {
  const { date, start_date, end_date, week } = req.query;
  let rows = await db.filter('plannings', (r) => r.user_id === req.userId);

  if (date) {
    const target = String(date).split('T')[0];
    rows = rows.filter((r) => r.date === target);
  }

  if (start_date || end_date) {
    const start = start_date ? String(start_date).split('T')[0] : null;
    const end = end_date ? String(end_date).split('T')[0] : null;
    rows = rows.filter((r) => (!start || r.date >= start) && (!end || r.date <= end));
  }

  if (week) {
    const range = weekRange(week);
    if (range) rows = rows.filter((r) => r.date >= range.start && r.date <= range.end);
  }

  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time).localeCompare(String(b.time)));
  return ok(res, rows.map(publicPlan));
});

const upsert = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const now = nowISO();

  if (Array.isArray(body.plans)) {
    const results = [];
    for (const plan of body.plans) {
      if (!plan || !plan.date) return fail(res, 400, 'Chaque plan doit avoir une date', 'VALIDATION');
      const day = String(plan.date).split('T')[0];
      const content = plan.content !== undefined ? plan.content : plan.text || '';
      const existing = await db.findOne('plannings', (r) => r.user_id === req.userId && r.date === day);

      if (existing) {
        const updated = await db.update('plannings', (r) => r.id === existing.id, {
          content,
          updated_at: now,
        });
        results.push(publicPlan(updated));
      } else {
        const row = {
          id: genId('plan'),
          user_id: req.userId,
          title: plan.title || '',
          description: plan.description || '',
          content,
          date: day,
          time: plan.time || '',
          duration: plan.duration || '',
          completed: plan.completed === true,
          created_at: now,
          updated_at: now,
        };
        await db.insert('plannings', row);
        results.push(publicPlan(row));
      }
    }
    return ok(res, results, 'Planning mis à jour avec succès');
  }

  if (Array.isArray(body.items)) {
    const results = [];
    let createdAny = false;
    for (const item of body.items) {
      if (!item) return fail(res, 400, 'Élément de planning invalide', 'VALIDATION');

      if (item.id) {
        const existing = await db.findById('plannings', item.id);
        if (!existing) return fail(res, 404, 'Élément de planning introuvable', 'NOT_FOUND');
        if (existing.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

        const patch = { updated_at: now };
        if (item.title !== undefined) patch.title = item.title;
        if (item.description !== undefined) patch.description = item.description;
        if (item.content !== undefined) patch.content = item.content;
        if (item.date !== undefined) patch.date = String(item.date).split('T')[0];
        if (item.time !== undefined) patch.time = item.time;
        if (item.duration !== undefined) patch.duration = item.duration;
        if (item.completed !== undefined) patch.completed = item.completed === true;

        const updated = await db.update('plannings', (r) => r.id === existing.id, patch);
        results.push(publicPlan(updated));
        continue;
      }

      if (!item.title || !String(item.title).trim()) {
        return fail(res, 400, 'Le titre est requis', 'VALIDATION');
      }
      if (!item.date) return fail(res, 400, 'La date est requise', 'VALIDATION');

      const row = {
        id: genId('plan'),
        user_id: req.userId,
        title: String(item.title).trim(),
        description: item.description || '',
        content: item.content || item.description || String(item.title).trim(),
        date: String(item.date).split('T')[0],
        time: item.time || '',
        duration: item.duration || '',
        completed: item.completed === true,
        created_at: now,
        updated_at: now,
      };
      await db.insert('plannings', row);
      results.push(publicPlan(row));
      createdAny = true;
    }
    return createdAny
      ? created(res, results, 'Planning mis à jour avec succès')
      : ok(res, results, 'Planning mis à jour avec succès');
  }

  return fail(res, 400, 'Le corps de la requête doit contenir "items" ou "plans"', 'VALIDATION');
});

const remove = asyncHandler(async (req, res) => {
  const row = await db.findById('plannings', req.params.id);
  if (!row) return fail(res, 404, 'Élément de planning introuvable', 'NOT_FOUND');
  if (row.user_id !== req.userId) return fail(res, 403, 'Accès interdit', 'FORBIDDEN');

  await db.remove('plannings', (r) => r.id === row.id);
  return ok(res, null, 'Élément supprimé avec succès');
});

module.exports = { list, upsert, remove };
