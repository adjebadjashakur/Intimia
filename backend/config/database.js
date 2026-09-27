const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const GALLERY_DIR = path.join(UPLOADS_DIR, 'gallery');

const C = {
  str: { type: 'string' },
  text: { type: 'string' },
  num: { type: 'number' },
  bool: { type: 'boolean' },
  json: { type: 'json' },
  date: { type: 'string' },
};

const TABLES = {
  users: {
    file: 'users.xlsx',
    columns: {
      id: C.str,
      name: C.str,
      email: C.str,
      password: C.str,
      avatar: C.str,
      role: C.str,
      reset_token: C.str,
      reset_expires: C.str,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  settings: {
    file: 'settings.xlsx',
    columns: {
      user_id: C.str,
      theme: C.str,
      language: C.str,
      date_format: C.str,
      journal_privacy: C.str,
      notifications: C.json,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  journal_entries: {
    file: 'journal_entries.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      title: C.str,
      content: C.text,
      date: C.date,
      mood: C.str,
      font_family: C.str,
      font_size: C.num,
      text_color: C.str,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  moods: {
    file: 'moods.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      mood: C.str,
      score: C.num,
      note: C.text,
      date: C.date,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  plannings: {
    file: 'plannings.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      title: C.str,
      description: C.text,
      content: C.text,
      date: C.date,
      time: C.str,
      duration: C.num,
      completed: C.bool,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  routines: {
    file: 'routines.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      name: C.str,
      description: C.text,
      period: C.str,
      completed: C.bool,
      date: C.date,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  gallery: {
    file: 'gallery.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      url: C.str,
      filename: C.str,
      caption: C.str,
      category: C.str,
      date: C.date,
      created_at: C.date,
      updated_at: C.date,
    },
  },
  avatars: {
    file: 'avatars.xlsx',
    columns: {
      id: C.str,
      user_id: C.str,
      url: C.str,
      name: C.str,
      is_default: C.bool,
      created_at: C.date,
    },
  },
};

const DEFAULT_NOTIFICATIONS = {
  email: true,
  push: false,
  dailyReminder: true,
  reminderTime: '20:00',
  email_notifications: 'true',
  journal_reminders: 'false',
};

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'fr',
  date_format: 'DD/MM/YYYY',
  journal_privacy: 'private',
  notifications: DEFAULT_NOTIFICATIONS,
};

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  UPLOADS_DIR,
  AVATARS_DIR,
  GALLERY_DIR,
  TABLES,
  DEFAULT_SETTINGS,
  DEFAULT_NOTIFICATIONS,
};
