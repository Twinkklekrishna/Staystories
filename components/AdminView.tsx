
import React, { useState, useMemo } from 'react';
import { Lock, Unlock, ShieldCheck, LogOut, KeyRound, AlertCircle, Trash2, Calendar, Edit3, Check, X, Search, ChevronRight } from 'lucide-react';
import { LockState, AttendanceRecord, Year, Division } from '../types';
import { STUDENTS, SUBJECTS } from '../constants';

interface Props {
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  locks: LockState;
  attendance: AttendanceRecord[];
  onToggleLock: (key: string) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

const AdminView: React.FC<Props> = ({ isAdmin, onLogin, onLogout, locks, attendance, onToggleLock, onUpdateAttendance }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  // Selection state for editor
  const [editDate, setEditDate] = useState(new Date().toISOString().split('T')[0]);
  const [editYear, setEditYear] = useState<Year>(1);
  const [editDivision, setEditDivision] = useState<Division>('A');
  const [editingSession, setEditingSession] = useState<AttendanceRecord | null>(null);
  const [editPresentIds, setEditPresentIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(password)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const sessionsForSelection = useMemo(() => {
    return attendance.filter(r => 
      r.date === editDate && 
      r.division === editDivision && 
      SUBJECTS.find(s => s.id === r.subjectId)?.year === editYear
    ).sort((a, b) => (a.period || 0) - (b.period || 0));
  }, [attendance, editDate, editYear, editDivision]);

  const studentsInBatch = useMemo(() => {
    return STUDENTS.filter(s => s.year === editYear && s.division === editDivision)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [editYear, editDivision]);

  const startEditing = (session: AttendanceRecord) => {
    setEditingSession(session);
    setEditPresentIds(new Set(session.presentStudentIds));
  };

  const handleUpdate = () => {
    if (!editingSession) return;
    onUpdateAttendance({
      ...editingSession,
      presentStudentIds: Array.from(editPresentIds)
    });
    alert("Record updated successfully.");
    setEditingSession(null);
  };

  const toggleEditStudent = (id: string) => {
    setEditPresentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isAdmin) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 pt-20">
        <div className="bg-indigo-100 p-8 rounded-full">
          <ShieldCheck className="w-16 h-16 text-indigo-600" />
        </div>
        <div className="text-center px-6">
          <h2 className="text-2xl font-black text-slate-800">Admin Portal</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Authentication required to manage class locks and edit marked records.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="password" 
              placeholder="System Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white pl-11 pr-4 py-4 rounded-3xl border ${error ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-200'} outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-black text-center tracking-widest`}
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all"
          >
            Enter Admin Mode
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Admin Tools</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Master Control Panel</p>
        </div>
        <button 
          onClick={onLogout}
          className="p-4 bg-red-50 text-red-600 rounded-3xl hover:bg-red-100 transition-colors shadow-sm"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Session Editor Selection */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-amber-100 p-2 rounded-xl">
               <Edit3 className="w-4 h-4 text-amber-600" />
             </div>
             <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Class Attendance Editor</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</p>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <input 
                  type="date" 
                  value={editDate}
                  onChange={(e) => { setEditDate(e.target.value); setEditingSession(null); }}
                  className="bg-transparent font-bold outline-none cursor-pointer w-full text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</p>
                <select 
                  value={editYear} 
                  onChange={(e) => { setEditYear(Number(e.target.value) as Year); setEditingSession(null); }}
                  className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 font-bold outline-none text-sm"
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</p>
                <select 
                  value={editDivision} 
                  onChange={(e) => { setEditDivision(e.target.value as Division); setEditingSession(null); }}
                  className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 font-bold outline-none text-sm"
                >
                  {['A','B','C','D'].map(d => <option key={d} value={d}>Division {d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Marked Sessions</p>
            <div className="space-y-2">
              {sessionsForSelection.map(s => (
                <button 
                  key={`${s.subjectId}_${s.period}`}
                  onClick={() => startEditing(s)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    editingSession?.subjectId === s.subjectId && editingSession?.period === s.period
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <p className="text-xs font-black">{SUBJECTS.find(sub => sub.id === s.subjectId)?.name}</p>
                    <p className={`text-[9px] font-bold uppercase ${editingSession?.subjectId === s.subjectId ? 'text-indigo-200' : 'text-slate-400'}`}>Period {s.period} • {s.presentStudentIds.length} Students</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${editingSession?.subjectId === s.subjectId ? 'text-white' : 'text-slate-300'}`} />
                </button>
              ))}
              {sessionsForSelection.length === 0 && (
                <p className="text-center py-4 text-[10px] font-bold text-slate-400 italic">No attendance marked for this date/batch yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Live Editor Block */}
        {editingSession && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center px-1">
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Editing Session</p>
                 <h4 className="text-sm font-black text-slate-800">{SUBJECTS.find(s => s.id === editingSession.subjectId)?.name}</h4>
               </div>
               <button 
                onClick={handleUpdate}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
               >
                 Confirm Updates
               </button>
             </div>

             <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                {studentsInBatch.map((student, idx) => (
                  <div 
                    key={student.id}
                    onClick={() => toggleEditStudent(student.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      editPresentIds.has(student.id) 
                        ? 'bg-emerald-50 border-emerald-100' 
                        : 'bg-red-50 border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-slate-400 w-4">{idx + 1}</span>
                       <p className="text-xs font-bold text-slate-800">{student.name}</p>
                    </div>
                    <div className={`p-1.5 rounded-lg ${editPresentIds.has(student.id) ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {editPresentIds.has(student.id) ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Locks Section */}
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-black text-sm uppercase tracking-widest">System Locks</h3>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">Current View Date Lock</p>
              <h4 className="text-xs font-black">{editDate} status: {locks[`${editDate}_locked`] ? 'LOCKED' : 'OPEN'}</h4>
            </div>
            <button 
              onClick={() => onToggleLock(`${editDate}_locked`)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                locks[`${editDate}_locked`] ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {locks[`${editDate}_locked`] ? 'Unlock Day' : 'Lock Day'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 space-y-4">
          <h3 className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">System Reset</h3>
          <button 
            onClick={() => {
              if (confirm("Reset ALL attendance and locks? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-3xl font-black uppercase tracking-widest text-[11px] border border-red-100 hover:bg-red-100 transition-all active:scale-95"
          >
            <span>Reset Database</span>
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
