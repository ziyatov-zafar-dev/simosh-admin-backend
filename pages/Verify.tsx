
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../App';

const Verify: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  
  const username = location.state?.username;

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.verify(username, code);
      setAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        role: response.role,
        username: username
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Tasdiqlash kodi noto\'g\'ri yoki muddati o\'tgan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full glass rounded-[3rem] shadow-2xl p-12 border border-white/40 dark:border-white/5 animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg animate-float">
            📧
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Kodni tasdiqlang</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Xavfsizlik kodi quyidagi manzilga yuborildi: <br/><span className="text-indigo-600 dark:text-indigo-400 font-bold">{username}</span></p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest mb-8 border border-red-500/20 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Xavfsizlik PIN kodi</label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full text-center text-4xl tracking-[1.5rem] px-4 py-6 rounded-3xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-mono bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-black"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 hover:glow-primary active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-40"
          >
            {loading ? 'Tasdiqlanmoqda...' : 'Kirishni ochish'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            Bekor qilish
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verify;
