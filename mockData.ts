import { AttendanceRecord } from './types';
import { SUBJECTS, STUDENTS, getScheduleForDay } from './constants';

/**
 * Generates mock attendance records from January 1st, 2026 to today
 * Every day (including Sundays) has attendance marked for all classes and periods
 * Randomly marks 0-4 students as absent per class
 */
export const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date(2026, 1, 12); // February 12, 2026 (current date)
  const startDate = new Date(2026, 0, 1); // January 1, 2026

  // Track all class combinations: each year (1-4) × each division (A-D)
  const years: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
  const divisions: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Iterate through each day from Jan 1 to today
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // For each class (year + division)
    years.forEach(year => {
      divisions.forEach(division => {
        // Get the schedule for this day
        const schedule = getScheduleForDay(dayOfWeek, year, division);

        // Mark attendance for each period
        schedule.forEach(period => {
          // Get students in this class
          const classStudents = STUDENTS.filter(
            s => s.year === year && s.division === division
          );

          // Randomly decide absent count (0-4 students)
          const absentCount = Math.floor(Math.random() * 5); // 0, 1, 2, 3, or 4
          
          // Randomly select which students are absent
          const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
          const absentStudents = shuffled.slice(0, absentCount);
          const absentIds = new Set(absentStudents.map(s => s.id));

          // Mark present students (all except absent ones)
          const presentIds = classStudents
            .filter(s => !absentIds.has(s.id))
            .map(s => s.id);

          records.push({
            date: dateStr,
            subjectId: period.subjectId,
            division,
            presentStudentIds: presentIds,
            period: period.period
          });
        });
      });
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return records;
};
