/**
 * Dynamic shift schedule utility.
 * Shifts are now fetched from the server — no more hardcoded arrays.
 */

// ─── Default fallback (used only if server is unreachable) ───
export const DEFAULT_SHIFTS = [
    { index: 0, name: "SUHAIL", startHour: 9, endHour: 18, label: "9:00 AM – 6:00 PM" },
    { index: 1, name: "AZEEZ", startHour: 18, endHour: 26, label: "6:00 PM – 2:00 AM" },
    { index: 2, name: "IQBAL", startHour: 2, endHour: 9, label: "2:00 AM – 9:00 AM" },
];

function toDecimalHour(date) {
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

/**
 * Get the current shift status based on a shifts array.
 * @param {Date} now - current time
 * @param {Array} shifts - array of { name, startHour, endHour, label, order }
 */
export function getShiftStatus(now = new Date(), shifts = null) {
    const schedule = shifts && shifts.length > 0 ? shifts : DEFAULT_SHIFTS;

    // Normalize: add index based on order
    const ordered = schedule.map((s, i) => ({
        ...s,
        index: i,
        name: s.name,
        startHour: s.startHour,
        endHour: s.endHour,
        label: s.label || `${s.startHour}:00 – ${s.endHour > 24 ? s.endHour - 24 : s.endHour}:00`,
    }));

    const h = toDecimalHour(now);

    let activeShift = null;
    let normalizedH = h;

    for (const shift of ordered) {
        const start = shift.startHour;
        const end = shift.endHour;

        if (end > 24) {
            // Crosses midnight (e.g., 18–26 means 18:00–02:00)
            if (h >= start) {
                activeShift = shift;
                normalizedH = h;
                break;
            } else if (h < end - 24) {
                activeShift = shift;
                normalizedH = h + 24;
                break;
            }
        } else {
            if (h >= start && h < end) {
                activeShift = shift;
                normalizedH = h;
                break;
            }
        }
    }

    if (!activeShift) {
        return {
            activeIndex: 0,
            progress: 0,
            remainingMs: 0,
            shiftName: ordered[0]?.name || "UNKNOWN",
            shiftLabel: ordered[0]?.label || "",
            totalShifts: ordered.length,
        };
    }

    const duration = activeShift.endHour - activeShift.startHour;
    const elapsed = normalizedH - activeShift.startHour;
    const progress = Math.max(0, Math.min(1, elapsed / duration));
    const remainingHours = duration - elapsed;
    const remainingMs = Math.max(0, remainingHours * 3600 * 1000);

    return {
        activeIndex: activeShift.index,
        progress,
        remainingMs,
        shiftName: activeShift.name,
        shiftLabel: activeShift.label,
        totalShifts: ordered.length,
    };
}

export function getUpcomingShiftNotification(now = new Date(), minutesBefore = 30, shifts = null) {
    const schedule = shifts && shifts.length > 0 ? shifts : DEFAULT_SHIFTS;
    const h = toDecimalHour(now);
    const thresholdHours = minutesBefore / 60;

    for (const shift of schedule) {
        let startH = shift.startHour;
        let diff = startH - h;
        if (diff < -12) diff += 24;
        if (diff > 12) diff -= 24;

        if (diff > 0 && diff <= thresholdHours) {
            const minutesUntil = Math.round(diff * 60);
            return { name: shift.name, shift: shift.label || shift.shift, minutesUntil };
        }
    }
    return null;
}

export function formatRemaining(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
}

// ─── Pause/Resume Tracking ───────────────────────────────────

const PAUSE_KEY = 'shiftRelayPauseState';
const RESUME_KEY = 'shiftRelayResumeInfo';

export function savePauseState(name, progress) {
    const state = JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
    state[name] = { pausedAtTime: Date.now(), pausedProgress: progress };
    localStorage.setItem(PAUSE_KEY, JSON.stringify(state));
}

export function clearPauseState(name) {
    const state = JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
    const pauseInfo = state[name] || null;
    delete state[name];
    localStorage.setItem(PAUSE_KEY, JSON.stringify(state));

    if (pauseInfo) {
        const gapMs = Date.now() - pauseInfo.pausedAtTime;
        const resume = { name, gapMs, pausedProgress: pauseInfo.pausedProgress, resumedAt: Date.now() };
        localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
        return resume;
    }
    return null;
}

export function getPauseState() {
    return JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
}

export function getResumeInfo() {
    const info = localStorage.getItem(RESUME_KEY);
    if (!info) return null;
    const parsed = JSON.parse(info);
    if (Date.now() - parsed.resumedAt > 30000) {
        localStorage.removeItem(RESUME_KEY);
        return null;
    }
    return parsed;
}

export function clearResumeInfo() {
    localStorage.removeItem(RESUME_KEY);
}

export function formatDuration(ms) {
    const totalMin = Math.floor(ms / 60000);
    if (totalMin < 1) return 'less than a minute';
    if (totalMin < 60) return `${totalMin} min`;
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Convert hour number (e.g. 9, 18, 26) to readable label like "9:00 AM", "6:00 PM", "2:00 AM"
 */
export function hourToLabel(hour) {
    const h = hour > 24 ? hour - 24 : hour;
    const period = h >= 12 && h < 24 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${period}`;
}

/**
 * Build a shift label from startHour and endHour
 */
export function buildShiftLabel(startHour, endHour) {
    return `${hourToLabel(startHour)} – ${hourToLabel(endHour)}`;
}
