
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../App';

const ForgotPassword: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(username);
      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { username } });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-8 right-8 p-3 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all z-50 text-xl"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold tracking-tighter text-black dark:text-white mb-2">SiMoSh</h1>
          <p className="text-lg text-gray-400 dark:text-slate-500 font-light tracking-[0.25em] uppercase">Natural care</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-black dark:bg-white"></div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Recovery</h2>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1 font-medium">Enter your ID to receive a security code.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-2xl text-[10px] mb-8 border border-red-100 dark:border-red-900/50 font-bold uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-5 rounded-2xl text-[10px] mb-8 border border-green-100 dark:border-green-900/50 font-bold uppercase tracking-widest">
              ✅ Code sent to registered email
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Account Identity</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600 font-semibold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Email"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-gray-800 dark:hover:bg-slate-200 transition-all disabled:opacity-50 shadow-xl shadow-gray-200 dark:shadow-none"
            >
              {loading ? 'Sending...' : 'Request Reset PIN'}
            </button>

            <div className="text-center pt-4">
              <Link to="/login" className="text-[10px] text-gray-400 dark:text-slate-500 hover:text-black dark:hover:text-white font-bold uppercase tracking-[0.2em] transition-colors">
                &larr; Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
