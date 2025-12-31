
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
// Fix: Import hooks from AppContext instead of App
import { useTheme, useLanguage, useSetLanguage, useT } from '../AppContext';
import { Language } from '../types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  // Fix: useLanguage, useSetLanguage, and useT return values directly in AppContext.tsx
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(username, password);
      navigate('/verify', { state: { username } });
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-mesh-light dark:bg-mesh-dark">
      <div className="absolute top-8 right-8 flex gap-3 z-50">
        <div className="relative group">
          <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center font-black text-[10px] uppercase">{language}</button>
          <div className="absolute top-14 right-0 hidden group-hover:block glass rounded-2xl p-2 shadow-2xl min-w-[80px]">
            {(['UZ', 'RU', 'EN', 'TR'] as Language[]).map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={`w-full text-center py-2 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-colors ${language === l ? 'bg-indigo-600 text-white' : ''}`}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={toggleTheme} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl hover:scale-110 transition-all">{theme === 'light' ? '🌙' : '☀️'}</button>
      </div>

      <div className="max-w-md w-full z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl mb-6">
            <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">SiMoSh</h1>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 md:p-12 shadow-2xl border border-white/40 dark:border-white/5 relative overflow-hidden">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('welcome')}</h2>
          </div>

          {error && <div className="bg-red-500/10 text-red-600 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-6 border border-red-500/20">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('username')}</label>
              <input type="text" required className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none transition-all bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-semibold" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
              <input type="password" required className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none transition-all bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-semibold" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/20">{loading ? '...' : t('login_btn')}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
