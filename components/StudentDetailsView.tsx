import React, { useMemo, useState } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, User, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { AttendanceRecord, Student } from '../types';
import { SUBJECTS, STUDENTS } from '../constants';

interface Props {
  studentId: string;
  attendance: AttendanceRecord[];
  onBack: () => void;
}

const StudentDetailsView: React.FC<Props> = ({ studentId, attendance, onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const student = useMemo(() => 
    STUDENTS.find(s => s.id === studentId),
  [studentId]);

  const studentAttendance = useMemo(() => {
    if (!student) return [];
    return attendance.filter(r => 
      r.division === student.division && 
      SUBJECTS.find(s => s.id === r.subjectId)?.year === student.year &&
      r.presentStudentIds.includes(studentId)
    );
  }, [attendance, student, studentId]);

  const subjectStats = useMemo(() => {
    if (!student) return [];
    
    const subjects = SUBJECTS.filter(s => s.year === student.year);
    return subjects.map(subject => {
      const sessions = attendance.filter(r => 
        r.division === student.division && 
        r.subjectId === subject.id
      );
      
      const presentCount = sessions.filter(r => r.presentStudentIds.includes(studentId)).length;
      const absentDates = sessions
        .filter(r => !r.presentStudentIds.includes(studentId))
        .map(r => r.date)
        .sort();
      
      const percentage = sessions.length === 0 ? 100 : (presentCount / sessions.length) * 100;
      
      return {
        ...subject,
        presentCount,
        totalSessions: sessions.length,
        percentage,
        absentDates
      };
    });
  }, [attendance, student, studentId]);

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Student not found</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-2xl font-black text-slate-800">Student Profile</h1>
      </div>

      {/* Student Info Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-black">{student.name}</h2>
            <p className="text-indigo-100 font-semibold">Year {student.year} - Division {student.division}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <User className="w-8 h-8" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-[10px] text-indigo-100 font-bold uppercase">Roll No</p>
            <p className="text-lg font-black">{student.rollNo}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <p className="text-[10px] text-indigo-100 font-bold uppercase">ID</p>
            <p className="text-lg font-black">{student.id}</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
            <p className="font-semibold text-slate-800">{student.name.replace(/\s+/g, '.').toLowerCase()}@sahrdaya.edu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Phone</p>
            <p className="font-semibold text-slate-800">+91 {Math.floor(Math.random() * 9000000000) + 1000000000}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Address</p>
            <p className="font-semibold text-slate-800">Sahrdaya College, Kochi, Kerala</p>
          </div>
        </div>
      </div>

      {/* Subject Attendance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-black text-slate-800">Subject Attendance</h3>
        </div>

        <div className="space-y-3">
          {subjectStats.map(subject => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id === selectedSubject ? null : subject.id)}
              className="w-full text-left"
            >
              <div className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-indigo-300 transition space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800">{subject.name}</p>
                    <p className="text-sm text-slate-500">
                      {subject.presentCount}/{subject.totalSessions} sessions
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                    subject.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    subject.percentage >= 70 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {subject.percentage.toFixed(1)}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      subject.percentage >= 80 ? 'bg-emerald-500' :
                      subject.percentage >= 70 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>

                {/* Absences */}
                {selectedSubject === subject.id && subject.absentDates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Absent Days ({subject.absentDates.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subject.absentDates.map(date => (
                        <span 
                          key={date}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubject === subject.id && subject.absentDates.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-emerald-600 font-bold text-sm">✓ Perfect attendance!</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <p className="font-bold text-slate-800">Overall Attendance</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">
              {subjectStats.length}
            </p>
            <p className="text-xs text-slate-600 font-bold">Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">
              {(subjectStats.reduce((a, b) => a + b.presentCount, 0))}
            </p>
            <p className="text-xs text-slate-600 font-bold">Classes Present</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-600">
              {(subjectStats.reduce((a, b) => a + (b.totalSessions - b.presentCount), 0))}
            </p>
            <p className="text-xs text-slate-600 font-bold">Absent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsView;
