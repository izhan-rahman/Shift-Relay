import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiLogout } from '../utils/stateApi';

const AuthContext = createContext(null);
const USER_KEY = 'shiftRelayUser';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem(USER_KEY);
        return saved ? JSON.parse(saved) : null;
    });
    const [resumeInfo, setResumeInfo] = useState(null);

    useEffect(() => {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        else localStorage.removeItem(USER_KEY);
    }, [user]);

    const login = async (username, password) => {
        const result = await apiLogin(username, password);
        if (!result.success) return { success: false, error: result.error || 'Invalid credentials' };

        const u = result.user;
        if (u.role !== 'master' && result.resumeInfo) {
            setResumeInfo({ ...result.resumeInfo, name: u.name, gapMs: Date.now() - result.resumeInfo.pausedAtTime });
            setTimeout(() => setResumeInfo(null), 15000);
        }
        setUser({ username: u.name, email: u.email, role: u.role });
        return { success: true };
    };

    const logout = async () => {
        if (user?.role === 'employee') {
            // We need shift info — import dynamically to avoid circular deps
            const { getShiftStatus } = await import('../utils/shiftSchedule');
            const status = getShiftStatus();
            await apiLogout(user.username, status.progress, status.shiftName === user.username);
        }
        setUser(null);
        setResumeInfo(null);
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout,
            isAuthenticated: !!user,
            isMaster: user?.role === 'master',
            resumeInfo,
            dismissResumeInfo: () => setResumeInfo(null),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
