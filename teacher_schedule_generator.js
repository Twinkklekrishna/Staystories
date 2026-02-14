const subjects = {
  1: ['GT', 'ECON', 'Y1_S3', 'Y1_S4', 'Y1_S5', 'Y1_S6', 'Y1_S7', 'Y1_S8'],
  2: ['DBMS', 'DBMS_LAB', 'Y2_S3', 'Y2_S4', 'Y2_S5', 'Y2_S6', 'Y2_S7', 'Y2_S8'],
  3: ['OS', 'OS_LAB', 'Y3_S3', 'Y3_S4', 'Y3_S5', 'Y3_S6', 'Y3_S7', 'Y3_S8'],
  4: ['EDA', 'DAA', 'Y4_S3', 'Y4_S4', 'Y4_S5', 'Y4_S6', 'Y4_S7', 'Y4_S8']
};

const subjectNames = {
  'GT': 'Graph Theory',
  'ECON': 'Economics',
  'DBMS': 'DBMS',
  'DBMS_LAB': 'DBMS Lab',
  'OS': 'Operating Systems',
  'OS_LAB': 'OS Lab',
  'EDA': 'Exploratory Data Analysis',
  'DAA': 'Design and Analysis of Algorithms'
};

const isLab = (subId) => subId.includes('LAB');

const rotate = (arr, n) => {
  const l = arr.length;
  return arr.slice(n % l).concat(arr.slice(0, n % l));
};

const getScheduleForDay = (dayIndex, year, div) => {
  const yearSubjects = subjects[year];
  const teacherSubs = ['GT', 'ECON', 'DBMS', 'DBMS_LAB', 'OS', 'OS_LAB', 'EDA', 'DAA'];
  
  const lab = yearSubjects.find(s => isLab(s));
  const coreTeacherSub = yearSubjects.find(s => teacherSubs.includes(s) && !isLab(s));
  const otherSubs = yearSubjects.filter(s => !teacherSubs.includes(s) && !isLab(s));
  
  const schedule = [];
  const labDay = year;
  const isLabDay = dayIndex === labDay && lab;

  if (isLabDay) {
    const dailyPool = [coreTeacherSub, ...otherSubs];
    const rotatedPool = rotate(dailyPool, dayIndex + (div.charCodeAt(0)));
    
    for (let i = 1; i <= 4; i++) {
      const sub = rotatedPool[i-1] || yearSubjects[0];
      schedule.push({ period: i, subjectId: sub });
    }
    for (let i = 5; i <= 7; i++) {
      schedule.push({ period: i, subjectId: lab });
    }
  } else {
    const dailyPool = [coreTeacherSub, ...otherSubs];
    const rotatedPool = rotate(dailyPool, dayIndex + (div.charCodeAt(0)));
    
    for (let i = 1; i <= 7; i++) {
      const sub = rotatedPool[(i-1) % rotatedPool.length] || yearSubjects[0];
      schedule.push({ period: i, subjectId: sub });
    }
  }

  return schedule;
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const divisions = ['A', 'B', 'C', 'D'];
const teacherSubjects = ['GT', 'ECON', 'DBMS', 'DBMS_LAB', 'OS', 'OS_LAB', 'EDA', 'DAA'];

const teacherSchedule = [];

for (let year = 1; year <= 4; year++) {
  for (const div of divisions) {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const schedule = getScheduleForDay(dayIndex, year, div);
      
      schedule.forEach(s => {
        if (teacherSubjects.includes(s.subjectId)) {
          teacherSchedule.push({
            class: year + div,
            day: days[dayIndex],
            period: s.period,
            subject: subjectNames[s.subjectId],
            subjectId: s.subjectId,
            isLab: isLab(s.subjectId)
          });
        }
      });
    }
  }
}

const dayOrder = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
teacherSchedule.sort((a, b) => {
  if (dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
  return a.period - b.period;
});

const subjectGroups = {};
teacherSchedule.forEach(s => {
  const key = s.day;
  if (!subjectGroups[key]) subjectGroups[key] = [];
  subjectGroups[key].push(s);
});

console.log('\n' + '='.repeat(100));
console.log('TEACHER TIMETABLE - EDA, DAA, ECONOMICS, DBMS, OS, GT, DBMS LAB, OS LAB');
console.log('='.repeat(100));

days.forEach(day => {
  if (subjectGroups[day]) {
    console.log('\n' + day.toUpperCase());
    console.log('-'.repeat(100));
    
    const sessionsForDay = subjectGroups[day];
    sessionsForDay.forEach((s, idx) => {
      const labMarker = s.isLab ? ' [LAB]' : '';
      const line = '  ' + (idx + 1) + '. ' + s.subject.padEnd(35) + '| Class ' + s.class.padEnd(3) + '| Period ' + s.period + labMarker;
      console.log(line);
    });
  }
});

console.log('\n' + '='.repeat(100));
console.log('SUMMARY BY SUBJECT');
console.log('='.repeat(100));

teacherSubjects.forEach(subId => {
  const sessions = teacherSchedule.filter(s => s.subjectId === subId);
  if (sessions.length > 0) {
    const classInfo = sessions.map(s => s.class + '(P' + s.period + ')').join(', ');
    const line = subjectNames[subId].padEnd(35) + '| ' + classInfo;
    console.log(line);
  }
});

console.log('\n' + '='.repeat(100));
console.log('TOTAL SESSIONS PER WEEK: ' + teacherSchedule.length);
console.log('='.repeat(100) + '\n');
