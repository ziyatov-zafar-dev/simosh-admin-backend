
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth, useTheme, useNotification } from '../App';
import { UserRole, Logo } from '../types';
import { logoService } from '../services/logoService';

const Layout: React.FC = () => {
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showNotification } = useNotification();
  const location = useLocation();
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: 'Asosiy panel', path: '/', icon: '💎', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: 'Mahsulotlar', path: '/products', icon: '🛍️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: 'Biz haqimizda', path: '/about', icon: '🏢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: 'Logo', path: '/logo', icon: '🖼️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: 'Adminlar', path: '/admins', icon: '👑', roles: [UserRole.SUPER_ADMIN] },
  ];

  const fetchLogo = async () => {
    try {
      const data = await logoService.get();
      if (data && data.imgUrl) setLogo(data);
    } catch (err) {
      console.error("Logo yuklashda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchLogo();
    const handleLogoUpdate = (e: any) => {
      if (e.detail) setLogo(e.detail);
    };
    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  // Sahifa o'zgarganda sidebar yopiladi (mobil uchun)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    try {
      const updatedLogo = await logoService.upload(file);
      setLogo(updatedLogo);
      showNotification("Logotip muvaffaqiyatli yangilandi", "success");
    } catch (err: any) {
      showNotification(err.message || "Logotipni yuklashda xatolik yuz berdi", "error");
    } finally {
      setLogoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex transition-colors duration-500 font-sans bg-mesh-light dark:bg-mesh-dark overflow-x-hidden">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 glass lg:rounded-[2.5rem] lg:m-6 p-6 flex flex-col shadow-2xl z-[70] transition-transform duration-500 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-10 text-center relative group">
          <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoChange} />
          <div onClick={() => logoInputRef.current?.click()} className="cursor-pointer relative inline-block transition-transform hover:scale-105 active:scale-95">
            {logo?.imgUrl ? (
              <div className="h-20 flex items-center justify-center p-3 rounded-2xl bg-white/40 dark:bg-slate-800/60 border border-white/20 shadow-inner">
                <img src={logo.imgUrl} alt="SiMoSh Logo" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="group"><h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SiMoSh</h1></div>
            )}
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              {logoLoading ? '⏳' : '✎'}
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-4">Management Console</p>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-hide">
          {navItems.filter(item => item.roles.includes(auth.role as UserRole)).map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center px-6 py-4 rounded-2xl transition-all group ${isActive(item.path) ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg glow-primary' : 'text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600'}`}>
              <span className={`mr-4 text-xl group-hover:scale-125 transition-transform`}>{item.icon}</span>
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-4">
          <div className="glass rounded-3xl p-4 border border-indigo-500/10 bg-indigo-500/5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                {auth.username?.[0].toUpperCase()}
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{auth.username}</p>
                <span className="text-[9px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase">
                  {auth.role === UserRole.SUPER_ADMIN ? 'Super' : 'Admin'}
                </span>
              </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center py-2.5 bg-white dark:bg-slate-800/80 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-200 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700 uppercase tracking-widest">Chiqish</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 p-4 md:p-6 lg:p-0">
        <header className="h-20 glass rounded-[2rem] flex items-center justify-between px-6 lg:px-8 mb-6 shadow-xl lg:mt-6 lg:mr-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl shadow-lg text-slate-700 dark:text-white hover:scale-105 active:scale-95 transition-transform"
            >
              ☰
            </button>
            <div className="flex items-center space-x-3">
               <span className="text-2xl hidden sm:inline">{navItems.find(item => isActive(item.path))?.icon || '🏠'}</span>
               <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {navItems.find(item => isActive(item.path))?.label || 'Bosh sahifa'}
               </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
               <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">LIVE</span>
            </div>
            
            <button onClick={toggleTheme} className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-2xl flex items-center justify-center text-lg sm:text-xl hover:scale-110 active:scale-95 transition-all shadow-lg text-slate-700 dark:text-white">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-0 lg:pr-6 pb-6 scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
