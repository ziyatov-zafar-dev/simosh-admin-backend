
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
// Fix: Import useTheme from AppContext instead of App
import { useTheme } from '../AppContext';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      await authService.resetPassword(username, code, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Set New Password</h2>
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1 font-medium">Verify your reset code to update password.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-8 border border-red-100 dark:border-red-900/50 animate-shake">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-8 border border-green-100 dark:border-green-900/50">
              ✅ Success! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-semibold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Email"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Reset Code</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-semibold"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Secure Password</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all bg-gray-50/50 dark:bg-slate-800/50 text-gray-900 dark:text-white font-semibold"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-gray-800 dark:hover:bg-slate-200 transition-all shadow-xl shadow-gray-200 dark:shadow-none mt-4"
            >
              {loading ? 'Processing...' : 'Save Password'}
            </button>

            <div className="text-center pt-4">
              <Link to="/login" className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
