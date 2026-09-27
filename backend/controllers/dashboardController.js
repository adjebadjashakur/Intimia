const db = require('../services/excelService');
const { ok, asyncHandler } = require('../utils/http');

function dayKey(date) {
  return new Date(date).toISOString().split('T')[0];
}

function isoWeekStart(base = new Date()) {
  const d = new Date(`${dayKey(base)}T00:00:00.000Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return dayKey(d);
}

function monthStart(base = new Date()) {
  return `${dayKey(base).slice(0, 7)}-01`;
}

function computeStreak(dates) {
  const set = new Set(dates.filter(Boolean));
  if (set.size === 0) return 0;

  const today = new Date(`${dayKey(new Date())}T00:00:00.000Z`);
  let cursor = new Date(today);
  if (!set.has(dayKey(cursor))) {
    cursor = new Date(today.getTime() - 86400000);
    if (!set.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

const stats = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const today = dayKey(new Date());
  const weekStart = isoWeekStart();
  const monthStartStr = monthStart();
  const last7Start = dayKey(new Date(Date.now() - 6 * 86400000));

  const [journalRows, moodRows, planRows, routineRows, galleryRows] = await Promise.all([
    db.filter('journal_entries', (r) => r.user_id === userId),
    db.filter('moods', (r) => r.user_id === userId),
    db.filter('plannings', (r) => r.user_id === userId),
    db.filter('routines', (r) => r.user_id === userId),
    db.filter('gallery', (r) => r.user_id === userId),
  ]);

  journalRows.sort((a, b) => String(b.date || b.created_at).localeCompare(String(a.date || a.created_at)));
  moodRows.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const journalWeek = journalRows.filter((r) => String(r.date) >= weekStart && String(r.date) <= today);
  const journalMonth = journalRows.filter((r) => String(r.date) >= monthStartStr && String(r.date) <= today);
  const lastEntry = journalRows[0] || null;

  const scores = moodRows
    .map((m) => Number(m.score))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 5);
  const averageScore = scores.length
    ? Math.round((scores.reduce((sum, n) => sum + n, 0) / scores.length) * 10) / 10
    : 0;

  const moodLast7 = moodRows
    .filter((m) => String(m.date) >= last7Start)
    .map((m) => ({ date: m.date, score: Number(m.score) || null, mood: m.mood || null }));

  const plansToday = planRows.filter((p) => p.date === today);
  const plansWeek = planRows.filter((p) => p.date >= weekStart && p.date <= today);

  const routinesToday = routineRows.filter((r) => r.date === today);
  const routinesWeek = routineRows.filter((r) => r.date >= last7Start && r.date <= today);
  const routineCompletedToday = routinesToday.filter((r) => r.completed === true).length;
  const weekCompleted = routinesWeek.filter((r) => r.completed === true).length;
  const completionRate = routinesWeek.length
    ? Math.round((weekCompleted / routinesWeek.length) * 100) / 100
    : 0;

  const galleryMonth = galleryRows.filter((g) => String(g.created_at || '').slice(0, 10) >= monthStartStr);
  const categoryMap = {};
  for (const row of galleryRows) {
    const key = row.category || 'Autre';
    categoryMap[key] = (categoryMap[key] || 0) + 1;
  }

  const todayMoodRow = moodRows.find((m) => m.date === today) || null;

  const data = {
    stats: {
      entries_count: journalRows.length,
      entriesCount: journalRows.length,
      photos_count: galleryRows.length,
      photosCount: galleryRows.length,
      moods_count: moodRows.length,
      routines_count: routinesToday.length,
      routine_progress: {
        total: routinesToday.length,
        checked: routineCompletedToday,
      },
      routine_progress_pct: routinesToday.length
        ? Math.round((routineCompletedToday / routinesToday.length) * 100)
        : 0,
    },
    today_mood: todayMoodRow
      ? {
        date: todayMoodRow.date,
        mood: todayMoodRow.mood,
        label: todayMoodRow.mood,
        name: todayMoodRow.mood,
        score: Number(todayMoodRow.score) || null,
      }
      : null,
    recent_entries: journalRows.slice(0, 5).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      date: row.date,
      created_at: row.created_at,
    })),
    journal: {
      totalEntries: journalRows.length,
      thisWeek: journalWeek.length,
      thisMonth: journalMonth.length,
      lastEntry: lastEntry
        ? { id: lastEntry.id, title: lastEntry.title, date: lastEntry.date }
        : null,
    },
    moods: {
      averageScore,
      thisWeek: moodLast7,
      totalEntries: moodRows.length,
    },
    planning: {
      todayTotal: plansToday.length,
      todayCompleted: plansToday.filter((p) => p.completed === true).length,
      todayPending: plansToday.filter((p) => p.completed !== true).length,
      thisWeekTotal: plansWeek.length,
      thisWeekCompleted: plansWeek.filter((p) => p.completed === true).length,
    },
    routine: {
      todayTotal: routinesToday.length,
      todayCompleted: routineCompletedToday,
      streak: computeStreak(routineRows.filter((r) => r.completed === true).map((r) => r.date)),
      completionRate,
    },
    gallery: {
      totalImages: galleryRows.length,
      thisWeek: galleryRows.filter((g) => String(g.created_at || '').slice(0, 10) >= last7Start).length,
      thisMonth: galleryMonth.length,
      categories: Object.entries(categoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    },
    streaks: {
      journal: computeStreak(journalRows.map((r) => r.date)),
      moods: computeStreak(moodRows.map((m) => m.date)),
      routine: computeStreak(routineRows.filter((r) => r.completed === true).map((r) => r.date)),
    },
  };

  return ok(res, data);
});

module.exports = { stats };
