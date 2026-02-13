import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MainContent from '../components/MainContent';
import { getShiftStatus, formatRemaining, formatDuration } from '../utils/shiftSchedule';
import { fetchSharedState } from '../utils/stateApi';
import { Users, Clock, LogOut, Shield, Radio, User, Timer, TrendingUp, Sun, Moon } from 'lucide-react';

const EMP = [
    { name: "SUHAIL", shift: "9:00 AM – 6:00 PM" },
    { name: "AZEEZ", shift: "6:00 PM – 2:00 AM" },
    { name: "IQBAL", shift: "2:00 AM – 9:00 AM" },
];

function rs(n, li, ps) { return li.includes(n) ? "running" : ps[n] ? "paused" : "waiting"; }

export default function MasterDashboard() {
    const { logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [shift, setShift] = useState(() => getShiftStatus());
    const [time, setTime] = useState(new Date());
    const [loggedIn, setLoggedIn] = useState([]);
    const [pauseState, setPauseState] = useState({});

    useEffect(() => {
        const tick = async () => { const now = new Date(); setTime(now); setShift(getShiftStatus(now)); const s = await fetchSharedState(); setLoggedIn(s.loggedInEmployees || []); setPauseState(s.pauseState || {}); };
        tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
    }, []);

    const rem = formatRemaining(shift.remainingMs), pct = Math.round(shift.progress * 100);
    const hh = String(time.getHours()).padStart(2, '0'), mm = String(time.getMinutes()).padStart(2, '0'), ss = String(time.getSeconds()).padStart(2, '0');
    const status = rs(shift.shiftName, loggedIn, pauseState);
    const p = pauseState[shift.shiftName], pProg = p?.pausedProgress ?? null;
    const pDur = p ? formatDuration(Date.now() - p.pausedAtTime) : '';
    const dPct = status === "paused" ? Math.round((pProg ?? 0) * 100) : status === "waiting" ? 0 : pct;

    return (
        <div className="min-h-screen t-bg font-sans antialiased transition-colors duration-300">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-purple-500/[0.02]' : 'bg-purple-500/[0.04]'}`}></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 glass-strong flex items-center justify-between px-8 z-50" style={{ boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 2px 20px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20"><Shield className="w-5 h-5 text-white" /></div>
                    <div className="flex flex-col leading-tight">
                        <span className={`text-sm font-bold tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>MASTER CONTROL</span>
                        <span className={`text-[10px] font-medium tracking-[0.3em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Admin Dashboard</span>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse-glow"></div>
                    <span className={`text-xs font-semibold tracking-wider uppercase ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Master Access</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    </button>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-mono font-semibold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{hh}:{mm}<span className="text-purple-400">:{ss}</span></span>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"><LogOut className="w-4 h-4" /></button>
                </div>
            </nav>

            <main className="pt-20 px-8 pb-8 relative z-10 max-w-7xl mx-auto">
                {/* Overview Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card isDark={isDark} icon={<Radio className="w-4 h-4 text-cyan-500" />} label="Active Runner">
                        <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{shift.shiftName}</span>
                            <Badge status={status} isDark={isDark} />
                        </div>
                    </Card>
                    <Card isDark={isDark} icon={<TrendingUp className="w-4 h-4 text-blue-500" />} label="Shift Progress">
                        <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold font-mono tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{dPct}%</span>
                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div className={`h-full rounded-full transition-all duration-1000 ${status === "paused" ? 'bg-red-500' : status === "waiting" ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} style={{ width: `${dPct}%` }}></div>
                            </div>
                        </div>
                    </Card>
                    <Card isDark={isDark} icon={<Timer className="w-4 h-4 text-amber-500" />} label={status === "paused" ? "Paused For" : "Shift Ends In"}>
                        <span className={`text-2xl font-bold font-mono tabular-nums ${status === "paused" ? 'text-red-500' : isDark ? 'text-white' : 'text-slate-900'}`}>{status === "paused" ? pDur : rem.display}</span>
                    </Card>
                    <Card isDark={isDark} icon={<Users className="w-4 h-4 text-emerald-500" />} label="Online">
                        <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{loggedIn.length}</span>
                            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 3</span>
                            <div className="flex gap-1 ml-auto">{EMP.map(e => <div key={e.name} className={`w-2.5 h-2.5 rounded-full ${loggedIn.includes(e.name) ? 'bg-emerald-400' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>)}</div>
                        </div>
                    </Card>
                </div>

                {/* Live Track */}
                <div className="mb-6">
                    <h2 className={`text-xs uppercase tracking-[0.3em] font-semibold mb-4 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live Relay Track</h2>
                    <div className="h-[600px]"><MainContent activeIndex={shift.activeIndex} progress={shift.progress} loggedInEmployees={loggedIn} runnerStatus={status} pausedProgress={pProg} pauseDuration={pDur} /></div>
                </div>

                {/* Employee Status + Schedule */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-2">
                        <h2 className={`text-xs uppercase tracking-[0.3em] font-semibold mb-4 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Employee Status</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {EMP.map(emp => {
                                const on = loggedIn.includes(emp.name), cur = shift.shiftName === emp.name;
                                const ep = pauseState[emp.name], eP = cur && !on && !!ep, eW = cur && !on && !ep;
                                return (
                                    <div key={emp.name} className={`glass rounded-xl p-4 relative overflow-hidden transition-all duration-300 ${cur ? eP ? 'ring-1 ring-red-500/30' : eW ? 'ring-1 ring-amber-500/30' : 'ring-1 ring-cyan-500/30' : ''}`}>
                                        {cur && <div className={`absolute top-0 left-0 right-0 h-0.5 ${eP ? 'bg-red-500' : eW ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}></div>}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${eP ? isDark ? 'bg-red-500/15 border border-red-500/20' : 'bg-red-50 border border-red-200'
                                                        : eW ? isDark ? 'bg-amber-500/15 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                                                            : cur ? isDark ? 'bg-cyan-500/15 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'
                                                                : on ? isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                                                                    : isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-200'
                                                    }`}>
                                                    <User className={`w-4 h-4 ${eP ? 'text-red-400' : eW ? 'text-amber-500' : cur ? 'text-cyan-500' : on ? 'text-emerald-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <h3 className={`text-xs font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</h3>
                                                    <p className={`text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{emp.shift}</p>
                                                </div>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${eP ? 'bg-red-400 animate-pulse' : eW ? 'bg-amber-400 animate-pulse' : on ? 'bg-emerald-400' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${eP ? 'text-red-500' : eW ? 'text-amber-500' : cur ? 'text-cyan-500' : on ? 'text-emerald-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {eP ? `⏸ Paused · ${formatDuration(Date.now() - ep.pausedAtTime)}` : eW ? '⏳ Waiting' : cur ? '🔥 Running' : on ? '🟢 Online' : '⚫ Offline'}
                                        </span>
                                        {cur && <div className={`mt-2 h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}><div className={`h-full rounded-full ${eP ? 'bg-red-500' : eW ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} style={{ width: `${dPct}%` }}></div></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xs uppercase tracking-[0.3em] font-semibold mb-4 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Schedule</h2>
                        <div className="glass rounded-xl p-4 h-[calc(100%-32px)]">
                            <div className="relative h-full flex flex-col justify-between">
                                {[{ name: "IQBAL", color: "indigo", label: "2AM–9AM" }, { name: "SUHAIL", color: "cyan", label: "9AM–6PM" }, { name: "AZEEZ", color: "purple", label: "6PM–2AM" }].map(s => {
                                    const a = shift.shiftName === s.name;
                                    return (
                                        <div key={s.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${a ? isDark ? 'bg-slate-800/50' : 'bg-slate-100/60' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${s.color === 'cyan' ? 'bg-cyan-400' : s.color === 'purple' ? 'bg-purple-400' : 'bg-indigo-400'} ${a ? 'animate-pulse-glow' : 'opacity-40'}`}></div>
                                            <div className="flex-1">
                                                <span className={`text-xs font-bold ${a ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.name}</span>
                                                <p className={`text-[9px] font-mono ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{s.label}</p>
                                            </div>
                                            {a && <span className={`text-[8px] font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Now</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Card({ icon, label, children, isDark }) {
    return (
        <div className="glass rounded-xl p-5 space-y-3" style={{ boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className={`flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {icon}
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">{label}</span>
            </div>
            {children}
        </div>
    );
}

function Badge({ status, isDark }) {
    const map = { running: ['emerald', 'Running'], paused: ['red', 'Paused'], waiting: ['amber', 'Waiting'] };
    const [c, t] = map[status] || map.running;
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${isDark
                ? `bg-${c}-500/15 text-${c}-400 border-${c}-500/20`
                : `bg-${c}-50 text-${c}-600 border-${c}-200`
            } ${status !== "running" ? "animate-pulse" : ""}`}>{t}</span>
    );
}
