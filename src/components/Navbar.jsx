import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Activity, Clock, LogOut, Sun, Moon, User } from 'lucide-react';

export default function Navbar({ currentRunner, user, onLogout }) {
    const [time, setTime] = useState(new Date());
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        const iv = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);

    const h = String(time.getHours()).padStart(2, '0');
    const m = String(time.getMinutes()).padStart(2, '0');
    const s = String(time.getSeconds()).padStart(2, '0');

    return (
        <nav className="h-16 glass-strong flex items-center justify-between px-6 shadow-lg shadow-black/10 relative z-50">
            {/* Brand */}
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold tracking-[0.2em] t-text">SHIFT RELAY</span>
                    <span className="text-[10px] font-medium t-muted tracking-[0.3em] uppercase">Operations Center</span>
                </div>
            </div>

            {/* Center: Status */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></div>
                    <span className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">System Active</span>
                </div>

                <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[9px] t-muted uppercase tracking-widest font-medium">Current Runner</span>
                    <span className="text-sm t-text font-bold tracking-wide ml-1">{currentRunner}</span>
                </div>

                <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 t-text2" />
                    <span className="text-[9px] t-muted uppercase tracking-widest font-medium">Live Time</span>
                    <span className="text-sm t-text font-mono font-semibold tabular-nums ml-1">
                        {h}:{m}<span className="text-cyan-400">:{s}</span>
                    </span>
                </div>
            </div>

            {/* Right: Theme toggle + User + Logout */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                        <Moon className="w-4 h-4 text-indigo-500" />
                    )}
                </button>

                {user && (
                    <>
                        <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9px] t-muted uppercase tracking-widest font-medium">Logged In</span>
                            <span className="text-sm t-text font-bold tracking-wide ml-1">{user.username}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
