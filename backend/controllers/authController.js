const bcrypt = require('bcryptjs');
const db = require('../services/excelService');
const { signToken } = require('../middleware/auth');
const { ok, created, fail, asyncHandler } = require('../utils/http');
const { genId, nowISO, randomToken } = require('../utils/id');
const { DEFAULT_SETTINGS } = require('../config/database');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '/avatars/av1.svg',
    role: user.role || 'user',
    created_at: user.created_at,
    createdAt: user.created_at,
    updated_at: user.updated_at,
  };
}

function createSettings(userId) {
  return db.insert('settings', {
    user_id: userId,
    ...DEFAULT_SETTINGS,
    notifications: { ...DEFAULT_SETTINGS.notifications },
    created_at: nowISO(),
    updated_at: nowISO(),
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return fail(res, 400, 'Nom, email et mot de passe sont requis', 'VALIDATION');
  }
  if (String(name).trim().length < 2) return fail(res, 400, 'Nom trop court', 'VALIDATION');
  if (!EMAIL_RE.test(String(email))) return fail(res, 400, 'Adresse email invalide', 'VALIDATION');
  if (String(password).length < 6) {
    return fail(res, 400, 'Le mot de passe doit contenir au moins 6 caractères', 'VALIDATION');
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await db.findOne('users', (u) => String(u.email).toLowerCase() === normalizedEmail);
  if (existing) return fail(res, 409, 'Un compte avec cet email existe déjà', 'EMAIL_TAKEN');

  const now = nowISO();
  const user = {
    id: genId('usr'),
    name: String(name).trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(String(password), 10),
    avatar: '/avatars/av1.svg',
    role: 'user',
    reset_token: '',
    reset_expires: '',
    created_at: now,
    updated_at: now,
  };

  await db.insert('users', user);
  await createSettings(user.id);

  const token = signToken(user.id);
  return created(res, { user: publicUser(user), token }, 'Compte créé avec succès');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return fail(res, 400, 'Email et mot de passe requis', 'VALIDATION');

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await db.findOne('users', (u) => String(u.email).toLowerCase() === normalizedEmail);
  if (!user) return fail(res, 401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');

  const match = await bcrypt.compare(String(password), user.password);
  if (!match) return fail(res, 401, 'Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');

  const token = signToken(user.id);
  return ok(res, { user: publicUser(user), token }, 'Connexion réussie');
});

const me = asyncHandler(async (req, res) => ok(res, publicUser(req.user)));

const logout = asyncHandler(async (req, res) => ok(res, null, 'Déconnexion réussie'));

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const message = 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé';

  if (!email) return fail(res, 400, 'Adresse email requise', 'VALIDATION');

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await db.findOne('users', (u) => String(u.email).toLowerCase() === normalizedEmail);

  if (user) {
    const token = randomToken(32);
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await db.update('users', (u) => u.id === user.id, {
      reset_token: token,
      reset_expires: expires,
      updated_at: nowISO(),
    });
    console.log(`[auth] Lien de réinitialisation pour ${user.email} : /reset-password?token=${token}`);
  }

  return ok(res, null, message);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body || {};
  if (!token || !password) {
    return res.status(422).json({
      success: false,
      error: 'Token et mot de passe requis',
      errors: { general: 'Token et mot de passe requis' },
    });
  }
  if (String(password).length < 6) {
    return res.status(422).json({
      success: false,
      error: 'Le mot de passe doit contenir au moins 6 caractères',
      errors: { general: 'Le mot de passe doit contenir au moins 6 caractères' },
    });
  }

  const user = await db.findOne('users', (u) => u.reset_token === String(token));
  const expired = !user || (user.reset_expires && new Date(user.reset_expires).getTime() < Date.now());

  if (!user || expired) {
    return res.status(422).json({
      success: false,
      error: 'Lien de réinitialisation invalide ou expiré',
      errors: { general: 'Lien de réinitialisation invalide ou expiré' },
    });
  }

  if (email && String(email).toLowerCase() !== String(user.email).toLowerCase()) {
    return res.status(422).json({
      success: false,
      error: 'L\'email ne correspond pas au compte',
      errors: { email: ['L\'email ne correspond pas au compte'] },
    });
  }

  await db.update('users', (u) => u.id === user.id, {
    password: await bcrypt.hash(String(password), 10),
    reset_token: '',
    reset_expires: '',
    updated_at: nowISO(),
  });

  return ok(res, null, 'Mot de passe réinitialisé avec succès');
});

module.exports = { register, login, me, logout, forgotPassword, resetPassword, publicUser };
