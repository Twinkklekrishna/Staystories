
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, Check, X, Lock, Save, Clock, BookOpen, ChevronRight, Unlock, CalendarDays, ShieldCheck } from 'lucide-react';
import { Year, Division, Subject, AttendanceRecord, LockState } from '../types';
import { SUBJECTS, STUDENTS, getScheduleForDay } from '../constants';

interface Props {
  attendance: AttendanceRecord[];
  locks: LockState;
  onSave: (record: AttendanceRecord) => void;
  isAdmin: boolean;
}

const AttendanceView: React.FC<Props> = ({ attendance, locks, onSave, isAdmin }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState<Year>(1);
  const [selectedDivision, setSelectedDivision] = useState<Division>('A');
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());

  const dayOfWeek = useMemo(() => {
    const d = new Date(date);
    return d.getDay();
  }, [date]);

  const schedule = useMemo(() => 
    getScheduleForDay(dayOfWeek, selectedYear, selectedDivision),
  [dayOfWeek, selectedYear, selectedDivision]);

  const filteredStudents = useMemo(() => 
    STUDENTS.filter(s => s.year === selectedYear && s.division === selectedDivision)
      .sort((a, b) => a.name.localeCompare(b.name)),
  [selectedYear, selectedDivision]);

  // Subject override state
  const [overrideSubjectId, setOverrideSubjectId] = useState<string | null>(null);

  // Fetch subject override for selected date/division/period
  useEffect(() => {
    const fetchOverride = async () => {
      if (!selectedPeriod) { setOverrideSubjectId(null); return; }
      try {
        const res = await fetch(`/api/subject-override?date=${date}&division=${selectedDivision}&period=${selectedPeriod}`);
        const data = await res.json();
        setOverrideSubjectId(data.subjectId || null);
      } catch {
        setOverrideSubjectId(null);
      }
    };
    fetchOverride();
  }, [date, selectedDivision, selectedPeriod]);

  // Use override subject if present
  const activeSubject = useMemo(() => {
    if (!selectedPeriod) return undefined;
    if (overrideSubjectId) {
      const subj = SUBJECTS.find(s => s.id === overrideSubjectId);
      return subj ? { ...subj, period: selectedPeriod, subjectId: overrideSubjectId } : undefined;
    }
    return schedule.find(s => s.period === selectedPeriod);
  }, [schedule, selectedPeriod, overrideSubjectId]);

  const currentRecord = useMemo(() => {
    if (!activeSubject) return null;
    return attendance.find(r => 
      r.date === date && 
      r.subjectId === activeSubject.subjectId && 
      r.period === activeSubject.period &&
      r.division === selectedDivision
    );
  }, [attendance, date, activeSubject, selectedDivision]);

  const lockKey = activeSubject ? `${date}_${activeSubject.subjectId}_P${activeSubject.period}_${selectedDivision}` : '';
  const dayLockKey = `${date}_locked`;

  const isDayLocked = !!locks[dayLockKey];
  const isSubjectLocked = !!locks[lockKey];
  const isAlreadyMarked = !!currentRecord;

  // Teachers are completely locked out of interaction if the record exists or if locked by admin
  const isLocked = isDayLocked || isSubjectLocked || isAlreadyMarked;

  useEffect(() => {
    if (activeSubject) {
      if (currentRecord) {
        setPresentIds(new Set(currentRecord.presentStudentIds));
      } else {
        setPresentIds(new Set(filteredStudents.map(s => s.id)));
      }
    }
  }, [currentRecord, activeSubject, filteredStudents, date]);

  const toggleStudent = (id: string) => {
    if (isLocked) return;
    setPresentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (!activeSubject || isLocked) return;
    onSave({
      date,
      subjectId: activeSubject.subjectId,
      division: selectedDivision,
      presentStudentIds: Array.from(presentIds),
      period: activeSubject.period
    });
    alert(`Attendance for Period ${selectedPeriod} (${activeSubject.name}) saved. It is now locked.`);
    setSelectedPeriod(null);
  };

  const isPeriodMarked = (s: { subjectId: string, period: number, isLab: boolean }) => {
    // If override exists for this period, check for attendance with override subjectId
    const subjId = (overrideSubjectId && s.period === selectedPeriod) ? overrideSubjectId : s.subjectId;
    return attendance.some(r => 
      r.date === date && 
      r.subjectId === subjId && 
      r.period === s.period &&
      r.division === selectedDivision
    );
  };

  const formattedDate = useMemo(() => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [date]);

  // Generate full week schedule
  const weekSchedule = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedules: { [key: string]: { period: number, subjectId: string, name: string, isLab: boolean }[] } = {};
    
    days.forEach((day, index) => {
      schedules[day] = getScheduleForDay(index, selectedYear, selectedDivision);
    });
    
    return { days, schedules };
  }, [selectedYear, selectedDivision]);

  const [showWeeklyTable, setShowWeeklyTable] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-700 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-white space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Session Date</p>
            <h2 className="text-lg font-black leading-tight">{formattedDate}</h2>
          </div>
          <div className="relative group">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <Calendar className="w-6 h-6" />
              <input 
                type="date" 
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedPeriod(null);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Academic Year</p>
            <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm border border-white/10">
              {[1, 2, 3, 4].map(y => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y as Year); setSelectedPeriod(null); }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedYear === y ? 'bg-white text-indigo-700 shadow-lg scale-105' : 'text-indigo-100 hover:bg-white/10'}`}
                >
                  Y{y}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Division</p>
            <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm border border-white/10">
              {['A', 'B', 'C', 'D'].map(d => (
                <button
                  key={d}
                  onClick={() => { setSelectedDivision(d as Division); setSelectedPeriod(null); }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all ${selectedDivision === d ? 'bg-white text-indigo-700 shadow-lg scale-105' : 'text-indigo-100 hover:bg-white/10'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Timetable Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Timetable - Year {selectedYear} Division {selectedDivision}</h3>
          <button
            onClick={() => setShowWeeklyTable(!showWeeklyTable)}
            className="text-[9px] font-black text-indigo-600 uppercase hover:text-indigo-700 transition-colors"
          >
            {showWeeklyTable ? 'Hide' : 'Show'} Table
          </button>
        </div>

        {showWeeklyTable && (
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-indigo-25">
                  <th className="px-3 py-2.5 text-left font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-indigo-50 w-16">Day</th>
                  {[1, 2, 3, 4, 5, 6, 7].map(period => (
                    <th key={period} className="px-2 py-2.5 text-center font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                      P{period}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekSchedule.days.map((day, dayIndex) => (
                  <tr key={day} className={`border-b border-slate-100 ${dayIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-25 transition-colors`}>
                    <td className="px-3 py-2.5 font-black text-slate-700 uppercase tracking-widest sticky left-0 bg-gradient-to-r from-indigo-50 to-transparent w-16">
                      {day.substring(0, 3)}
                    </td>
                    {weekSchedule.schedules[day].map((subject, periodIndex) => (
                      <td key={periodIndex} className="px-2 py-2.5 text-center">
                        <div className={`py-1.5 px-1.5 rounded-lg text-[9px] font-black leading-tight transition-all ${
                          subject.isLab 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          <div className="truncate">{subject.name}</div>
                          {subject.isLab && <div className="text-[7px] uppercase tracking-tighter opacity-75">Lab</div>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Schedule (Period Details)</h3>
          {isDayLocked && <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100"><Lock className="w-2.5 h-2.5"/> Full Day Locked</span>}
        </div>
        
        <div className="space-y-2.5">
          {schedule.map((s) => {
            const marked = isPeriodMarked(s);
            const subLocked = !!locks[`${date}_${s.subjectId}_P${s.period}_${selectedDivision}`];
            const isActive = selectedPeriod === s.period;
            
            return (
              <button
                key={s.period}
                onClick={() => setSelectedPeriod(s.period)}
                className={`w-full group relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all text-left ${
                  isActive 
                    ? 'ring-4 ring-indigo-500/10 bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-500/10' 
                    : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-transform ${
                  isActive ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-50 text-slate-400'
                }`}>
                  <span className="text-[8px] uppercase tracking-tighter">P</span>
                  <span className="text-sm">{s.period}</span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>{s.name}</p>
                    {s.isLab && <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-lg font-black tracking-widest">LAB</span>}
                  </div>
                  <div className="flex gap-2.5">
                    {marked && <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-0.5 tracking-wider"><Check className="w-3 h-3"/> Recorded</span>}
                    {subLocked && !marked && <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-0.5 tracking-wider"><Lock className="w-3 h-3"/> Locked</span>}
                    {isDayLocked && <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Closed</span>}
                    {!marked && !subLocked && !isDayLocked && <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pending</span>}
                  </div>
                </div>

                <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'text-indigo-600 translate-x-1' : 'text-slate-200'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {selectedPeriod && activeSubject && (
        <div className="space-y-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase ${activeSubject.isLab ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  Period {selectedPeriod}
                </span>
                <h3 className="font-black text-slate-800 text-lg">{activeSubject.name} {overrideSubjectId && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg ml-2">Override</span>}</h3>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {presentIds.size} Students Present / {filteredStudents.length} Total
              </p>
            </div>
            
            {isAlreadyMarked ? (
               <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                  <Check className="w-3.5 h-3.5" /> Session Finalized
                </div>
                {isAdmin && <p className="text-[8px] font-black text-slate-400 uppercase">Use Admin tab to edit</p>}
               </div>
            ) : isLocked ? (
              <div className="flex items-center gap-1.5 text-red-500 font-black text-[10px] uppercase bg-red-50 px-4 py-3 rounded-2xl border border-red-100 shadow-sm">
                <Lock className="w-3.5 h-3.5" /> 
                {isDayLocked ? 'Day Locked' : 'Subject Locked'}
              </div>
            ) : (
              <button 
                onClick={handleSave}
                className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" /> Save & Finalize
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredStudents.map((student, idx) => (
              <div 
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`flex items-center justify-between p-4 rounded-[1.75rem] border-2 transition-all ${
                  presentIds.has(student.id) 
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                    : 'bg-red-50 border-red-200'
                } ${isLocked ? 'cursor-not-allowed opacity-80 filter grayscale-[0.2]' : 'cursor-pointer active:scale-[0.98]'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${
                    presentIds.has(student.id) ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{student.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{student.rollNo}</p>
                  </div>
                </div>
                
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                  presentIds.has(student.id) ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
                }`}>
                  {presentIds.has(student.id) ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedPeriod && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300 bg-slate-50/50 rounded-[3.5rem] border-4 border-dashed border-slate-100">
          <BookOpen className="w-16 h-16 opacity-20 mb-4" />
          <p className="font-black text-[10px] uppercase tracking-[0.2em] text-center px-10 leading-relaxed">
            Select a period from the timetable to start marking attendance
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
