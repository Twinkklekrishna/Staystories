import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { allAsync, getAsync, runAsync, db } from './database.js';

const app = express();
const PORT = 5000;

// Mock data generator
const generateMockData = () => {
  // Students per class
  const studentIds = [];
  for (let year = 1; year <= 4; year++) {
    for (let div of ['A', 'B', 'C', 'D']) {
      for (let i = 1; i <= 65; i++) {
        studentIds.push(`Y${year}${div}${i.toString().padStart(2, '0')}`);
      }
    }
  }

  // Subject IDs
  const subjects = [
    'GT', 'ECON', 'Y1_S3', 'Y1_S4', 'Y1_S5', 'Y1_S6', 'Y1_S7', 'Y1_S8',
    'DBMS', 'DBMS_LAB', 'Y2_S3', 'Y2_S4', 'Y2_S5', 'Y2_S6', 'Y2_S7', 'Y2_S8',
    'OS', 'OS_LAB', 'Y3_S3', 'Y3_S4', 'Y3_S5', 'Y3_S6', 'Y3_S7', 'Y3_S8',
    'EDA', 'DAA', 'Y4_S3', 'Y4_S4', 'Y4_S5', 'Y4_S6', 'Y4_S7', 'Y4_S8'
  ];

  const records = [];
  const today = new Date(2026, 1, 12);
  const startDate = new Date(2026, 0, 1);

  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];

    for (let year = 1; year <= 4; year++) {
      for (let div of ['A', 'B', 'C', 'D']) {
        const classStudents = studentIds.filter(id => id.startsWith(`Y${year}${div}`));
        
        // Pick 2-4 random subjects
        const selectedSubjects = subjects
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 + Math.floor(Math.random() * 2));

        selectedSubjects.forEach((subject, idx) => {
          const absentCount = Math.floor(Math.random() * 5);
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          const absentStudents = shuffled.slice(0, absentCount);
          const absentIds = new Set(absentStudents.map(s => s));

          const presentIds = classStudents.filter(s => !absentIds.has(s));

          records.push({
            date: dateStr,
            subjectId: subject,
            division: div,
            presentStudentIds: presentIds,
            period: idx + 1
          });
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return records;
};

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize database with mock data on startup
const initializeMockData = async () => {
  try {
    const existingRecords = await allAsync('SELECT COUNT(*) as count FROM attendance');
    
    if (!existingRecords || existingRecords[0]?.count === 0) {
      console.log('Database empty. Loading mock data...');
      
      const mockData = generateMockData();
      
      for (const record of mockData) {
        await runAsync(
          'INSERT OR IGNORE INTO attendance (date, subjectId, division, presentStudentIds, period) VALUES (?, ?, ?, ?, ?)',
          [record.date, record.subjectId, record.division, JSON.stringify(record.presentStudentIds), record.period]
        );
      }
      
      console.log(`✓ Loaded ${mockData.length} mock attendance records`);
    } else {
      console.log(`✓ Database already has ${existingRecords[0].count} attendance records`);
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
};

// Initialize mock data after database is ready
setTimeout(initializeMockData, 500);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const records = await allAsync('SELECT * FROM attendance');
    const parsed = records.map(r => ({
      ...r,
      presentStudentIds: JSON.parse(r.presentStudentIds)
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save attendance record
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, subjectId, division, presentStudentIds, period } = req.body;
    
    // Delete existing record for the same session if exists
    await runAsync(
      'DELETE FROM attendance WHERE date = ? AND subjectId = ? AND division = ? AND period = ?',
      [date, subjectId, division, period]
    );

    // Insert new record
    await runAsync(
      'INSERT INTO attendance (date, subjectId, division, presentStudentIds, period) VALUES (?, ?, ?, ?, ?)',
      [date, subjectId, division, JSON.stringify(presentStudentIds), period]
    );

    // Auto lock for non-admins
    const lockKey = `${date}_${subjectId}_P${period}_${division}`;
    await runAsync(
      'INSERT OR REPLACE INTO locks (key, locked) VALUES (?, 1)',
      [lockKey]
    );

    res.json({ success: true, message: 'Attendance saved' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update attendance record
app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { date, subjectId, division, presentStudentIds, period } = req.body;
    
    // Delete existing record
    await runAsync(
      'DELETE FROM attendance WHERE date = ? AND subjectId = ? AND division = ? AND period = ?',
      [date, subjectId, division, period]
    );

    // Insert updated record
    await runAsync(
      'INSERT INTO attendance (date, subjectId, division, presentStudentIds, period) VALUES (?, ?, ?, ?, ?)',
      [date, subjectId, division, JSON.stringify(presentStudentIds), period]
    );

    res.json({ success: true, message: 'Attendance updated' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all locks
app.get('/api/locks', async (req, res) => {
  try {
    const locks = await allAsync('SELECT key, locked FROM locks');
    const lockObj = {};
    locks.forEach(lock => {
      lockObj[lock.key] = lock.locked === 1;
    });
    res.json(lockObj);
  } catch (error) {
    console.error('Error fetching locks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle lock
app.post('/api/locks/toggle', async (req, res) => {
  try {
    const { key } = req.body;
    
    // Check if lock exists
    const existing = await getAsync('SELECT locked FROM locks WHERE key = ?', [key]);
    
    if (existing) {
      // Toggle existing lock
      await runAsync(
        'UPDATE locks SET locked = ? WHERE key = ?',
        [existing.locked === 1 ? 0 : 1, key]
      );
    } else {
      // Create new lock
      await runAsync(
        'INSERT INTO locks (key, locked) VALUES (?, 1)',
        [key]
      );
    }

    res.json({ success: true, message: 'Lock toggled' });
  } catch (error) {
    console.error('Error toggling lock:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all locks (admin)
app.post('/api/locks/clear', async (req, res) => {
  try {
    await runAsync('DELETE FROM locks');
    res.json({ success: true, message: 'All locks cleared' });
  } catch (error) {
    console.error('Error clearing locks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete entire attendance history (admin)
app.post('/api/attendance/clear', async (req, res) => {
  try {
    await runAsync('DELETE FROM attendance');
    await runAsync('DELETE FROM locks');
    res.json({ success: true, message: 'Attendance history cleared' });
  } catch (error) {
    console.error('Error clearing attendance:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Network accessible at http://0.0.0.0:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/health`);
});
