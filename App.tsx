
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import { AppProvider, useAuth, useNotification } from './AppContext';
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

const AppContent: React.FC = () => {
  const { auth } = useAuth();
  const { notifications } = useNotification();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={auth.accessToken ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="orders/:status" element={<Orders />} />
          <Route path="orders" element={<Navigate to="/orders/all" />} />
          <Route path="products" element={<Products />} />
          <Route path="about" element={<About />} />
          <Route path="logo" element={<LogoSettings />} />
          <Route path="admins" element={auth.role === UserRole.SUPER_ADMIN ? <Admins /> : <Navigate to="/" />} />
        </Route>
      </Routes>
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
        {notifications.map((n) => (
          <div key={n.id} className={`glass p-5 rounded-2xl shadow-2xl border-l-8 min-w-[300px] animate-in slide-in-from-right-10 ${n.type === 'success' ? 'border-emerald-500' : n.type === 'warning' ? 'border-amber-500' : 'border-red-500'}`}>
            <p className="text-[11px] font-black uppercase tracking-widest">{n.message}</p>
          </div>
        ))}
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
