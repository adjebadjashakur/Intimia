require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const db = require('./services/excelService');
const { authenticate, requireAdmin } = require('./middleware/auth');
const { errorMiddleware } = require('./utils/http');
const { ROOT_DIR, DATA_DIR, TABLES, AVATARS_DIR, GALLERY_DIR } = require('./config/database');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));

app.use((req, res, next) => {
  if (NODE_ENV !== 'test') {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/journal', authenticate, require('./routes/journal'));
app.use('/api/moods', authenticate, require('./routes/moods'));
app.use('/api/planning', authenticate, require('./routes/planning'));
app.use('/api/routine', authenticate, require('./routes/routine'));
app.use('/api/gallery', authenticate, require('./routes/gallery'));
app.use('/api/settings', authenticate, require('./routes/settings'));
app.use('/api/avatars', authenticate, require('./routes/avatars'));
app.use('/api/dashboard', authenticate, require('./routes/dashboard'));
app.use('/api/admin', authenticate, requireAdmin, require('./routes/admin'));
app.use('/api/health', require('./routes/health'));

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Route API introuvable', code: 'NOT_FOUND' });
});

const distDir = path.join(ROOT_DIR, '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(errorMiddleware);

function bootstrapData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
  fs.mkdirSync(GALLERY_DIR, { recursive: true });

  for (const table of Object.keys(TABLES)) {
    db.ensure(table);
  }
}

bootstrapData();

app.listen(PORT, () => {
  const files = db.status();
  const missing = Object.entries(files).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(`\n  Intimia API démarrée sur http://localhost:${PORT}`);
  console.log(`  Environnement : ${NODE_ENV}`);
  console.log(`  Base Excel    : ${DATA_DIR}`);
  if (missing.length) {
    console.log(`  Tables manquantes : ${missing.join(', ')} — lance "npm run init"`);
  }
  console.log('');
});

module.exports = app;
