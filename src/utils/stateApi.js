const API = 'http://localhost:3001/api';

// ─── Real-time State ─────────────────────────────────────────
export async function fetchSharedState() {
    try {
        const res = await fetch(`${API}/state`);
        return await res.json();
    } catch {
        return { loggedInEmployees: [], pauseState: {} };
    }
}

export async function apiLogin(username, password) {
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

export async function apiLogout(username, progress, isActiveShift) {
    try {
        const res = await fetch(`${API}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, progress, isActiveShift }),
        });
        return await res.json();
    } catch {
        return null;
    }
}

// ─── Employees CRUD ──────────────────────────────────────────
export async function fetchEmployees() {
    try {
        const res = await fetch(`${API}/employees`);
        const data = await res.json();
        return data.employees || [];
    } catch {
        return [];
    }
}

export async function createEmployee(employee) {
    try {
        const res = await fetch(`${API}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

export async function updateEmployee(name, updates) {
    try {
        const res = await fetch(`${API}/employees/${encodeURIComponent(name)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

export async function deleteEmployee(name) {
    try {
        const res = await fetch(`${API}/employees/${encodeURIComponent(name)}`, {
            method: 'DELETE',
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

// ─── Shifts CRUD ─────────────────────────────────────────────
export async function fetchShifts() {
    try {
        const res = await fetch(`${API}/shifts`);
        const data = await res.json();
        return data.shifts || [];
    } catch {
        return [];
    }
}

export async function fetchSchedule() {
    try {
        const res = await fetch(`${API}/schedule`);
        const data = await res.json();
        return data.schedule || [];
    } catch {
        return [];
    }
}

export async function createShift(shift) {
    try {
        const res = await fetch(`${API}/shifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shift),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

export async function updateShift(id, updates) {
    try {
        const res = await fetch(`${API}/shifts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}

export async function deleteShift(id) {
    try {
        const res = await fetch(`${API}/shifts/${id}`, {
            method: 'DELETE',
        });
        return await res.json();
    } catch {
        return { success: false, error: 'Server unreachable' };
    }
}
