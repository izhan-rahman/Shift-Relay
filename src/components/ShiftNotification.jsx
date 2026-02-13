import { Bell, Clock, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

export default function ShiftNotification({ name, shift, minutesUntil }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-4 animate-fade-in-up">
            <div className="relative glass-strong rounded-xl px-5 py-4 shadow-2xl shadow-black/40 border border-amber-500/20 overflow-hidden">

                {/* Amber accent glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 pointer-events-none"></div>

                <div className="relative flex items-center gap-4">
                    {/* Bell icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Bell className="w-5 h-5 text-white animate-pulse" />
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] text-amber-400 uppercase tracking-[0.25em] font-bold">Upcoming Shift</span>
                        </div>
                        <p className="text-sm text-white font-medium">
                            <span className="text-amber-300 font-bold">{name}</span>
                            <span className="text-slate-400 mx-1.5">—</span>
                            <span className="text-slate-300">{shift}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-400">
                                Starts in <span className="text-amber-300 font-bold font-mono">{minutesUntil}</span> minutes
                            </span>
                        </div>
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={() => setDismissed(true)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
