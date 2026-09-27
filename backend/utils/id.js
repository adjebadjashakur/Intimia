const crypto = require('crypto');

function genId(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

function nowISO() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { genId, nowISO, today, randomToken };
