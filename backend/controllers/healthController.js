const db = require('../services/excelService');
const { ok, asyncHandler } = require('../utils/http');

const health = asyncHandler(async (req, res) => {
  const files = db.status();
  const connected = Object.values(files).every(Boolean);

  return res.status(connected ? 200 : 503).json({
    success: connected,
    status: connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime() * 10) / 10,
    database: {
      status: connected ? 'connected' : 'missing files',
      type: 'excel',
      files,
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
  });
});

module.exports = { health };
