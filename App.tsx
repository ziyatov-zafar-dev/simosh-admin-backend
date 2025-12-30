
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserRole, AuthState } from './types';
import Login from './pages/Login';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Admins from './pages/Admins';
import Products from './pages/Products';
import About from './pages/About';
import LogoSettings from './pages/LogoSettings';
import Orders from './pages/Orders';
import Layout from './components/Layout';

// Notification Types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

interface AuthContextType {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto min-w-[300px] glass p-5 rounded-2xl shadow-2xl border-l-8 flex items-center justify-between animate-in slide-in-from-right-10 duration-300 ${
              n.type === 'success' ? 'border-emerald-500' : 
              n.type === 'error' ? 'border-red-500' : 
              n.type === 'warning' ? 'border-amber-500' : 'border-indigo-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <p className="text-[11px] font-black uppercase tracking-widest dark:text-white text-slate-900">
                {n.message}
              </p>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuthValue] = useState<AuthState>(() => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    role: localStorage.getItem('role') as UserRole,
    username: localStorage.getItem('username')
  }));

  const setAuth = (newAuth: AuthState) => {
    if (newAuth.accessToken) localStorage.setItem('accessToken', newAuth.accessToken);
    if (newAuth.refreshToken) localStorage.setItem('refreshToken', newAuth.refreshToken);
    if (newAuth.role) localStorage.setItem('role', newAuth.role);
    if (newAuth.username) localStorage.setItem('username', newAuth.username);
    setAuthValue(newAuth);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setAuthValue({ accessToken: null, refreshToken: null, role: null, username: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && auth.role && !roles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route 
                  path="admins" 
                  element={
                    <PrivateRoute roles={[UserRole.SUPER_ADMIN]}>
                      <Admins />
                    </PrivateRoute>
                  } 
                />
                <Route path="products" element={<Products />} />
                
                {/* Orders Routing with Full Parameter Support */}
                <Route path="orders" element={<Navigate to="/orders/all" replace />} />
                <Route path="orders/:status" element={<Orders />} />
                
                <Route path="about" element={<About />} />
                <Route path="logo" element={<LogoSettings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
