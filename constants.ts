
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

// Separate male and female names for proper gender assignment
const maleNames = ["Rahul", "Midhun", "Abhijith", "Vaisakh", "Kiran", "Arjun", "Nithin", "Rohit", "Gautham", "Sreejith", "Varun"];
const femaleNames = ["Anjali", "Sruthi", "Meera", "Sneha", "Arya", "Lakshmi", "Devika", "Aparna", "Parvathy"];

const generateStudents = (): Student[] => {
  const students: Student[] = [];
  const years: Year[] = [1, 2, 3, 4];
  const divisions: Division[] = ['A', 'B', 'C', 'D'];

  years.forEach(year => {
    divisions.forEach(div => {
      for (let i = 1; i <= 65; i++) {
        // Randomly select from combined list, then determine gender from the name
        const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        // Determine gender based on first name
        const gender = femaleNames.includes(fName) ? 'F' : 'M';
        const studentId = `Y${year}${div}${i.toString().padStart(2, '0')}`;
        
        // Use realistic stock photos from randomuser.me
        const genderPath = gender === 'M' ? 'men' : 'women';
        const idNumeric = parseInt(studentId.replace(/\D/g, ''));
        const photoIndex = (idNumeric % 70) + 1;
        
        students.push({
          id: studentId,
          rollNo: `CS${year}${div}${i.toString().padStart(2, '0')}`,
          name: `${fName} ${lName}`,
          year: year as Year,
          division: div as Division,
          gender: gender as 'M' | 'F',
          imageUrl: `https://randomuser.me/api/portraits/${genderPath}/${photoIndex}.jpg`
        });
      }
    });
  });
  return students;
};

export const STUDENTS = generateStudents();

export const ADMIN_PASSWORD = "sahrdaya123";

/**
 * CONFLICT-FREE TEACHER SCHEDULE
 * Day-based separation ensures no teaching time conflicts
 * Monday: Year 1 classes (P1-4)
 * Tuesday: Year 2 classes (P1-7, with labs P5-7)
 * Wednesday: Year 3 classes (P1-7, with labs P5-7)
 * Thursday: Year 4 classes (P1-4)
 * Friday: Year 1 makeup (P1-4)
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

  const schedule: { period: number, subjectId: string, name: string, isLab: boolean }[] = [];
  const divIndex = div.charCodeAt(0) - 'A'.charCodeAt(0); // 0=A, 1=B, 2=C, 3=D

  // NO TEACHING: return other subjects only
  const fillWithOtherSubjects = () => {
    const rotatedPool = rotate(otherSubs, dayIndex + divIndex);
    for (let i = 1; i <= 7; i++) {
      const sub = rotatedPool[(i-1) % rotatedPool.length] || yearSubjects[0];
      schedule.push({ 
        period: i, 
        subjectId: sub.id, 
        name: sub.name, 
        isLab: false 
      });
    }
  };

  // Check if it's a teaching day for this year
  const isTeachingDay = (year === 1 && (dayIndex === 1 || dayIndex === 5)) || // Mon, Fri
                        (year === 2 && dayIndex === 2) ||                      // Tue
                        (year === 3 && dayIndex === 3) ||                      // Wed
                        (year === 4 && dayIndex === 4);                        // Thu

  if (!isTeachingDay) {
    fillWithOtherSubjects();
    return schedule;
  }

  // Get teacher period based on division
  const teacherPeriod = divIndex + 1; // A=P1, B=P2, C=P3, D=P4

  // Check for lab day
  const isLabDay = (year === 2 && dayIndex === 2) || (year === 3 && dayIndex === 3);

  if (isLabDay && lab) {
    // Lab day: periods 1-4 teacher's regular subject, 5-7 lab for all divisions
    for (let i = 1; i <= 4; i++) {
      let sub;
      if (i === teacherPeriod) {
        sub = coreTeacherSub;
      } else {
        const otherIdx = (i - 1) % otherSubs.length;
        sub = otherSubs[otherIdx] || yearSubjects[0];
      }
      schedule.push({ 
        period: i, 
        subjectId: sub.id, 
        name: sub.name, 
        isLab: false 
      });
    }
    // Lab periods (all divisions share)
    for (let i = 5; i <= 7; i++) {
      schedule.push({ 
        period: i, 
        subjectId: lab.id, 
        name: lab.name, 
        isLab: true 
      });
    }
  } else {
    // Regular teaching day: teacher's subject at fixed period, others fill rest
    for (let i = 1; i <= 7; i++) {
      let sub;
      if (i === teacherPeriod) {
        sub = coreTeacherSub;
      } else {
        const otherIdx = (i - 1) % otherSubs.length;
        sub = otherSubs[otherIdx] || yearSubjects[0];
      }
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
