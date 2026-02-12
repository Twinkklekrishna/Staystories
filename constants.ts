
import { Subject, Student, Year, Division } from './types';

export const SUBJECTS: Subject[] = [
  // Year 1
  { id: 'GT', name: 'Graph Theory', year: 1, isLab: false },
  { id: 'ECON', name: 'Economics', year: 1, isLab: false },
  { id: 'Y1_S3', name: 'Mathematics I', year: 1, isLab: false },
  { id: 'Y1_S4', name: 'Engineering Physics', year: 1, isLab: false },
  { id: 'Y1_S5', name: 'Engineering Graphics', year: 1, isLab: false },
  { id: 'Y1_S6', name: 'Programming in C', year: 1, isLab: false },
  { id: 'Y1_S7', name: 'English Communication', year: 1, isLab: false },
  { id: 'Y1_S8', name: 'Life Skills', year: 1, isLab: false },

  // Year 2
  { id: 'DBMS', name: 'DBMS', year: 2, isLab: false },
  { id: 'DBMS_LAB', name: 'DBMS Lab', year: 2, isLab: true },
  { id: 'Y2_S3', name: 'Discrete Maths', year: 2, isLab: false },
  { id: 'Y2_S4', name: 'Data Structures', year: 2, isLab: false },
  { id: 'Y2_S5', name: 'COA', year: 2, isLab: false },
  { id: 'Y2_S6', name: 'Digital Electronics', year: 2, isLab: false },
  { id: 'Y2_S7', name: 'Constitution of India', year: 2, isLab: false },
  { id: 'Y2_S8', name: 'Sustainable Eng.', year: 2, isLab: false },

  // Year 3
  { id: 'OS', name: 'Operating Systems', year: 3, isLab: false },
  { id: 'OS_LAB', name: 'OS Lab', year: 3, isLab: true },
  { id: 'Y3_S3', name: 'Microprocessors', year: 3, isLab: false },
  { id: 'Y3_S4', name: 'Comp. Networks', year: 3, isLab: false },
  { id: 'Y3_S5', name: 'Formal Languages', year: 3, isLab: false },
  { id: 'Y3_S6', name: 'Software Eng.', year: 3, isLab: false },
  { id: 'Y3_S7', name: 'Management', year: 3, isLab: false },
  { id: 'Y3_S8', name: 'Environmental Sci.', year: 3, isLab: false },

  // Year 4
  { id: 'EDA', name: 'Exploratory Data Analysis', year: 4, isLab: false },
  { id: 'DAA', name: 'Design and Analysis of Algorithms', year: 4, isLab: false },
  { id: 'Y4_S3', name: 'Machine Learning', year: 4, isLab: false },
  { id: 'Y4_S4', name: 'Cloud Computing', year: 4, isLab: false },
  { id: 'Y4_S5', name: 'Cyber Security', year: 4, isLab: false },
  { id: 'Y4_S6', name: 'Project Phase I', year: 4, isLab: false },
  { id: 'Y4_S7', name: 'Professional Ethics', year: 4, isLab: false },
  { id: 'Y4_S8', name: 'Deep Learning', year: 4, isLab: false },
];

const firstNames = ["Rahul", "Anjali", "Midhun", "Sruthi", "Abhijith", "Meera", "Vaisakh", "Sneha", "Kiran", "Arya", "Arjun", "Lakshmi", "Nithin", "Devika", "Rohit", "Gautham", "Sreejith", "Aparna", "Varun", "Parvathy"];
const lastNames = ["Nair", "Menon", "Pillai", "Kurian", "Warrier", "Nambiar", "George", "Varghese", "Joseph", "Mathew", "Antony", "Thomas", "Paul", "Sebastian", "Eapen"];

const generateStudents = (): Student[] => {
  const students: Student[] = [];
  const years: Year[] = [1, 2, 3, 4];
  const divisions: Division[] = ['A', 'B', 'C', 'D'];

  years.forEach(year => {
    divisions.forEach(div => {
      for (let i = 1; i <= 65; i++) {
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const gender = Math.random() > 0.5 ? 'M' : 'F';
        students.push({
          id: `Y${year}${div}${i.toString().padStart(2, '0')}`,
          rollNo: `CS${year}${div}${i.toString().padStart(2, '0')}`,
          name: `${fName} ${lName}`,
          year: year as Year,
          division: div as Division,
          gender: gender as 'M' | 'F'
        });
      }
    });
  });
  return students;
};

export const STUDENTS = generateStudents();

export const ADMIN_PASSWORD = "sahrdaya123";

/**
 * Generates a mock timetable for a specific batch based on day of week.
 * Labs are assigned once a week to the last 3 periods.
 */
export const getScheduleForDay = (dayIndex: number, year: Year, div: Division) => {
  const yearSubjects = SUBJECTS.filter(s => s.year === year);
  const teacherSubs = ['GT', 'ECON', 'DBMS', 'DBMS_LAB', 'OS', 'OS_LAB', 'EDA', 'DAA'];
  
  const lab = yearSubjects.find(s => s.isLab);
  const coreTeacherSub = yearSubjects.find(s => teacherSubs.includes(s.id) && !s.isLab);
  const otherSubs = yearSubjects.filter(s => !teacherSubs.includes(s.id) && !s.isLab);
  
  const rotate = (arr: any[], n: number) => {
    const l = arr.length;
    return arr.slice(n % l).concat(arr.slice(0, n % l));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[dayIndex];

  const schedule: { period: number, subjectId: string, name: string, isLab: boolean }[] = [];

  const labDay = year; 
  const isLabDay = dayIndex === labDay && lab;

  if (isLabDay) {
    const dailyPool = [coreTeacherSub, ...otherSubs];
    const rotatedPool = rotate(dailyPool, dayIndex + (div.charCodeAt(0)));
    
    for (let i = 1; i <= 4; i++) {
      const sub = rotatedPool[i-1] || yearSubjects[0];
      schedule.push({ 
        period: i, 
        subjectId: sub.id, 
        name: sub.name, 
        isLab: false 
      });
    }
    for (let i = 5; i <= 7; i++) {
      schedule.push({ 
        period: i, 
        subjectId: lab.id, 
        name: lab.name, 
        isLab: true 
      });
    }
  } else {
    const dailyPool = [coreTeacherSub, ...otherSubs];
    const rotatedPool = rotate(dailyPool, dayIndex + (div.charCodeAt(0)));
    
    for (let i = 1; i <= 7; i++) {
      const sub = rotatedPool[(i-1) % rotatedPool.length] || yearSubjects[0];
      schedule.push({ 
        period: i, 
        subjectId: sub.id, 
        name: sub.name, 
        isLab: false 
      });
    }
  }

  return schedule;
};
