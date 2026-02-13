import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout({ children, currentRunner, user, onLogout }) {
    const { isDark } = useTheme();

    return (
        <div className="min-h-screen t-bg relative">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className={`absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-cyan-500/[0.03]' : 'bg-cyan-500/[0.06]'}`}></div>
                <div className={`absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-purple-500/[0.03]' : 'bg-purple-500/[0.05]'}`}></div>
                <div className={`absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:50px_50px] ${isDark ? 'text-slate-800/30 opacity-[0.06]' : 'text-slate-400/20 opacity-[0.04]'}`}></div>
            </div>

            <div className="relative z-10">
                <Navbar currentRunner={currentRunner} user={user} onLogout={onLogout} />
                {children}
            </div>
        </div>
    );
}
