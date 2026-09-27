function ok(res, data, message) {
  return res.status(200).json({ success: true, ...(message ? { message } : {}), data });
}

function created(res, data, message) {
  return res.status(201).json({ success: true, ...(message ? { message } : {}), data });
}

function fail(res, status, error, code) {
  return res.status(status).json({
    success: false,
    error,
    ...(code ? { code } : {}),
  });
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';
  if (status >= 500) console.error('[api]', err);
  return res.status(status).json({ success: false, error: message });
}

module.exports = { ok, created, fail, asyncHandler, errorMiddleware };
