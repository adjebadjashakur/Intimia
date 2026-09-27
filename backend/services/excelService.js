const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { DATA_DIR, TABLES } = require('../config/database');

const locks = new Map();

function filePath(table) {
  const meta = TABLES[table];
  if (!meta) throw new Error(`Table inconnue : ${table}`);
  return path.join(DATA_DIR, meta.file);
}

function coerce(value, def) {
  if (value === undefined || value === null || value === '') return def;
  return value;
}

function deserialize(table, row) {
  const columns = TABLES[table].columns;
  const out = {};
  for (const [key, meta] of Object.entries(columns)) {
    const raw = row[key];
    switch (meta.type) {
      case 'number': {
        const n = raw === '' || raw === undefined || raw === null ? '' : Number(raw);
        out[key] = Number.isNaN(n) ? coerce(raw, '') : n;
        break;
      }
      case 'boolean':
        out[key] = raw === true || raw === 'true' || raw === 1 || raw === '1';
        break;
      case 'json': {
        if (raw && typeof raw === 'object') out[key] = raw;
        else if (typeof raw === 'string' && raw.trim()) {
          try {
            out[key] = JSON.parse(raw);
          } catch {
            out[key] = {};
          }
        } else out[key] = {};
        break;
      }
      default:
        out[key] = raw === undefined || raw === null ? '' : raw;
    }
  }
  return out;
}

function serialize(table, row) {
  const columns = TABLES[table].columns;
  const out = {};
  for (const [key, meta] of Object.entries(columns)) {
    const value = row[key];
    switch (meta.type) {
      case 'json':
        out[key] = value ? JSON.stringify(value) : '';
        break;
      case 'boolean':
        out[key] = value === true || value === 'true';
        break;
      case 'number':
        out[key] = value === '' || value === undefined || value === null ? '' : Number(value);
        break;
      default:
        out[key] = value === undefined || value === null ? '' : value;
    }
  }
  return out;
}

function ensureFile(table) {
  const fp = filePath(table);
  if (fs.existsSync(fp)) return fp;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const header = Object.keys(TABLES[table].columns);
  const ws = XLSX.utils.aoa_to_sheet([header]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'data');
  XLSX.writeFile(wb, fp);
  return fp;
}

function readSync(table) {
  const fp = ensureFile(table);
  const wb = XLSX.readFile(fp);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return rows.map((row) => deserialize(table, row));
}

function writeSync(table, rows) {
  ensureFile(table);
  const header = Object.keys(TABLES[table].columns);
  const data = rows.map((row) => serialize(table, row));
  const ws = XLSX.utils.json_to_sheet(data, { header });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'data');
  XLSX.writeFile(wb, filePath(table));
}

function withLock(table, fn) {
  const previous = locks.get(table) || Promise.resolve();
  const next = previous.then(() => fn()).catch((err) => {
    throw err;
  });
  locks.set(
    table,
    next.catch(() => {})
  );
  return next;
}

function getAll(table) {
  return withLock(table, async () => readSync(table));
}

function findById(table, id) {
  return getAll(table).then((rows) => rows.find((row) => row.id === id) || null);
}

function findOne(table, predicate) {
  return getAll(table).then((rows) => rows.find(predicate) || null);
}

function filter(table, predicate) {
  return getAll(table).then((rows) => rows.filter(predicate));
}

function insert(table, row) {
  return withLock(table, async () => {
    const rows = readSync(table);
    rows.push(row);
    writeSync(table, rows);
    return row;
  });
}

function update(table, predicate, patch) {
  return withLock(table, async () => {
    const rows = readSync(table);
    let updated = null;
    const next = rows.map((row) => {
      if (predicate(row)) {
        updated = { ...row, ...patch };
        return updated;
      }
      return row;
    });
    if (!updated) return null;
    writeSync(table, next);
    return updated;
  });
}

function remove(table, predicate) {
  return withLock(table, async () => {
    const rows = readSync(table);
    const kept = rows.filter((row) => !predicate(row));
    const removed = rows.length - kept.length;
    if (removed > 0) writeSync(table, kept);
    return removed;
  });
}

function mutate(table, mutator) {
  return withLock(table, async () => {
    const rows = readSync(table);
    const result = await mutator(rows);
    if (result && result.rows) {
      writeSync(table, result.rows);
      return result.value !== undefined ? result.value : result.rows;
    }
    writeSync(table, rows);
    return result;
  });
}

function tableExists(table) {
  try {
    return fs.existsSync(filePath(table));
  } catch {
    return false;
  }
}

function status() {
  const aliases = {
    journal_entries: 'journal',
    plannings: 'planning',
    routines: 'routine',
  };
  const files = {};
  for (const table of Object.keys(TABLES)) {
    files[aliases[table] || table] = tableExists(table);
  }
  return files;
}

module.exports = {
  DATA_DIR,
  filePath,
  ensure: ensureFile,
  getAll,
  findById,
  findOne,
  filter,
  insert,
  update,
  remove,
  mutate,
  tableExists,
  status,
};
