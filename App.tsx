import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, ShieldAlert, CheckCircle2, XCircle, ChevronLeft, Lock, Unlock, Calendar, LayoutGrid, Users } from 'lucide-react';
import { SUBJECTS, STUDENTS, ADMIN_PASSWORD } from './constants';
import { AttendanceRecord, LockState, Year, Division, Subject } from './types';
import AttendanceView from './components/AttendanceView';
import StatsView from './components/StatsView';
import AdminView from './components/AdminView';
import StudentDetailsView from './components/StudentDetailsView';
import { generateMockAttendance } from './mockData';
import { apiService } from './apiService';

const Header: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const location = useLocation();
  const showAdminBadge = isAdmin && location.pathname === '/admin';

  return (
    <header className="bg-indigo-700 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          <span>Sahrdaya Attendance</span>
        </h1>
        {showAdminBadge && (
          <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Admin Mode
          </span>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [locks, setLocks] = useState<LockState>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Load initial data from backend or use mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Function to fetch with timeout
        const fetchWithTimeout = (url: string, timeout = 3000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('timeout')), timeout)
            )
          ]);
        };

        // Test if backend is available - try Vercel API first, then localhost
        let healthCheck = null;
        
        // On Vercel, try the /api endpoint
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
          healthCheck = await fetchWithTimeout('/api/health', 2000).catch(() => null);
        }
        
        // If running locally or Vercel failed, try localhost
        if (!healthCheck?.ok && window.location.hostname.includes('localhost')) {
          healthCheck = await fetchWithTimeout('http://localhost:5000/api/health', 2000).catch(() => null);
        }
        
        if (healthCheck?.ok) {
          setUseBackend(true);
          // Load from backend
          const [attendanceData, locksData] = await Promise.all([
            apiService.getAttendance(),
            apiService.getLocks()
          ]);
          setAttendance(attendanceData || []);
          setLocks(locksData || {});
        } else {
          // Fallback to localStorage with mock data
          setUseBackend(false);
          const saved = localStorage.getItem('sahrdaya_attendance');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAttendance(parsed);
            } else {
              const mockData = generateMockAttendance();
              setAttendance(mockData);
              localStorage.setItem('sahrdaya_attendance', JSON.stringify(mockData));
            }
          } else {
            const mockData = generateMockAttendance();
            setAttendance(mockData);
            localStorage.setItem('sahrdaya_attendance', JSON.stringify(mockData));
          }
          
          const savedLocks = localStorage.getItem('sahrdaya_locks');
          setLocks(savedLocks ? JSON.parse(savedLocks) : {});
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setUseBackend(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync attendance to backend/localStorage
  useEffect(() => {
    if (useBackend && attendance.length > 0) {
      // Debounce: save to backend
      const timer = setTimeout(() => {
        attendance.forEach(record => {
          apiService.saveAttendance(record).catch(console.error);
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!useBackend) {
      localStorage.setItem('sahrdaya_attendance', JSON.stringify(attendance));
    }
  }, [attendance, useBackend]);

  // Sync locks to backend/localStorage
  useEffect(() => {
    if (useBackend && Object.keys(locks).length > 0) {
      const timer = setTimeout(() => {
        Object.entries(locks).forEach(([key, value]) => {
          if (value) {
            apiService.toggleLock(key).catch(console.error);
          }
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!useBackend) {
      localStorage.setItem('sahrdaya_locks', JSON.stringify(locks));
    }
  }, [locks, useBackend]);

  const saveAttendance = (newRecord: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(r => 
        !(r.date === newRecord.date && 
          r.subjectId === newRecord.subjectId && 
          r.period === newRecord.period &&
          r.division === newRecord.division)
      );
      return [...filtered, newRecord];
    });
    
    // Auto lock for non-admins to prevent teacher re-edits
    if (!isAdmin) {
      const lockKey = newRecord.period 
        ? `${newRecord.date}_${newRecord.subjectId}_P${newRecord.period}_${newRecord.division}`
        : `${newRecord.date}_${newRecord.subjectId}_${newRecord.division}`;

      setLocks(prev => ({ ...prev, [lockKey]: true }));
    }
  };

  const updateAttendance = (updatedRecord: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(r => 
        !(r.date === updatedRecord.date && 
          r.subjectId === updatedRecord.subjectId && 
          r.period === updatedRecord.period &&
          r.division === updatedRecord.division)
      );
      return [...filtered, updatedRecord];
    });
  };

  const handleAdminLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('is_admin');
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
        <Header isAdmin={isAdmin} />

        {/* Content */}
        <main className="flex-1 pb-24 p-4 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin p-4 bg-indigo-500 rounded-full">
                  <div className="w-6 h-6"></div>
                </div>
                <p className="mt-4 text-slate-600 font-semibold">Loading attendance data...</p>
                <p className="text-xs text-slate-400 mt-1">{useBackend ? 'Using Backend' : 'Using Local Storage'}</p>
              </div>
            </div>
          ) : selectedStudent ? (
            <StudentDetailsView 
              studentId={selectedStudent} 
              attendance={attendance}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            <Routes>
              <Route path="/" element={<AttendanceView attendance={attendance} locks={locks} onSave={saveAttendance} isAdmin={isAdmin} />} />
              <Route path="/stats" element={<StatsView attendance={attendance} onSelectStudent={setSelectedStudent} />} />
              <Route path="/admin" element={<AdminView 
                isAdmin={isAdmin} 
                onLogin={handleAdminLogin} 
                onLogout={handleAdminLogout}
                locks={locks}
                attendance={attendance}
                onToggleLock={(key) => setLocks(prev => ({ ...prev, [key]: !prev[key] }))}
                onUpdateAttendance={updateAttendance}
              />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center z-50">
          <NavLink to="/" icon={<Home className="w-6 h-6" />} label="Attendance" />
          <NavLink to="/stats" icon={<BarChart3 className="w-6 h-6" />} label="Statistics" />
          <NavLink to="/admin" icon={<ShieldAlert className="w-6 h-6" />} label="Admin" />
        </nav>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

export default App;
