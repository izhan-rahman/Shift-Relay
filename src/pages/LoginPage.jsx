import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchEmployees } from '../utils/stateApi';
import { Zap, Eye, EyeOff, LogIn, ArrowRight, Shield, User, Sun, Moon } from 'lucide-react';

const COLORS = ['cyan', 'blue', 'indigo', 'emerald', 'violet', 'pink', 'amber', 'rose'];

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const { login, isAuthenticated, isMaster } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        fetchEmployees().then(emps => setEmployees(emps));
    }, []);

    if (isAuthenticated) return <Navigate to={isMaster ? "/master" : "/dashboard"} replace />;

    const doLogin = async (u, p) => {
        setError(''); setLoading(true);
        await new Promise(r => setTimeout(r, 400));
        const result = await login(u, p);
        setLoading(false);
        if (result.success) navigate(u.toUpperCase() === 'MASTER' ? '/master' : '/dashboard');
        else { setError(result.error); setShaking(true); setTimeout(() => setShaking(false), 600); }
    };

    const colorMap = {
        cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/40', iconBg: 'bg-cyan-500/20', text: 'text-cyan-400' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/20 hover:border-blue-500/40', iconBg: 'bg-blue-500/20', text: 'text-blue-400' },
        indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500/20 hover:border-indigo-500/40', iconBg: 'bg-indigo-500/20', text: 'text-indigo-400' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/40', iconBg: 'bg-emerald-500/20', text: 'text-emerald-400' },
        violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', hover: 'hover:bg-violet-500/20 hover:border-violet-500/40', iconBg: 'bg-violet-500/20', text: 'text-violet-400' },
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', hover: 'hover:bg-pink-500/20 hover:border-pink-500/40', iconBg: 'bg-pink-500/20', text: 'text-pink-400' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', hover: 'hover:bg-amber-500/20 hover:border-amber-500/40', iconBg: 'bg-amber-500/20', text: 'text-amber-400' },
        purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/20 hover:border-purple-500/40', iconBg: 'bg-purple-500/20', text: 'text-purple-400' },
        rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', hover: 'hover:bg-rose-500/20 hover:border-rose-500/40', iconBg: 'bg-rose-500/20', text: 'text-rose-400' },
    };

    // Build quick login buttons from dynamic employee list
    const quickButtons = employees.map((emp, i) => ({
        name: emp.name,
        color: emp.role === 'master' ? 'purple' : COLORS[i % COLORS.length],
        isMaster: emp.role === 'master',
    }));

    // Determine grid columns based on count
    const gridCols = quickButtons.length <= 4 ? 'grid-cols-4'
        : quickButtons.length <= 6 ? 'grid-cols-3'
            : 'grid-cols-4';

    return (
        <div className="min-h-screen t-bg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse-glow ${isDark ? 'bg-cyan-500/[0.04]' : 'bg-cyan-500/[0.07]'}`}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse-glow ${isDark ? 'bg-blue-500/[0.04]' : 'bg-blue-500/[0.06]'}`} style={{ animationDelay: '1s' }}></div>
                <div className={`absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:60px_60px] ${isDark ? 'text-slate-800/30 opacity-[0.06]' : 'text-slate-400/20 opacity-[0.04]'}`}></div>
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="absolute top-6 right-6 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-105 active:scale-95 transition-all" title={isDark ? 'Light Mode' : 'Dark Mode'}>
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            <div className={`relative z-10 w-full max-w-md mx-4 animate-fade-in-up ${shaking ? 'animate-shake' : ''}`}>
                <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative px-8 pt-10 pb-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 mb-6">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold t-text tracking-wide mb-1">SHIFT RELAY</h1>
                        <p className="text-sm t-muted tracking-[0.25em] uppercase font-medium">Operations Center</p>
                        <div className="mt-6 flex items-center gap-3">
                            <div className={`flex-1 h-px ${isDark ? 'bg-gradient-to-r from-transparent via-slate-700 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'}`}></div>
                            <Shield className="w-3.5 h-3.5 t-muted" />
                            <div className={`flex-1 h-px ${isDark ? 'bg-gradient-to-r from-transparent via-slate-700 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-300 to-transparent'}`}></div>
                        </div>
                    </div>

                    {/* Quick Login */}
                    {quickButtons.length > 0 && (
                        <div className="px-8 pb-4">
                            <p className="text-[10px] t-muted uppercase tracking-[0.25em] font-semibold mb-3">Quick Login</p>
                            <div className={`grid ${gridCols} gap-2`}>
                                {quickButtons.map(q => {
                                    const c = colorMap[q.color] || colorMap.cyan; return (
                                        <button key={q.name} onClick={() => { setUsername(q.name); setPassword(''); }}
                                            className={`group flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 ${c.bg} border ${c.border} ${c.hover}`}>
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.iconBg}`}>
                                                {q.isMaster ? <Shield className={`w-3.5 h-3.5 ${c.text}`} /> : <User className={`w-3.5 h-3.5 ${c.text}`} />}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${c.text}`}>{q.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="px-8 flex items-center gap-3 mb-4">
                        <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                        <span className="text-[9px] t-muted uppercase tracking-widest font-medium">or enter manually</span>
                        <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={e => { e.preventDefault(); doLogin(username, password); }} className="px-8 pb-8 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] t-muted uppercase tracking-[0.25em] font-semibold">Employee ID</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your name"
                                className="w-full px-4 py-3 t-input rounded-xl t-text placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] t-muted uppercase tracking-[0.25em] font-semibold">Password</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                                    className="w-full px-4 py-3 pr-12 t-input rounded-xl t-text placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" required />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 t-muted hover:t-text transition-colors p-1">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        {error && <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>{error}</div>}
                        <button type="submit" disabled={loading} className="w-full relative group overflow-hidden rounded-xl py-3.5 font-bold text-sm tracking-wider uppercase transition-all duration-300 disabled:opacity-60">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
                            <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                                {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Authenticating...</span></>) : (<><LogIn className="w-4 h-4" /><span>Access Dashboard</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
                            </div>
                        </button>
                        <p className="text-center text-[10px] t-muted tracking-wider pt-1">Authorized personnel only &bull; 24/7 Operations</p>
                    </form>
                </div>
                <div className="mt-4 flex justify-center"><div className="w-16 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-40"></div></div>
            </div>
        </div>
    );
}
