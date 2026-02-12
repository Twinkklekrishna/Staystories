
<<<<<<< HEAD
export type ExperienceType = 'Silent' | 'Friendly' | 'Cultural';

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}

export interface Stay {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  description: string;
  priceRange: string;
  experience: ExperienceType;
  amenities: string[];
  tags: Record<string, string>;
  isAvailable: boolean;
  photoUrl?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
}

export interface User {
  username: string;
  email?: string;
  role: 'traveler' | 'host';
}

export interface Memory {
  id: string;
  user: string;
  text: string;
  date: string;
=======
export type Year = 1 | 2 | 3 | 4;
export type Division = 'A' | 'B' | 'C' | 'D';

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
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  division: Division;
  presentStudentIds: string[];
  period?: number;
}

export interface LockState {
  [key: string]: boolean; // key format: "date_subjectId_division" or "date_locked"
}

export interface AppState {
  attendance: AttendanceRecord[];
  locks: LockState;
>>>>>>> ac92b0f (Initial commit - Sahrdaya Attendance App)
}
