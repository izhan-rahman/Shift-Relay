import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layout/MainLayout';
import MainContent from './components/MainContent';
import BottomProgressPanel from './components/BottomProgressPanel';
import ShiftNotification from './components/ShiftNotification';
import ResumeNotification from './components/ResumeNotification';
import MasterDashboard from './pages/MasterDashboard';
import LoginPage from './pages/LoginPage';
import { getShiftStatus, getUpcomingShiftNotification, formatRemaining, formatDuration } from './utils/shiftSchedule';
import { fetchSharedState, fetchSchedule } from './utils/stateApi';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function getRunnerStatus(name, loggedIn, pause) {
  if (loggedIn.includes(name)) return "running";
  if (pause[name]) return "paused";
  return "waiting";
}

function Dashboard() {
  const { user, logout, resumeInfo, dismissResumeInfo } = useAuth();
  const [shift, setShift] = useState(() => getShiftStatus());
  const [notif, setNotif] = useState(null);
  const [loggedIn, setLoggedIn] = useState([]);
  const [pauseState, setPauseState] = useState({});
  const [schedule, setSchedule] = useState([]);

  // Fetch schedule from server once, then refresh every 60s
  useEffect(() => {
    const loadSchedule = async () => {
      const s = await fetchSchedule();
      if (s.length > 0) setSchedule(s);
    };
    loadSchedule();
    const iv = setInterval(loadSchedule, 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const tick = async () => {
      const now = new Date();
      setShift(getShiftStatus(now, schedule));
      setNotif(getUpcomingShiftNotification(now, 30, schedule));
      const s = await fetchSharedState();
      setLoggedIn(s.loggedInEmployees || []);
      setPauseState(s.pauseState || {});
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [schedule]);

  const employees = schedule.map((s, i) => ({
    name: s.name,
    time: s.label || `${s.startHour}:00 – ${s.endHour > 24 ? s.endHour - 24 : s.endHour}:00`,
  }));

  const rem = formatRemaining(shift.remainingMs);
  const st = getRunnerStatus(shift.shiftName, loggedIn, pauseState);
  const p = pauseState[shift.shiftName];
  const pProg = p?.pausedProgress ?? null;
  const pDur = p ? formatDuration(Date.now() - p.pausedAtTime) : '';
  const dProg = st === "paused" ? (pProg ?? 0) : st === "waiting" ? 0 : shift.progress;

  return (
    <MainLayout currentRunner={shift.shiftName} user={user} onLogout={logout}>
      <div className="flex flex-col h-[calc(100vh-64px)] relative">
        {notif && <ShiftNotification name={notif.name} shift={notif.shift} minutesUntil={notif.minutesUntil} />}
        {resumeInfo && <ResumeNotification name={resumeInfo.name} gapMs={resumeInfo.gapMs} onDismiss={dismissResumeInfo} />}
        <div className="flex-1 overflow-hidden relative pb-[140px]">
          <MainContent activeIndex={shift.activeIndex} progress={shift.progress} loggedInEmployees={loggedIn} runnerStatus={st} pausedProgress={pProg} pauseDuration={pDur} employees={employees} />
        </div>
        <BottomProgressPanel currentRunner={shift.shiftName} progress={dProg} remaining={rem} runnerStatus={st} pauseDuration={pDur} employees={employees} />
      </div>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/master" element={<ProtectedRoute><MasterDashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
