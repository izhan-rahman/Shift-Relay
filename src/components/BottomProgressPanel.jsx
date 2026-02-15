import { Timer, ArrowRight, Users, Pause, Clock } from 'lucide-react';

const DEFAULT_EMPLOYEES = ["SUHAIL", "AZEEZ", "IQBAL"];

export default function BottomProgressPanel({ currentRunner = "SUHAIL", progress = 0, remaining, runnerStatus = "running", pauseDuration = '', employees: employeeProp }) {
    const pct = Math.round(progress * 100);
    const employeeNames = employeeProp && employeeProp.length > 0
        ? employeeProp.map(e => typeof e === 'string' ? e : e.name)
        : DEFAULT_EMPLOYEES;
    const idx = employeeNames.indexOf(currentRunner);
    const next = employeeNames[(idx + 1) % employeeNames.length] || '—';
    const display = remaining ? remaining.display : "—:—:—";
    const paused = runnerStatus === "paused";
    const waiting = runnerStatus === "waiting";
    const stopped = paused || waiting;

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-strong p-5 z-50">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${paused ? 'bg-gradient-to-br from-red-500 to-orange-600' : waiting ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                                }`}>
                                {paused ? <Pause className="w-4 h-4 text-white" /> : waiting ? <Clock className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-[9px] t-muted uppercase tracking-widest font-medium">Active Shift</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm t-text font-bold tracking-wide">{currentRunner}</span>
                                    {paused && <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-bold uppercase tracking-wider animate-pulse">Paused{pauseDuration ? ` · ${pauseDuration}` : ''}</span>}
                                    {waiting && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-bold uppercase tracking-wider animate-pulse">Not Logged In</span>}
                                </div>
                            </div>
                        </div>
                        <div className="t-muted"><ArrowRight className="w-3 h-3" /></div>
                        <div className="flex flex-col leading-tight"><span className="text-[9px] t-muted uppercase tracking-widest font-medium">Next Up</span><span className="text-sm t-text2 font-semibold tracking-wide">{next}</span></div>
                        <div className="h-6 w-px t-bg2 mx-2"></div>
                        <div className={`px-3 py-1 rounded-full border ${paused ? 'bg-red-500/10 border-red-500/20' : waiting ? 'bg-amber-500/10 border-amber-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                            <span className={`text-xs font-bold font-mono tabular-nums ${paused ? 'text-red-400' : waiting ? 'text-amber-400' : 'text-cyan-400'}`}>{pct}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer className="w-4 h-4 t-muted" />
                        <div className="flex flex-col items-end leading-tight">
                            <span className="text-[9px] t-muted uppercase tracking-widest font-medium">Shift Ends In</span>
                            <span className="text-lg t-text font-mono font-bold tabular-nums">{display}</span>
                        </div>
                    </div>
                </div>
                <div className="relative h-2 w-full rounded-full overflow-hidden t-subtle">
                    <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }}>
                        <div className={`absolute inset-0 ${paused ? 'bg-gradient-to-r from-red-500 via-orange-500 to-red-500' : waiting ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient'}`}></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    </div>
                    {/* Dynamic segment dividers */}
                    {employeeNames.length > 1 && employeeNames.slice(1).map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-600/20" style={{ left: `${((i + 1) / employeeNames.length) * 100}%` }}></div>
                    ))}
                </div>
                <div className="flex items-center justify-between text-[8px] t-muted uppercase tracking-[0.25em] font-medium px-1">
                    {employeeNames.map((e, i) => <span key={e} className={i === idx ? (paused ? 'text-red-400' : waiting ? 'text-amber-400' : 'text-cyan-500') : ''}>{e}</span>)}
                </div>
            </div>
        </div>
    );
}
