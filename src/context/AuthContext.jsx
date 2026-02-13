import { createContext, useContext, useState, useEffect } from 'react';
import { getShiftStatus } from '../utils/shiftSchedule';
import { apiLogin, apiLogout } from '../utils/stateApi';

const AuthContext = createContext(null);

const EMPLOYEE_CREDENTIALS = [
    { username: 'SUHAIL', password: 'suhail123', shift: '9:00 AM – 6:00 PM', role: 'employee' },
    { username: 'AZEEZ', password: 'azeez123', shift: '6:00 PM – 2:00 AM', role: 'employee' },
    { username: 'IQBAL', password: 'iqbal123', shift: '2:00 AM – 9:00 AM', role: 'employee' },
];

const MASTER_CREDENTIAL = { username: 'MASTER', password: 'master123', role: 'master' };
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
        if (username.toUpperCase() === 'MASTER' && password === MASTER_CREDENTIAL.password) {
            setUser({ username: 'MASTER', role: 'master' });
            return { success: true };
        }
        const found = EMPLOYEE_CREDENTIALS.find(
            c => c.username.toLowerCase() === username.toLowerCase() && c.password === password
        );
        if (!found) return { success: false, error: 'Invalid credentials' };

        // Register with shared state server
        const result = await apiLogin(found.username);
        if (result?.resumeInfo) {
            setResumeInfo({ ...result.resumeInfo, name: found.username, gapMs: Date.now() - result.resumeInfo.pausedAtTime });
            setTimeout(() => setResumeInfo(null), 15000);
        }
        setUser({ username: found.username, shift: found.shift, role: 'employee' });
        return { success: true };
    };

    const logout = async () => {
        if (user?.role === 'employee') {
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
