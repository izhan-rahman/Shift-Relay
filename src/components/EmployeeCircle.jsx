import { User, Pause, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function EmployeeCircle({ name, time, style = {}, isActive = false, isLoggedIn = false, isPaused = false, isWaiting = false }) {
    const { isDark } = useTheme();
    const hasPos = style.left !== undefined;
    const running = isActive && isLoggedIn && !isPaused && !isWaiting;
    const paused = isActive && isPaused;
    const waiting = isActive && isWaiting;

    // Circle background for each state × theme
    const circleBg = running
        ? isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-[3px] border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.35),inset_0_0_15px_rgba(34,211,238,0.1)]'
            : 'bg-white border-[3px] border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.25),0_4px_12px_rgba(0,0,0,0.1)]'
        : paused
            ? isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-[3px] border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-white border-[3px] border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15),0_4px_12px_rgba(0,0,0,0.1)]'
            : waiting
                ? isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-[3px] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-white border-[3px] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15),0_4px_12px_rgba(0,0,0,0.1)]'
                : isDark ? 'bg-slate-800/80 border-2 border-slate-700/50 opacity-60 scale-90'
                    : 'bg-white border-2 border-slate-300 opacity-70 scale-90 shadow-md';

    return (
        <div className={`flex flex-col items-center z-20 ${hasPos ? 'absolute' : 'relative'}`} style={style}>
            {/* Flame */}
            {running && (
                <div className="relative w-full flex justify-center mb-1 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-orange-500/20 blur-xl animate-pulse-glow"></div>
                    <div className="relative animate-float">
                        <div className="w-5 h-7 bg-gradient-to-t from-red-500 via-orange-400 to-amber-300 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] blur-[1px] shadow-[0_0_15px_rgba(249,115,22,0.8),0_0_30px_rgba(249,115,22,0.4)]"></div>
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-2.5 h-4 bg-gradient-to-t from-yellow-400 via-yellow-200 to-white rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] blur-[1px] opacity-90"></div>
                    </div>
                </div>
            )}

            {/* Circle */}
            <div className={`relative w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${circleBg}`}>
                {running && (
                    <>
                        <div className="absolute inset-[-6px] rounded-full border border-cyan-400/20 animate-ping-slow"></div>
                        <div className="absolute inset-[-3px] rounded-full border border-cyan-400/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)] animate-orbit"></div>
                        </div>
                    </>
                )}

                {paused ? <Pause className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'} drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]`} />
                    : waiting ? <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'} drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]`} />
                        : <User className={`w-5 h-5 transition-colors duration-300 ${running ? isDark ? 'text-cyan-300' : 'text-cyan-600' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />}

                {/* Status dot */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} ${running ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                        : paused ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                            : waiting ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                                : isLoggedIn ? 'bg-emerald-400' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}></div>
            </div>

            {/* Name */}
            <div className={`mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase whitespace-nowrap ${running ? isDark ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : paused ? isDark ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
                        : waiting ? isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isDark ? 'text-slate-500 bg-slate-800/40 border border-slate-700/30' : 'text-slate-600 bg-slate-100 border border-slate-200'
                }`}>{name}</div>

            {/* Time */}
            <span className={`mt-1 text-[10px] font-mono whitespace-nowrap ${running ? isDark ? 'text-cyan-200/70' : 'text-cyan-700/60'
                    : paused ? isDark ? 'text-red-200/50' : 'text-red-600/60'
                        : waiting ? isDark ? 'text-amber-200/50' : 'text-amber-700/60'
                            : isDark ? 'text-slate-600' : 'text-slate-500'
                }`}>{time}</span>

            {/* Status */}
            {running && <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold animate-pulse-glow mt-0.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Running</span>}
            {paused && <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold animate-pulse mt-0.5 ${isDark ? 'text-red-400' : 'text-red-500'}`}>Paused</span>}
            {waiting && <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold animate-pulse mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Waiting</span>}
            {!isActive && isLoggedIn && <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Online</span>}
            {!isActive && !isLoggedIn && <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold mt-0.5 ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>Offline</span>}
        </div>
    );
}
