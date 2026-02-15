import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'attendance.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

export const initializeDatabase = () => {
  db.serialize(() => {
    // Attendance records table
    db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        subjectId TEXT NOT NULL,
        division TEXT NOT NULL,
        presentStudentIds TEXT NOT NULL,
        period INTEGER,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, subjectId, division, period)
      )
    `);

    // Locks table
    db.run(`
      CREATE TABLE IF NOT EXISTS locks (
        key TEXT PRIMARY KEY,
        locked INTEGER DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subject overrides table
    db.run(`
      CREATE TABLE IF NOT EXISTS subject_overrides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        division TEXT NOT NULL,
        period INTEGER NOT NULL,
        subjectId TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date, division, period)
      )
    `);

    console.log('Database tables initialized');
  });
};

// Helper functions for database queries
export const runAsync = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Set subject override for a specific date, division, and period
export const setSubjectOverride = async (date, division, period, subjectId) => {
  return runAsync(
    `INSERT OR REPLACE INTO subject_overrides (date, division, period, subjectId) VALUES (?, ?, ?, ?)`,
    [date, division, period, subjectId]
  );
};

// Get subject override for a specific date, division, and period
export const getSubjectOverride = async (date, division, period) => {
  return getAsync(
    `SELECT subjectId FROM subject_overrides WHERE date = ? AND division = ? AND period = ?`,
    [date, division, period]
  );
};

export const getAsync = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allAsync = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};
