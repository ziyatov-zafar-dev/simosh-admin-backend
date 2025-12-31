
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth, useTheme, useLanguage, useSetLanguage, useT } from '../AppContext';
import { UserRole, Logo, Language } from '../types';
import { logoService } from '../services/logoService';

const Layout: React.FC = () => {
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const t = useT();
  const location = useLocation();
  const [logo, setLogo] = useState<Logo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const navItems = [
    { label: t('nav_home'), path: '/', icon: '💎', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: t('nav_orders'), path: '/orders', icon: '📦', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: t('nav_products'), path: '/products', icon: '🛍️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: t('nav_company'), path: '/about', icon: '🏢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: t('nav_logo'), path: '/logo', icon: '🎨', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { label: t('nav_team'), path: '/admins', icon: '👑', roles: [UserRole.SUPER_ADMIN] },
  ];

  useEffect(() => {
    logoService.get().then(data => data && setLogo(data)).catch(() => {});
    const handleLogoUpdate = (e: any) => e.detail && setLogo(e.detail);
    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  return (
    <div className="min-h-screen flex bg-mesh-light dark:bg-mesh-dark transition-colors duration-500 overflow-x-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] glass border-r lg:border-none lg:bg-transparent lg:m-8 p-6 flex flex-col z-[70] transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-12 flex flex-col items-center">
          {/* WOW Logo Container */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.2rem] shadow-2xl flex items-center justify-center p-4 border border-white/50 dark:border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
              {logo?.imgUrl ? (
                <img src={logo.imgUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-3xl font-black bg-gradient-to-tr from-indigo-600 to-purple-600 bg-clip-text text-transparent">S</span>
              )}
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">SiMoSh</h1>
        </div>
        
        <nav className="flex-1 space-y-2.5 overflow-y-auto scrollbar-hide">
          {navItems.filter(item => item.roles.includes(auth.role as UserRole)).map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-6 py-4 rounded-2xl transition-all ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              <span className="mr-4 text-xl">{item.icon}</span>
              <span className="font-bold text-[13px] tracking-wide uppercase">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8">
          <div className="bg-white/40 dark:bg-slate-900/40 p-5 rounded-[2.2rem] border border-white/40 dark:border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg">{auth.username?.[0].toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase">{auth.username}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{auth.role === UserRole.SUPER_ADMIN ? t('role_super') : t('role_admin')}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">{t('logout')} 🚪</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 lg:h-24 glass flex items-center justify-between px-6 lg:px-12 lg:mt-6 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl">☰</button>
            <div className="hidden sm:block">
               <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{navItems.find(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))?.label || t('welcome')}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="w-12 h-12 glass rounded-2xl flex items-center justify-center font-black text-[10px] hover:scale-110 transition-all uppercase">{language}</button>
              {isLangMenuOpen && (
                <div className="absolute top-14 right-0 glass rounded-2xl p-2 shadow-2xl z-[100] min-w-[80px] animate-in fade-in zoom-in duration-200">
                  {(['UZ', 'RU', 'EN', 'TR'] as Language[]).map(lang => (
                    <button key={lang} onClick={() => {setLanguage(lang); setIsLangMenuOpen(false);}} className={`w-full text-center py-2 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-colors ${language === lang ? 'bg-indigo-600 text-white' : ''}`}>{lang}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleTheme} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl hover:scale-110 transition-all">{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-12 overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
