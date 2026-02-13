/**
 * Real-time shift schedule utility.
 * 
 * Shift Schedule (24/7 coverage):
 *   SUHAIL: 09:00 – 18:00 (9 hours)
 *   AZEEZ:  18:00 – 02:00 (8 hours, crosses midnight)
 *   IQBAL:  02:00 – 09:00 (7 hours)
 */

export const SHIFTS = [
    { index: 0, name: "SUHAIL", startHour: 9, endHour: 18, shift: "9:00 AM – 6:00 PM" },
    { index: 1, name: "AZEEZ", startHour: 18, endHour: 26, shift: "6:00 PM – 2:00 AM" },
    { index: 2, name: "IQBAL", startHour: 2, endHour: 9, shift: "2:00 AM – 9:00 AM" },
];

function toDecimalHour(date) {
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

export function getShiftStatus(now = new Date()) {
    const h = toDecimalHour(now);

    let activeShift = null;
    let normalizedH = h;

    if (h >= 9 && h < 18) {
        activeShift = SHIFTS[0];
        normalizedH = h;
    } else if (h >= 18) {
        activeShift = SHIFTS[1];
        normalizedH = h;
    } else if (h < 2) {
        activeShift = SHIFTS[1];
        normalizedH = h + 24;
    } else if (h >= 2 && h < 9) {
        activeShift = SHIFTS[2];
        normalizedH = h;
    }

    if (!activeShift) {
        return { activeIndex: 0, progress: 0, remainingMs: 0, shiftName: "SUHAIL", shiftLabel: SHIFTS[0].shift };
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
        shiftLabel: activeShift.shift,
    };
}

export function getUpcomingShiftNotification(now = new Date(), minutesBefore = 30) {
    const h = toDecimalHour(now);
    const thresholdHours = minutesBefore / 60;

    for (const shift of SHIFTS) {
        let startH = shift.startHour;
        let diff = startH - h;
        if (diff < -12) diff += 24;
        if (diff > 12) diff -= 24;

        if (diff > 0 && diff <= thresholdHours) {
            const minutesUntil = Math.round(diff * 60);
            return { name: shift.name, shift: shift.shift, minutesUntil };
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

/**
 * Save pause state when an employee logs out during their shift.
 * Stores: { SUHAIL: { pausedAtTime: timestamp, pausedProgress: 0.96 }, ... }
 */
export function savePauseState(name, progress) {
    const state = JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
    state[name] = { pausedAtTime: Date.now(), pausedProgress: progress };
    localStorage.setItem(PAUSE_KEY, JSON.stringify(state));
}

/**
 * Clear pause state when employee logs back in.
 * Returns the pause info (so we can show "was away for X minutes").
 */
export function clearPauseState(name) {
    const state = JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
    const pauseInfo = state[name] || null;
    delete state[name];
    localStorage.setItem(PAUSE_KEY, JSON.stringify(state));

    // If there was a pause, save resume info
    if (pauseInfo) {
        const gapMs = Date.now() - pauseInfo.pausedAtTime;
        const resume = { name, gapMs, pausedProgress: pauseInfo.pausedProgress, resumedAt: Date.now() };
        localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
        return resume;
    }
    return null;
}

/**
 * Get current pause state for all employees
 */
export function getPauseState() {
    return JSON.parse(localStorage.getItem(PAUSE_KEY) || '{}');
}

/**
 * Get the most recent resume info (for showing "was away for X min" notification)
 */
export function getResumeInfo() {
    const info = localStorage.getItem(RESUME_KEY);
    if (!info) return null;
    const parsed = JSON.parse(info);
    // Only show within 30 seconds of resuming
    if (Date.now() - parsed.resumedAt > 30000) {
        localStorage.removeItem(RESUME_KEY);
        return null;
    }
    return parsed;
}

export function clearResumeInfo() {
    localStorage.removeItem(RESUME_KEY);
}

/**
 * Format milliseconds into human-readable duration
 */
export function formatDuration(ms) {
    const totalMin = Math.floor(ms / 60000);
    if (totalMin < 1) return 'less than a minute';
    if (totalMin < 60) return `${totalMin} min`;
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
