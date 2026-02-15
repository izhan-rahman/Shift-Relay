import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import EmployeeCircle from './EmployeeCircle';

const DEFAULT_EMPLOYEES = [
    { name: "SUHAIL", time: "9:00 AM – 6:00 PM" },
    { name: "AZEEZ", time: "6:00 PM – 2:00 AM" },
    { name: "IQBAL", time: "2:00 AM – 9:00 AM" }
];

const W = 900, H = 500;
const TRACK_PATH = "M 250 55 L 650 55 A 195 195 0 0 1 650 445 L 250 445 A 195 195 0 0 1 250 55";
const CX = 450, CY = 250;

/**
 * For a station point, determine which direction the label should face
 * so it points OUTWARD from the track center and doesn't overlap the track.
 */
function getLabelDir(pt) {
    const dx = pt.x - CX, dy = pt.y - CY;
    // Use the dominant axis to decide direction
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'bottom' : 'top';
    }
}

export default function MainContent({ activeIndex, progress, loggedInEmployees = [], runnerStatus = "running", pausedProgress = null, pauseDuration = '', employees }) {
    const { isDark } = useTheme();
    const pathRef = useRef(null);
    const wrapperRef = useRef(null);

    const EMP = employees && employees.length > 0 ? employees : DEFAULT_EMPLOYEES;
    const count = EMP.length;

    const scale = count <= 3 ? 1 : count <= 5 ? 0.88 : count <= 8 ? 0.75 : 0.65;

    const [stations, setStations] = useState(() => Array.from({ length: count }, () => ({ x: CX, y: CY })));

    useEffect(() => {
        const p = pathRef.current;
        if (!p) return;
        const total = p.getTotalLength();
        const seg = total / count;
        const pts = [];
        for (let i = 0; i < count; i++) pts.push(p.getPointAtLength(i * seg));
        setStations(pts);
    }, [count]);

    useLayoutEffect(() => {
        const p = pathRef.current, w = wrapperRef.current;
        if (!p || !w) return;
        const total = p.getTotalLength(), seg = total / count;
        let pt;
        if (runnerStatus === "waiting") {
            pt = p.getPointAtLength(activeIndex * seg);
        } else {
            const raw = runnerStatus === "paused" ? (pausedProgress ?? 0) : progress;
            const clamped = 0.05 + raw * 0.85;
            pt = p.getPointAtLength(((activeIndex * seg) + (clamped * seg)) % total);
        }
        w.style.left = pt.x + 'px';
        w.style.top = pt.y + 'px';
    }, [activeIndex, progress, runnerStatus, pausedProgress, count]);

    const trackStroke = isDark ? "#1e293b" : "#e2e8f0";
    const dashStroke = isDark ? "#475569" : "#94a3b8";
    const dotInactive = isDark ? "#475569" : "#cbd5e1";
    const cardShadow = isDark ? '0 25px 50px rgba(0,0,0,0.3)' : '0 8px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)';
    const cornerBorder = isDark ? 'border-slate-700/30' : 'border-slate-300/40';
    const gridClass = isDark ? 'text-slate-700/30 opacity-[0.06]' : 'text-slate-400/20 opacity-[0.04]';
    const ambientGlow = isDark ? 'bg-cyan-500/[0.03]' : 'bg-cyan-500/[0.04]';

    const ai = Math.min(activeIndex, count - 1);

    // Pre-calculate label direction for the active runner's current position
    const activeStation = stations[ai] || { x: CX, y: CY };
    const activeLabelDir = getLabelDir(activeStation);

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-7xl h-[600px] glass rounded-2xl relative overflow-hidden flex items-center justify-center animate-fade-in-up"
                style={{ boxShadow: cardShadow }}>

                {/* Ambient background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl ${ambientGlow}`}></div>
                    <div className={`absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px] ${gridClass}`}></div>
                </div>

                {/* Corner decorations */}
                {[['top-4 left-4', 'border-t-2 border-l-2 rounded-tl-lg'], ['top-4 right-4', 'border-t-2 border-r-2 rounded-tr-lg'], ['bottom-4 left-4', 'border-b-2 border-l-2 rounded-bl-lg'], ['bottom-4 right-4', 'border-b-2 border-r-2 rounded-br-lg']].map(([pos, border], i) =>
                    <div key={i} className={`absolute ${pos} w-8 h-8 ${border} ${cornerBorder}`}></div>
                )}

                {/* Title */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
                    <span className={`text-[10px] uppercase tracking-[0.4em] font-semibold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Relay Track</span>
                </div>

                {/* Status badges */}
                {runnerStatus === "paused" && (
                    <div className={`absolute top-5 right-5 z-30 flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-600'}`}>{EMP[ai].name} left the shift</span>
                            {pauseDuration && <span className={`text-[9px] font-mono ${isDark ? 'text-red-300/60' : 'text-red-500/60'}`}>Away for {pauseDuration}</span>}
                        </div>
                    </div>
                )}
                {runnerStatus === "waiting" && (
                    <div className={`absolute top-5 right-5 z-30 flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Waiting for {EMP[ai].name} to log in</span>
                    </div>
                )}

                {/* Fixed-size container — matches SVG viewBox 1:1 */}
                <div className="relative z-10" style={{ width: W, height: H }}>
                    <svg className="absolute inset-0 overflow-visible" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                        <defs>
                            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                            <linearGradient id="trackG" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={isDark ? "#06b6d4" : "#0891b2"} stopOpacity={isDark ? "0.8" : "0.7"} />
                                <stop offset="50%" stopColor={isDark ? "#3b82f6" : "#2563eb"} stopOpacity={isDark ? "0.9" : "0.8"} />
                                <stop offset="100%" stopColor={isDark ? "#8b5cf6" : "#7c3aed"} stopOpacity={isDark ? "0.8" : "0.7"} />
                            </linearGradient>
                        </defs>
                        <path d={TRACK_PATH} fill="none" stroke="url(#trackG)" strokeWidth="24" strokeLinecap="round" opacity={isDark ? "0.05" : "0.04"} />
                        <path d={TRACK_PATH} fill="none" stroke={trackStroke} strokeWidth="12" strokeLinecap="round" />
                        <path ref={pathRef} d={TRACK_PATH} fill="none" stroke="url(#trackG)" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" opacity={isDark ? "0.9" : "0.7"} />
                        <path d={TRACK_PATH} fill="none" stroke={dashStroke} strokeWidth="1" strokeLinecap="round" strokeDasharray="8 12" opacity="0.3" />
                        {stations.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={i === ai ? 5 : 3} fill={i === ai ? "#06b6d4" : dotInactive} opacity={i === ai ? 0.8 : 0.4} />)}
                    </svg>

                    {/* Inactive employees — on track, labels pointing outward */}
                    {EMP.map((emp, i) => {
                        if (i === ai || !stations[i]) return null;
                        const dir = getLabelDir(stations[i]);
                        return (
                            <div key={emp.name} className="absolute z-20"
                                style={{ left: stations[i].x, top: stations[i].y, transform: `translate(-50%, -50%) scale(${scale})` }}>
                                <EmployeeCircle name={emp.name} time={emp.time} style={{}} isActive={false} isLoggedIn={loggedInEmployees.includes(emp.name)} labelDir={dir} />
                            </div>
                        );
                    })}

                    {/* Active runner — moves along track */}
                    <div ref={wrapperRef} className="absolute z-30"
                        style={{ left: activeStation.x, top: activeStation.y, transform: `translate(-50%, -50%) scale(${scale})` }}>
                        <EmployeeCircle name={EMP[ai].name} time={EMP[ai].time} isActive={true}
                            isLoggedIn={runnerStatus === "running"} isPaused={runnerStatus === "paused"}
                            isWaiting={runnerStatus === "waiting"} style={{}} labelDir={activeLabelDir} />
                    </div>
                </div>
            </div>
        </div>
    );
}
