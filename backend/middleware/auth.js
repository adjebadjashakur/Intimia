const jwt = require('jsonwebtoken');
const db = require('../services/excelService');
const { fail, asyncHandler } = require('../utils/http');

const JWT_SECRET = process.env.JWT_SECRET || 'intimia-dev-secret';

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return fail(res, 401, 'Token manquant', 'TOKEN_MISSING');

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return fail(res, 401, 'Token invalide ou expiré', 'TOKEN_INVALID');
  }

  const user = await db.findById('users', payload.id);
  if (!user) return fail(res, 401, 'Utilisateur introuvable', 'USER_NOT_FOUND');

  req.user = user;
  req.userId = user.id;
  req.token = token;
  return next();
});

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return fail(res, 403, 'Accès réservé aux administrateurs', 'FORBIDDEN');
  }
  return next();
}

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = { authenticate, requireAdmin, signToken, extractToken };
