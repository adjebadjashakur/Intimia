require('dotenv').config();

const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('../services/excelService');
const { TABLES, DATA_DIR, AVATARS_DIR, GALLERY_DIR, DEFAULT_SETTINGS } = require('../config/database');
const { genId, nowISO } = require('../utils/id');
const { BUILTIN_AVATARS } = require('../controllers/avatarsController');

async function seedAvatars() {
  const existing = await db.filter('avatars', (r) => r.is_default === true || r.is_default === 'true');
  if (existing.length >= BUILTIN_AVATARS.length) return 0;

  const known = new Set(existing.map((r) => r.url));
  let added = 0;
  for (const avatar of BUILTIN_AVATARS) {
    if (known.has(avatar.url)) continue;
    await db.insert('avatars', {
      id: avatar.id,
      user_id: '',
      url: avatar.url,
      name: avatar.name,
      is_default: true,
      created_at: nowISO(),
    });
    added += 1;
  }
  return added;
}

async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || 'admin@intimia.app').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Super Admin';

  const existing = await db.findOne('users', (u) => String(u.email).toLowerCase() === email);
  if (existing) {
    if (existing.role !== 'admin') {
      await db.update('users', (u) => u.id === existing.id, { role: 'admin', updated_at: nowISO() });
    }
    return { created: false, email: existing.email };
  }

  const now = nowISO();
  const user = {
    id: genId('usr'),
    name,
    email,
    password: await bcrypt.hash(password, 10),
    avatar: '/avatars/av1.svg',
    role: 'admin',
    reset_token: '',
    reset_expires: '',
    created_at: now,
    updated_at: now,
  };

  await db.insert('users', user);
  await db.insert('settings', {
    user_id: user.id,
    ...DEFAULT_SETTINGS,
    notifications: { ...DEFAULT_SETTINGS.notifications },
    created_at: now,
    updated_at: now,
  });

  return { created: true, email: user.email };
}

async function main() {
  console.log('\n  Initialisation de la base Intimia (Excel)\n');

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
  fs.mkdirSync(GALLERY_DIR, { recursive: true });

  const tables = Object.keys(TABLES);
  for (const table of tables) {
    db.ensure(table);
    console.log(`  ✔ ${TABLES[table].file}`);
  }

  const avatars = await seedAvatars();
  console.log(`\n  Avatars par défaut ajoutés : ${avatars}`);

  const admin = await seedAdmin();
  console.log(`  Super-admin : ${admin.created ? 'créé' : 'déjà présent'} (${admin.email})`);
  console.log(`  Mot de passe admin : ${process.env.ADMIN_PASSWORD || 'Admin123!'}\n`);
  console.log('  Base initialisée.\n');
}

main().catch((err) => {
  console.error(' Échec de l\'initialisation :', err);
  process.exit(1);
});
