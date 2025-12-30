
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AdminUser, UserRole } from '../types';
import { useNotification } from '../App';

const Admins: React.FC = () => {
  const { showNotification } = useNotification();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (err: any) {
      showNotification("Yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenModal = (admin?: AdminUser) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ username: admin.username, email: admin.email, password: '' });
    } else {
      setEditingAdmin(null);
      setFormData({ username: '', email: '', password: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminService.update(editingAdmin.id, formData);
        showNotification("Yangilandi", "success");
      } else {
        await adminService.create(formData);
        showNotification("Yaratildi", "success");
      }
      fetchAdmins();
      handleCloseModal();
    } catch (err: any) {
      showNotification("Amal bajarilmadi", "error");
    }
  };

  const confirmDelete = (id: string) => setConfirmModal({ open: true, id });

  const handleDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await adminService.delete(confirmModal.id);
      showNotification("Admin o'chirildi", "success");
      fetchAdmins();
    } catch (err: any) {
      showNotification("O'chirishda xatolik yuz berdi", "error");
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-2 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-600 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 sm:w-80 sm:h-80 bg-white/10 blur-[80px] rounded-full"></div>
        <div className="z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Adminlar</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Xodimlar boshqaruvi</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="z-10 w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center"
        >
          <span className="mr-3 text-xl">+</span> Yangi admin
        </button>
      </div>

      <div className="glass rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-indigo-500/5 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 sm:px-10 py-6 sm:py-8 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifikatsiya</th>
                <th className="px-6 sm:px-10 py-6 sm:py-8 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aloqa</th>
                <th className="px-6 sm:px-10 py-6 sm:py-8 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Huquqlar</th>
                <th className="px-6 sm:px-10 py-6 sm:py-8 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-indigo-500/5 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 sm:px-10 py-5 sm:py-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm sm:text-xl mr-4 sm:mr-5 shadow-lg">
                        {admin.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                         <p className="font-black text-slate-900 dark:text-white text-sm sm:text-lg tracking-tight truncate">{admin.username}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faol</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 sm:px-10 py-5 sm:py-6">
                     <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700">
                       {admin.email}
                     </span>
                  </td>
                  <td className="px-6 sm:px-10 py-5 sm:py-6">
                    <span className={`inline-flex px-3 sm:px-5 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest ${
                      admin.role === UserRole.SUPER_ADMIN ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                    }`}>
                      {admin.role === UserRole.SUPER_ADMIN ? 'Super' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 sm:px-10 py-5 sm:py-6 text-right space-x-2">
                    <button onClick={() => handleOpenModal(admin)} className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-xl sm:rounded-2xl text-lg hover:bg-indigo-500 hover:text-white transition-all shadow-md dark:text-white">⚙️</button>
                    <button onClick={() => confirmDelete(admin.id)} className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-xl sm:rounded-2xl text-lg hover:bg-red-500 hover:text-white transition-all shadow-md dark:text-white">💀</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass rounded-[2.5rem] sm:rounded-[4rem] w-full max-w-xl shadow-2xl border-white/20 overflow-hidden">
            <div className="h-2 sm:h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
            <div className="p-8 sm:p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                 {editingAdmin ? 'Tahrirlash' : 'Yangi'}
              </h3>
              <button onClick={handleCloseModal} className="w-10 h-10 sm:w-14 sm:h-14 glass rounded-xl sm:rounded-3xl text-2xl hover:bg-red-500 hover:text-white transition-all text-slate-700 dark:text-white">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" required className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" required className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parol</label>
                <input type="password" required={!editingAdmin} className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={handleCloseModal} className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 transition-all">Bekor</button>
                <button type="submit" className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass rounded-[2.5rem] sm:rounded-[3rem] p-10 sm:p-12 max-w-sm w-full border border-white/20 text-center animate-in zoom-in duration-300">
            <div className="text-6xl mb-8 animate-bounce">⚠️</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase mb-6 tracking-tighter">Adminni o'chirish?</h3>
            
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl mb-10 text-left">
              <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Diqqat:</p>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Ushbu amalni ortga qaytarib bo'lmaydi. Tanlangan admin foydalanuvchi tizimdan butunlay o'chib ketadi.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal({ open: false, id: null })} 
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Yo'q
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-red-500/20"
              >
                Ha, O'chirilsin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
