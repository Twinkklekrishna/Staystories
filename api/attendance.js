import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage for serverless (resets on each deployment)
let attendance = [];
let locks = {};

// Initialize with mock data
const generateMockData = () => {
  const studentIds = [];
  for (let year = 1; year <= 4; year++) {
    for (let div of ['A', 'B', 'C', 'D']) {
      for (let i = 1; i <= 65; i++) {
        studentIds.push(`Y${year}${div}${i.toString().padStart(2, '0')}`);
      }
    }
  }

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

// Initialize mock data on first load
if (attendance.length === 0) {
  attendance = generateMockData();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Get all attendance records
app.get('/api/attendance', (req, res) => {
  res.json(attendance);
});

// Save attendance record
app.post('/api/attendance', (req, res) => {
  const { date, subjectId, division, presentStudentIds, period } = req.body;
  
  attendance = attendance.filter(r => 
    !(r.date === date && r.subjectId === subjectId && r.division === division && r.period === period)
  );

  attendance.push({ date, subjectId, division, presentStudentIds, period });

  const lockKey = `${date}_${subjectId}_P${period}_${division}`;
  locks[lockKey] = true;

  res.json({ success: true, message: 'Attendance saved' });
});

// Update attendance record
app.put('/api/attendance/:id', (req, res) => {
  const { date, subjectId, division, presentStudentIds, period } = req.body;
  
  attendance = attendance.filter(r => 
    !(r.date === date && r.subjectId === subjectId && r.division === division && r.period === period)
  );

  attendance.push({ date, subjectId, division, presentStudentIds, period });

  res.json({ success: true, message: 'Attendance updated' });
});

// Get all locks
app.get('/api/locks', (req, res) => {
  res.json(locks);
});

// Toggle lock
app.post('/api/locks/toggle', (req, res) => {
  const { key } = req.body;
  locks[key] = !locks[key];
  res.json({ success: true, message: 'Lock toggled' });
});

// Clear locks
app.post('/api/locks/clear', (req, res) => {
  locks = {};
  res.json({ success: true, message: 'All locks cleared' });
});

// Clear attendance
app.post('/api/attendance/clear', (req, res) => {
  attendance = [];
  locks = {};
  res.json({ success: true, message: 'Attendance history cleared' });
});

export default app;
