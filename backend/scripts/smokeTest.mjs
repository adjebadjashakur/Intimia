const BASE = process.env.API_BASE || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    failures.push(`${name} ${detail}`);
    console.log(`  FAIL ${name} ${detail}`);
  }
}

async function call(method, path, { token, body, headers = {}, raw } = {}) {
  const opts = { method, headers: { Accept: 'application/json', ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (raw) {
    opts.body = raw;
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function main() {
  const stamp = Date.now();
  const email = `test${stamp}@example.com`;

  console.log('\n— Health —');
  let r = await call('GET', '/health');
  check('health 200', r.status === 200 && r.data?.status === 'healthy', `status=${r.status}`);

  console.log('\n— Auth —');
  r = await call('POST', '/auth/register', { body: { name: 'Test User', email, password: 'secret123' } });
  check('register 201', r.status === 201 && r.data?.data?.token, `status=${r.status} ${JSON.stringify(r.data)}`);
  const token = r.data?.data?.token;
  const userId = r.data?.data?.user?.id;

  r = await call('POST', '/auth/register', { body: { name: 'Dup', email, password: 'secret123' } });
  check('register dup 409', r.status === 409, `status=${r.status}`);

  r = await call('POST', '/auth/register', { body: { name: 'Bad', email: 'bad@x.com', password: '123' } });
  check('register weak 400', r.status === 400, `status=${r.status}`);

  r = await call('POST', '/auth/login', { body: { email, password: 'nope' } });
  check('login bad 401', r.status === 401, `status=${r.status}`);

  r = await call('POST', '/auth/login', { body: { email, password: 'secret123' } });
  check('login 200', r.status === 200 && r.data?.data?.token, `status=${r.status}`);
  const loginToken = r.data?.data?.token;

  r = await call('GET', '/auth/me', { token });
  check('me 200', r.status === 200 && r.data?.data?.email === email, `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('GET', '/auth/me', { token: 'invalid' });
  check('me invalid 401', r.status === 401, `status=${r.status}`);

  r = await call('POST', '/auth/forgot-password', { body: { email } });
  check('forgot-password 200', r.status === 200, `status=${r.status}`);

  const badReset = await call('POST', '/auth/reset-password', { body: { token: 'x', password: 'abcdefgh' } });
  check('reset bad token 422', badReset.status === 422, `status=${badReset.status}`);

  const email2 = `reset${stamp}@example.com`;
  r = await call('POST', '/auth/register', { body: { name: 'Reset User', email: email2, password: 'oldpass123' } });
  check('register reset user', r.status === 201, `status=${r.status}`);
  const userId2 = r.data?.data?.user?.id;
  r = await call('POST', '/auth/forgot-password', { body: { email: email2 } });
  check('forgot-password 200 (user2)', r.status === 200, `status=${r.status}`);

  const fsMod = await import('node:fs');
  const logPath = process.env.API_LOG || '/tmp/intimia-api.log';
  if (fsMod.existsSync(logPath)) {
    const log = fsMod.readFileSync(logPath, 'utf8');
    const tokens = [...log.matchAll(/reset-password\?token=([a-f0-9]+)/g)];
    check('reset token logged', tokens.length > 0, 'token absent du log');
    const resetToken = tokens.length ? tokens[tokens.length - 1][1] : '';

    r = await call('POST', '/auth/reset-password', { body: { token: resetToken, email: email2, password: 'newpass456' } });
    check('reset-password 200', r.status === 200, `status=${r.status} ${JSON.stringify(r.data)}`);
    r = await call('POST', '/auth/login', { body: { email: email2, password: 'newpass456' } });
    check('login with reset password', r.status === 200, `status=${r.status}`);
    r = await call('POST', '/auth/login', { body: { email: email2, password: 'oldpass123' } });
    check('old password rejected', r.status === 401, `status=${r.status}`);
  } else {
    console.log(`  (skipped) flux reset-password : journal API introuvable (${logPath}) — lance le serveur avec : npm run dev > ${logPath} 2>&1`);
  }

  console.log('\n— Journal —');
  r = await call('POST', '/journal', { token, body: { title: 'Entrée 1', content: '<p>Contenu</p>', date: '2026-09-26' } });
  check('journal create 201', r.status === 201 && r.data?.data?.id, `status=${r.status} ${JSON.stringify(r.data)}`);
  const entryId = r.data?.data?.id;

  r = await call('POST', '/journal', { token, body: { content: 'x' } });
  check('journal no title 400', r.status === 400, `status=${r.status}`);

  r = await call('GET', '/journal', { token });
  check('journal list', r.status === 200 && r.data?.data?.entries?.length === 1 && r.data?.data?.pagination?.total === 1, `status=${r.status} ${JSON.stringify(r.data).slice(0, 200)}`);

  r = await call('PUT', `/journal/${entryId}`, { token, body: { title: 'Entrée modifiée' } });
  check('journal update 200', r.status === 200 && r.data?.data?.title === 'Entrée modifiée', `status=${r.status}`);

  r = await call('PUT', '/journal/jnl_00000000', { token, body: { title: 'x' } });
  check('journal update missing 404', r.status === 404, `status=${r.status}`);

  console.log('\n— Moods —');
  r = await call('POST', '/moods', { token, body: { mood: 'Heureuse', date: '2026-09-26' } });
  check('mood create 201', r.status === 201 && r.data?.data?.mood === 'Heureuse', `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('POST', '/moods', { token, body: { score: 4, note: 'ok', date: '2026-09-25' } });
  check('mood score create 201', r.status === 201 && r.data?.data?.score === 4, `status=${r.status}`);

  r = await call('POST', '/moods', { token, body: { score: 9, date: '2026-09-24' } });
  check('mood score invalid 400', r.status === 400, `status=${r.status}`);

  r = await call('GET', '/moods', { token });
  check('moods list', r.status === 200 && r.data?.data?.moods?.length === 2, `status=${r.status} ${JSON.stringify(r.data).slice(0, 200)}`);

  r = await call('POST', '/moods', { token, body: { mood: 'Sereine', date: '2026-09-26' } });
  check('mood upsert 200', r.status === 200 && r.data?.data?.mood === 'Sereine', `status=${r.status}`);

  console.log('\n— Planning —');
  r = await call('PUT', '/planning', { token, body: { plans: [{ date: '2026-09-26', content: 'Note du jour' }, { date: '2026-09-27', content: 'Autre note' }], start_date: '2026-09-21' } });
  check('planning put plans 200', r.status === 200 && r.data?.data?.length === 2, `status=${r.status} ${JSON.stringify(r.data).slice(0, 200)}`);

  r = await call('GET', '/planning?start_date=2026-09-21&end_date=2026-09-27', { token });
  check('planning list range', r.status === 200 && r.data?.data?.length === 2 && r.data?.data?.[0].content === 'Note du jour', `status=${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);

  r = await call('PUT', '/planning', { token, body: { items: [{ title: 'Réunion', description: 'Point équipe', date: '2026-09-26', time: '09:00', duration: 60 }] } });
  check('planning put items 201', r.status === 201 && r.data?.data?.[0]?.id, `status=${r.status} ${JSON.stringify(r.data).slice(0, 250)}`);
  const planId = r.data?.data?.[0]?.id;

  r = await call('PUT', '/planning', { token, body: { items: [{ id: planId, completed: true }] } });
  check('planning update item', r.status === 200 && r.data?.data?.[0]?.completed === true, `status=${r.status}`);

  r = await call('DELETE', `/planning/${planId}`, { token });
  check('planning delete', r.status === 200, `status=${r.status}`);

  console.log('\n— Routine —');
  r = await call('POST', '/routine', { token, body: { name: 'Boire de l\'eau', period: 'matin' } });
  check('routine create (frontend shape)', r.status === 201 && r.data?.data?.period === 'matin' && r.data?.data?.name === "Boire de l'eau", `status=${r.status} ${JSON.stringify(r.data)}`);
  const rutFrontend = r.data?.data?.id;

  r = await call('POST', '/routine', { token, body: { title: 'Lire 20 pages', description: 'Un chapitre', date: '2026-09-26' } });
  check('routine create (doc shape)', r.status === 201 && r.data?.data?.title === 'Lire 20 pages', `status=${r.status} ${JSON.stringify(r.data)}`);
  const rutDoc = r.data?.data?.id;

  r = await call('GET', '/routine', { token });
  check('routine list today', r.status === 200 && r.data?.data?.length === 2, `status=${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);

  r = await call('PATCH', `/routine/${rutFrontend}/toggle`, { token });
  check('routine toggle', r.status === 200 && r.data?.data?.completed === true, `status=${r.status}`);

  r = await call('DELETE', `/routine/${rutDoc}`, { token });
  check('routine delete', r.status === 200, `status=${r.status}`);

  console.log('\n— Galerie —');
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  let form = new FormData();
  form.append('photo', new Blob([png], { type: 'image/png' }), 'pixel.png');
  form.append('caption', 'Ma photo');
  form.append('category', 'paysage');
  r = await call('POST', '/gallery', { token, raw: form });
  check('gallery upload 201', r.status === 201 && r.data?.data?.url, `status=${r.status} ${JSON.stringify(r.data)}`);
  const galId = r.data?.data?.id;
  const galUrl = r.data?.data?.url;

  r = await call('GET', '/gallery', { token });
  check('gallery list', r.status === 200 && r.data?.data?.photos?.length === 1 && r.data?.data?.images?.length === 1, `status=${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);

  const imgRes = await fetch(`http://localhost:5000${galUrl}`);
  check('uploaded file served', imgRes.status === 200, `status=${imgRes.status}`);

  r = await call('PUT', `/gallery/${galId}`, { token, body: { caption: 'Légende modifiée' } });
  check('gallery update', r.status === 200 && r.data?.data?.caption === 'Légende modifiée', `status=${r.status}`);

  r = await call('DELETE', `/gallery/${galId}`, { token });
  check('gallery delete', r.status === 200, `status=${r.status}`);

  console.log('\n— Settings —');
  r = await call('GET', '/settings', { token });
  check('settings get', r.status === 200 && r.data?.data?.email === email && r.data?.data?.theme === 'light', `status=${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);

  r = await call('PUT', '/settings/profile', { token, body: { name: 'Renommé', theme: 'dark', language: 'fr' } });
  check('settings profile', r.status === 200 && r.data?.data?.name === 'Renommé' && r.data?.data?.theme === 'dark', `status=${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);

  r = await call('PUT', '/settings/notifications', { token, body: { email_notifications: 'true', journal_reminders: 'true' } });
  const notif = r.data?.data?.notifications;
  check('settings notifications', r.status === 200 && notif?.journal_reminders === 'true' && notif?.email === true, `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('GET', '/settings', { token });
  check('settings notifications persisted', r.data?.data?.notifications?.journal_reminders === 'true', JSON.stringify(r.data?.data?.notifications));

  r = await call('PUT', '/settings/password', { token, body: { currentPassword: 'wrong', newPassword: 'newsecret1' } });
  check('password wrong 401', r.status === 401, `status=${r.status}`);

  r = await call('PUT', '/settings/password', { token, body: { currentPassword: 'secret123', newPassword: 'newsecret1' } });
  check('password change 200', r.status === 200, `status=${r.status}`);

  r = await call('POST', '/auth/login', { body: { email, password: 'newsecret1' } });
  check('login with new password', r.status === 200, `status=${r.status}`);

  console.log('\n— Avatars —');
  r = await call('GET', '/avatars', { token });
  check('avatars list', r.status === 200 && r.data?.data?.avatars?.length >= 10 && r.data?.data?.current, `status=${r.status} ${JSON.stringify(r.data).slice(0, 250)}`);

  r = await call('PUT', '/avatars/select', { token, body: { avatar: '/avatars/av3.svg' } });
  check('avatar select by url', r.status === 200 && r.data?.data?.avatarUrl === '/avatars/av3.svg', `status=${r.status}`);

  r = await call('PUT', '/avatars/select', { token, body: { avatarId: 'avt_5' } });
  check('avatar select by id (doc)', r.status === 200 && r.data?.data?.avatarUrl === '/avatars/av5.svg', `status=${r.status} ${JSON.stringify(r.data)}`);

  form = new FormData();
  form.append('avatar', new Blob([png], { type: 'image/png' }), 'me.png');
  r = await call('POST', '/avatars/upload', { token, raw: form });
  check('avatar upload', r.status === 200 && r.data?.data?.avatarUrl?.startsWith('/uploads/avatars/'), `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('PUT', '/avatars/select', { token, body: { avatar: r.data?.data?.avatarUrl } });
  check('avatar select custom', r.status === 200, `status=${r.status}`);

  console.log('\n— Dashboard —');
  r = await call('GET', '/dashboard/stats', { token });
  const d = r.data?.data;
  check('dashboard stats', r.status === 200 && d?.stats?.entries_count >= 1 && d?.stats?.photos_count >= 0 && Array.isArray(d?.recent_entries), `status=${r.status} ${JSON.stringify(d).slice(0, 400)}`);

  console.log('\n— Admin —');
  r = await call('POST', '/auth/login', { body: { email: 'admin@intimia.app', password: 'Admin123!' } });
  check('admin login', r.status === 200 && r.data?.data?.user?.role === 'admin', `status=${r.status} ${JSON.stringify(r.data).slice(0, 250)}`);
  const adminToken = r.data?.data?.token;

  r = await call('GET', '/admin/stats', { token: adminToken });
  check('admin stats', r.status === 200 && r.data?.data?.users >= 2, `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('GET', '/admin/users', { token: adminToken });
  check('admin users list', r.status === 200 && r.data?.data?.users?.length >= 2, `status=${r.status}`);

  r = await call('GET', '/admin/users', { token });
  check('admin route forbidden for user 403', r.status === 403, `status=${r.status}`);

  r = await call('DELETE', `/admin/users/${userId}`, { token: adminToken });
  check('admin delete user', r.status === 200, `status=${r.status} ${JSON.stringify(r.data)}`);

  r = await call('DELETE', `/admin/users/${userId2}`, { token: adminToken });
  check('cleanup user2', r.status === 200, `status=${r.status}`);

  r = await call('POST', '/auth/login', { body: { email, password: 'newsecret1' } });
  check('deleted user cannot login 401', r.status === 401, `status=${r.status}`);

  console.log('\n— Connexion / logout —');
  r = await call('POST', '/auth/logout', { token: adminToken });
  check('logout 200', r.status === 200, `status=${r.status}`);

  r = await call('GET', '/nope');
  check('404 route', r.status === 404, `status=${r.status}`);

  console.log(`\n${passed} réussis, ${failed} échoués\n`);
  if (failed) {
    console.log('Échecs :');
    for (const f of failures) console.log(` - ${f}`);
  }
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
