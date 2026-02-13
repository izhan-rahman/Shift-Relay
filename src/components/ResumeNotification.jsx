import { Clock, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { formatDuration } from '../utils/shiftSchedule';

export default function ResumeNotification({ name, gapMs, onDismiss }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-4 animate-fade-in-up">
            <div className="relative glass-strong rounded-xl px-5 py-4 shadow-2xl shadow-black/40 border border-emerald-500/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-emerald-500/5 pointer-events-none"></div>

                <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Clock className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-emerald-400 uppercase tracking-[0.25em] font-bold">Resumed</span>
                        <p className="text-sm text-white font-medium mt-0.5">
                            <span className="text-emerald-300 font-bold">{name}</span>
                            <span className="text-slate-400"> is back — was away for </span>
                            <span className="text-emerald-300 font-bold font-mono">{formatDuration(gapMs)}</span>
                        </p>
                    </div>

                    <button onClick={handleDismiss} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
