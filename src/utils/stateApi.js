const API = 'http://localhost:3001/api';

export async function fetchSharedState() {
    try {
        const res = await fetch(`${API}/state`);
        return await res.json();
    } catch {
        return { loggedInEmployees: [], pauseState: {} };
    }
}

export async function apiLogin(username) {
    try {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        return await res.json();
    } catch {
        return null;
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
