import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MainContent from '../components/MainContent';
import { getShiftStatus, formatRemaining, formatDuration, buildShiftLabel } from '../utils/shiftSchedule';
import { fetchSharedState, fetchSchedule, fetchEmployees, createEmployee, updateEmployee, deleteEmployee, fetchShifts, createShift, updateShift, deleteShift } from '../utils/stateApi';
import { Users, Clock, LogOut, Shield, Radio, User, Timer, TrendingUp, Sun, Moon, Plus, Trash2, Edit3, X, Check, CalendarDays, AlertCircle } from 'lucide-react';

function rs(n, li, ps) { return li.includes(n) ? "running" : ps[n] ? "paused" : "waiting"; }

export default function MasterDashboard() {
    const { logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [tab, setTab] = useState('overview');
    const [shift, setShift] = useState(() => getShiftStatus());
    const [time, setTime] = useState(new Date());
    const [loggedIn, setLoggedIn] = useState([]);
    const [pauseState, setPauseState] = useState({});
    const [schedule, setSchedule] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [allShifts, setAllShifts] = useState([]);

    // ─── Load data ───────────────────────────────────────────
    const loadData = async () => {
        const [emps, shifts, sched] = await Promise.all([fetchEmployees(), fetchShifts(), fetchSchedule()]);
        setAllEmployees(emps);
        setAllShifts(shifts);
        if (sched.length > 0) setSchedule(sched);
    };

    useEffect(() => { loadData(); }, []);

    useEffect(() => {
        const tick = async () => {
            const now = new Date();
            setTime(now);
            setShift(getShiftStatus(now, schedule));
            const s = await fetchSharedState();
            setLoggedIn(s.loggedInEmployees || []);
            setPauseState(s.pauseState || {});
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [schedule]);

    const employees = schedule.map(s => ({ name: s.name, shift: s.label || `${s.startHour}:00 – ${s.endHour}:00` }));
    const rem = formatRemaining(shift.remainingMs), pct = Math.round(shift.progress * 100);
    const hh = String(time.getHours()).padStart(2, '0'), mm = String(time.getMinutes()).padStart(2, '0'), ss = String(time.getSeconds()).padStart(2, '0');
    const status = rs(shift.shiftName, loggedIn, pauseState);
    const p = pauseState[shift.shiftName], pProg = p?.pausedProgress ?? null;
    const pDur = p ? formatDuration(Date.now() - p.pausedAtTime) : '';
    const dPct = status === "paused" ? Math.round((pProg ?? 0) * 100) : status === "waiting" ? 0 : pct;

    const TABS = [
        { id: 'overview', label: 'Overview', icon: Radio },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'shifts', label: 'Manage Shifts', icon: CalendarDays },
    ];

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

                {/* Tab Navigation */}
                <div className="flex items-center gap-1">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${tab === t.id
                                ? isDark ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-600 border border-purple-200'
                                : isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}>
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    ))}
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
                {tab === 'overview' && <OverviewTab isDark={isDark} shift={shift} status={status} dPct={dPct} pDur={pDur} rem={rem} loggedIn={loggedIn} pauseState={pauseState} employees={employees} pProg={pProg} schedule={schedule} />}
                {tab === 'users' && <UsersTab isDark={isDark} allEmployees={allEmployees} onRefresh={loadData} />}
                {tab === 'shifts' && <ShiftsTab isDark={isDark} allShifts={allShifts} allEmployees={allEmployees} onRefresh={loadData} />}
            </main>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
function OverviewTab({ isDark, shift, status, dPct, pDur, rem, loggedIn, pauseState, employees, pProg, schedule }) {
    return (
        <>
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
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {employees.length || 3}</span>
                        <div className="flex gap-1 ml-auto">{employees.map(e => <div key={e.name} className={`w-2.5 h-2.5 rounded-full ${loggedIn.includes(e.name) ? 'bg-emerald-400' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>)}</div>
                    </div>
                </Card>
            </div>

            {/* Live Track */}
            <div className="mb-6">
                <h2 className={`text-xs uppercase tracking-[0.3em] font-semibold mb-4 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live Relay Track</h2>
                <div className="h-[600px]">
                    <MainContent activeIndex={shift.activeIndex} progress={shift.progress} loggedInEmployees={loggedIn} runnerStatus={status} pausedProgress={pProg} pauseDuration={pDur} employees={employees.map(e => ({ name: e.name, time: e.shift }))} />
                </div>
            </div>

            {/* Employee Status + Schedule */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2">
                    <h2 className={`text-xs uppercase tracking-[0.3em] font-semibold mb-4 px-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Employee Status</h2>
                    <div className={`grid ${employees.length <= 3 ? 'grid-cols-3' : employees.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
                        {employees.map(emp => {
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
                        <div className="relative h-full flex flex-col gap-2">
                            {schedule.map((s, i) => {
                                const a = shift.shiftName === s.name;
                                const colors = ['cyan', 'blue', 'indigo', 'purple', 'emerald', 'violet'];
                                const color = colors[i % colors.length];
                                return (
                                    <div key={s.id || i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${a ? isDark ? 'bg-slate-800/50' : 'bg-slate-100/60' : ''}`}>
                                        <div className={`w-2 h-2 rounded-full bg-${color}-400 ${a ? 'animate-pulse-glow' : 'opacity-40'}`}></div>
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
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════
function UsersTab({ isDark, allEmployees, onRefresh }) {
    const [showForm, setShowForm] = useState(false);
    const [editingName, setEditingName] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => { setForm({ name: '', email: '', password: '', role: 'employee' }); setShowForm(false); setEditingName(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        let result;
        if (editingName) {
            const updates = { ...form };
            if (!updates.password) delete updates.password; // don't send empty password
            result = await updateEmployee(editingName, updates);
        } else {
            if (!form.name || !form.password) { setError('Name and password are required'); setLoading(false); return; }
            result = await createEmployee(form);
        }
        setLoading(false);
        if (result.success) { resetForm(); await onRefresh(); }
        else setError(result.error || 'Operation failed');
    };

    const handleEdit = (emp) => {
        setEditingName(emp.name);
        setForm({ name: emp.name, email: emp.email || '', password: '', role: emp.role });
        setShowForm(true);
    };

    const handleDelete = async (name) => {
        if (!confirm(`Delete employee "${name}"? This cannot be undone.`)) return;
        await deleteEmployee(name);
        await onRefresh();
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manage Users</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Create, edit, and remove employee accounts</p>
                </div>
                {!showForm && (
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold tracking-wide uppercase shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="glass rounded-xl p-6 mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingName ? `Edit ${editingName}` : 'New Employee'}</h3>
                        <button onClick={resetForm} className={`p-1.5 rounded-lg hover:bg-slate-700/50 ${isDark ? 'text-slate-500' : 'text-slate-400'} hover:text-slate-300 transition-colors`}><X className="w-4 h-4" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={!!editingName}
                                className={`w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${editingName ? 'opacity-50' : ''}`} placeholder="e.g. FARHAN" />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Email</label>
                            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500/30" placeholder="email@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Password {editingName && <span className="text-slate-600">(leave blank to keep)</span>}</label>
                            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500/30" placeholder={editingName ? '••••••' : 'Password'} required={!editingName} />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Role</label>
                            <div className="flex items-center gap-2">
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="flex-1 px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-purple-500/30">
                                    <option value="employee">Employee</option>
                                    <option value="master">Master</option>
                                </select>
                                <button type="submit" disabled={loading}
                                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                    {loading ? '...' : <Check className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </form>
                    {error && <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
                </div>
            )}

            {/* Employees Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500 border-b border-slate-800' : 'text-slate-400 border-b border-slate-200'}`}>
                            <th className="text-left px-6 py-4">Name</th>
                            <th className="text-left px-6 py-4">Email</th>
                            <th className="text-left px-6 py-4">Role</th>
                            <th className="text-right px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allEmployees.map(emp => (
                            <tr key={emp.name} className={`${isDark ? 'border-b border-slate-800/50 hover:bg-slate-800/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition-colors`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${emp.role === 'master' ? 'bg-purple-500/15' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            {emp.role === 'master' ? <Shield className="w-4 h-4 text-purple-400" /> : <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />}
                                        </div>
                                        <span className={`text-sm font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>{emp.name}</span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.email || '—'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${emp.role === 'master'
                                        ? isDark ? 'bg-purple-500/15 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'
                                        : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>{emp.role}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(emp)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500 hover:text-cyan-400' : 'hover:bg-slate-100 text-slate-400 hover:text-cyan-600'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(emp.name)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allEmployees.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No employees found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHIFTS TAB
// ═══════════════════════════════════════════════════════════════
function ShiftsTab({ isDark, allShifts, allEmployees, onRefresh }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', startHour: 9, endHour: 17, order: 1, effectiveFrom: '', effectiveUntil: '', rangePreset: 'ongoing' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const endOfWeek = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);

    const applyPreset = (preset) => {
        setForm(f => {
            switch (preset) {
                case 'today': return { ...f, effectiveFrom: today, effectiveUntil: today, rangePreset: 'today' };
                case 'week': return { ...f, effectiveFrom: today, effectiveUntil: endOfWeek, rangePreset: 'week' };
                case 'month': return { ...f, effectiveFrom: today, effectiveUntil: endOfMonth, rangePreset: 'month' };
                case 'ongoing': return { ...f, effectiveFrom: today, effectiveUntil: '', rangePreset: 'ongoing' };
                case 'custom': return { ...f, rangePreset: 'custom' };
                default: return f;
            }
        });
    };

    const resetForm = () => { setForm({ name: '', startHour: 9, endHour: 17, order: 1, effectiveFrom: '', effectiveUntil: '', rangePreset: 'ongoing' }); setShowForm(false); setEditingId(null); setError(''); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        const startH = Number(form.startHour);
        let endH = Number(form.endHour);
        // Handle crossing midnight: if end < start, add 24
        if (endH <= startH) endH += 24;
        const label = buildShiftLabel(startH, endH);
        const payload = {
            name: form.name,
            startHour: startH,
            endHour: endH,
            label,
            order: Number(form.order),
            effectiveFrom: form.effectiveFrom || today,
            effectiveUntil: form.effectiveUntil || null,
        };
        let result;
        if (editingId) result = await updateShift(editingId, payload);
        else result = await createShift(payload);
        setLoading(false);
        if (result.success) { resetForm(); await onRefresh(); }
        else setError(result.error || 'Operation failed');
    };

    const handleEdit = (shift) => {
        setEditingId(shift.id);
        const endH = shift.endHour > 24 ? shift.endHour - 24 : shift.endHour;
        setForm({
            name: shift.name,
            startHour: shift.startHour,
            endHour: endH,
            order: shift.order,
            effectiveFrom: shift.effectiveFrom || '',
            effectiveUntil: shift.effectiveUntil || '',
            rangePreset: 'custom'
        });
        setShowForm(true);
    };

    const handleDeleteShift = async (id) => {
        if (!confirm('Delete this shift? This cannot be undone.')) return;
        await deleteShift(id);
        await onRefresh();
    };

    const employeeOptions = allEmployees.filter(e => e.role === 'employee');
    const presets = [
        { id: 'today', label: 'Today' },
        { id: 'week', label: 'This Week' },
        { id: 'month', label: 'This Month' },
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'custom', label: 'Custom' },
    ];

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manage Shifts</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Create and modify shift schedules for today, this week, this month, or custom ranges</p>
                </div>
                {!showForm && (
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold tracking-wide uppercase shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all">
                        <Plus className="w-4 h-4" /> Add Shift
                    </button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <div className="glass rounded-xl p-6 mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{editingId ? 'Edit Shift' : 'New Shift'}</h3>
                        <button onClick={resetForm} className={`p-1.5 rounded-lg hover:bg-slate-700/50 ${isDark ? 'text-slate-500' : 'text-slate-400'} hover:text-slate-300 transition-colors`}><X className="w-4 h-4" /></button>
                    </div>

                    {/* Duration presets */}
                    <div className="mb-4">
                        <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Duration</label>
                        <div className="flex gap-2">
                            {presets.map(p => (
                                <button key={p.id} type="button" onClick={() => applyPreset(p.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${form.rangePreset === p.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                        : isDark ? 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700/50' : 'bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200'
                                        }`}>{p.label}</button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-4">
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Employee</label>
                            <select value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" required>
                                <option value="">Select...</option>
                                {employeeOptions.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start Hour (0-23)</label>
                            <input type="number" min="0" max="23" value={form.startHour} onChange={e => setForm(f => ({ ...f, startHour: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" required />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>End Hour (0-23)</label>
                            <input type="number" min="0" max="23" value={form.endHour} onChange={e => setForm(f => ({ ...f, endHour: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" required />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Order</label>
                            <input type="number" min="1" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                                className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                        </div>

                        {(form.rangePreset === 'custom' || form.rangePreset === 'today' || form.rangePreset === 'week' || form.rangePreset === 'month') && (
                            <>
                                <div className="space-y-1">
                                    <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>From</label>
                                    <input type="date" value={form.effectiveFrom} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value, rangePreset: 'custom' }))}
                                        className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Until {form.rangePreset === 'ongoing' && '(blank = forever)'}</label>
                                    <input type="date" value={form.effectiveUntil} onChange={e => setForm(f => ({ ...f, effectiveUntil: e.target.value, rangePreset: 'custom' }))}
                                        className="w-full px-3 py-2.5 t-input rounded-lg t-text text-sm font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                                </div>
                            </>
                        )}

                        <div className="col-span-6 flex justify-end">
                            <button type="submit" disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                                {loading ? 'Saving...' : <><Check className="w-4 h-4" /> {editingId ? 'Update Shift' : 'Create Shift'}</>}
                            </button>
                        </div>
                    </form>
                    {error && <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium"><AlertCircle className="w-3.5 h-3.5" />{error}</div>}
                </div>
            )}

            {/* Shifts Table */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${isDark ? 'text-slate-500 border-b border-slate-800' : 'text-slate-400 border-b border-slate-200'}`}>
                            <th className="text-left px-6 py-4">Employee</th>
                            <th className="text-left px-6 py-4">Shift Time</th>
                            <th className="text-left px-6 py-4">Order</th>
                            <th className="text-left px-6 py-4">Effective From</th>
                            <th className="text-left px-6 py-4">Effective Until</th>
                            <th className="text-right px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allShifts.map(s => (
                            <tr key={s.id} className={`${isDark ? 'border-b border-slate-800/50 hover:bg-slate-800/30' : 'border-b border-slate-100 hover:bg-slate-50'} transition-colors`}>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{s.label}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.order}</span>
                                </td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.effectiveFrom || '—'}</td>
                                <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.effectiveUntil || 'Ongoing'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(s)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500 hover:text-cyan-400' : 'hover:bg-slate-100 text-slate-400 hover:text-cyan-600'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDeleteShift(s.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allShifts.length === 0 && (
                    <div className={`text-center py-12 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No shifts configured</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
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
