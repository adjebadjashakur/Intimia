const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AVATARS_DIR, GALLERY_DIR } = require('../config/database');
const { fail } = require('../utils/http');

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

function ensureDirs() {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    ensureDirs();
    cb(null, file.fieldname === 'avatar' ? AVATARS_DIR : GALLERY_DIR);
  },
  filename(req, file, cb) {
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname) || '.jpg';
    const base = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    cb(null, `${base}${ext}`);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES[file.mimetype]) {
      const err = new Error('Format de fichier non supporté (JPEG, PNG, GIF, WebP attendus)');
      err.status = 400;
      return cb(err);
    }
    return cb(null, true);
  },
});

function handleUpload(maxSizeMB) {
  const mw = uploader.any();
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (!err) return next();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return fail(res, 413, `Fichier trop volumineux (max ${maxSizeMB} MB)`, 'FILE_TOO_LARGE');
      }
      return fail(res, err.status || 400, err.message || 'Erreur lors de l\'upload', 'UPLOAD_ERROR');
    });
  };
}

function pickFile(req, fieldNames) {
  if (!req.files || req.files.length === 0) return null;
  return req.files.find((f) => fieldNames.includes(f.fieldname)) || req.files[0];
}

module.exports = { handleUpload, pickFile, ALLOWED_TYPES };
