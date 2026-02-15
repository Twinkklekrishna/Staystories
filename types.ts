export type Year = 1 | 2 | 3 | 4;
export type Division = 'A' | 'B' | 'C' | 'D';
export type Gender = 'M' | 'F';

export interface Subject {
  id: string;
  name: string;
  year: Year;
  isLab: boolean;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  year: Year;
  division: Division;
  gender?: Gender;
  imageUrl?: string;
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  division: Division;
  presentStudentIds: string[];
  period?: number;
}

export interface LockState {
  [key: string]: boolean;
}
