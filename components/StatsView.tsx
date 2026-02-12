
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Search, Filter, TrendingUp, Info } from 'lucide-react';
import { AttendanceRecord, Year, Division } from '../types';
import { STUDENTS, SUBJECTS } from '../constants';

interface Props {
  attendance: AttendanceRecord[];
  onSelectStudent?: (studentId: string) => void;
}

const StatsView: React.FC<Props> = ({ attendance, onSelectStudent }) => {
  const [year, setYear] = useState<Year>(1);
  const [division, setDivision] = useState<Division>('A');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    // Filter and sort students alphabetically
    const studentsInBatch = STUDENTS.filter(s => s.year === year && s.division === division)
      .sort((a, b) => a.name.localeCompare(b.name));
      
    const batchAttendance = attendance.filter(r => r.division === division && SUBJECTS.find(s => s.id === r.subjectId)?.year === year);
    
    // Group attendance by date/subject/period for normalization
    const uniqueSessionsCount = batchAttendance.length;

    return studentsInBatch.map((student, index) => {
      const presenceCount = batchAttendance.filter(r => r.presentStudentIds.includes(student.id)).length;
      const percentage = uniqueSessionsCount === 0 ? 100 : (presenceCount / uniqueSessionsCount) * 100;
      
      let color = 'text-red-600 bg-red-50 border-red-100'; // Default: < 80% (includes below 75)
      
      if (percentage >= 90) {
        color = 'text-emerald-600 bg-emerald-50 border-emerald-100'; // Green: 90+
      } else if (percentage >= 80) {
        color = 'text-amber-600 bg-amber-50 border-amber-100'; // Yellow: 80+
      }

      return { ...student, orderIndex: index + 1, presenceCount, percentage, color, totalSessions: uniqueSessionsCount };
    });
  }, [attendance, year, division]);

  const filteredStats = stats.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const avgAttendance = stats.length ? stats.reduce((acc, curr) => acc + curr.percentage, 0) / stats.length : 0;

  return (
    <div className="space-y-6">
      <div className="bg-indigo-700 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Batch Average</p>
            <h2 className="text-4xl font-black">{avgAttendance.toFixed(1)}%</h2>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-white/10 p-3 rounded-2xl">
            <p className="text-[10px] text-indigo-100 font-bold uppercase">Year</p>
            <select 
              value={year}
              onChange={(e) => setYear(Number(e.target.value) as Year)}
              className="bg-transparent text-white font-bold outline-none w-full cursor-pointer"
            >
              {[1,2,3,4].map(y => <option key={y} value={y} className="text-slate-800">Year {y}</option>)}
            </select>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl">
            <p className="text-[10px] text-indigo-100 font-bold uppercase">Division</p>
            <select 
              value={division}
              onChange={(e) => setDivision(e.target.value as Division)}
              className="bg-transparent text-white font-bold outline-none w-full cursor-pointer"
            >
              {['A','B','C','D'].map(d => <option key={d} value={d} className="text-slate-800">Division {d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 px-1">
          <Badge label="90%+" color="bg-emerald-500" />
          <Badge label="80%+" color="bg-amber-500" />
          <Badge label="<80%" color="bg-red-500" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredStats.map(student => (
            <button
              key={student.id}
              onClick={() => onSelectStudent?.(student.id)}
              className="text-left bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                  {student.orderIndex}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">{student.rollNo}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-sm font-black ${student.color}`}>
                {student.percentage.toFixed(0)}%
              </div>
            </button>
          ))}
          {filteredStats.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>No records found for this selection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ label: string, color: string }> = ({ label, color }) => (
  <div className="flex items-center gap-1">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
  </div>
);

export default StatsView;
