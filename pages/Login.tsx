
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../App';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      navigate('/verify', { state: { username } });
    } catch (err: any) {
      setError(err.message || 'Login yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-mesh-light dark:bg-mesh-dark">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 w-12 h-12 glass rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-50 text-2xl"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="max-w-md w-full z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl mb-6 animate-float">
            <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">SiMoSh</h1>
          </div>
          <p className="text-sm text-indigo-400 dark:text-indigo-300 font-bold tracking-[0.3em] uppercase">Boshqaruv Konsoli</p>
        </div>

        <div className="glass rounded-[3rem] p-10 md:p-12 shadow-2xl border border-white/40 dark:border-white/5 relative overflow-hidden">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Xush kelibsiz</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Tizimga kirish uchun ma'lumotlarni kiriting</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs mb-6 flex items-center border border-red-500/20 font-bold uppercase tracking-widest animate-shake">
              <span className="mr-3 text-lg">⚡</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username yoki Email</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 font-semibold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Login"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Maxfiy parol</label>
                {/* Fixed: Removed unsupported size prop from Link component */}
                <Link to="/forgot-password" className="text-[11px] text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-widest transition-colors">Tiklash</Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 font-semibold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] hover:glow-primary active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20"
            >
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-[0.4em]">
          Powered by SiMoSh Group &bull; v3.1
        </p>
      </div>
    </div>
  );
};

export default Login;
