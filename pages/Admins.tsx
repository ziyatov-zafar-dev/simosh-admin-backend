
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AdminUser, UserRole } from '../types';
import { useNotification } from '../App';

const Admins: React.FC = () => {
  const { showNotification } = useNotification();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError(err.message || 'Boshqaruvchilarni yuklashda xatolik');
      showNotification(err.message || 'Yuklashda xatolik', 'error');
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminService.update(editingAdmin.id, formData);
        showNotification("Admin muvaffaqiyatli yangilandi", "success");
      } else {
        await adminService.create(formData);
        showNotification("Yangi admin yaratildi", "success");
      }
      fetchAdmins();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      showNotification(err.message || "Amal bajarilmadi", "error");
    }
  };

  const confirmDelete = (id: string) => {
    setConfirmModal({ open: true, id });
  };

  const handleDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await adminService.delete(confirmModal.id);
      showNotification("Admin tizimdan o'chirildi", "success");
      fetchAdmins();
    } catch (err: any) {
      showNotification(err.message || "O'chirishda xatolik", "error");
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-80 h-80 bg-white/10 blur-[80px] rounded-full"></div>
        <div className="z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Boshqaruv markazi</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Tizim adminlari va huquqlarini boshqarish</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="z-10 bg-white text-indigo-600 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center group"
        >
          <span className="mr-3 text-2xl group-hover:rotate-90 transition-transform">+</span> Yangi admin
        </button>
      </div>

      {loading && admins.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass rounded-[3rem] shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-indigo-500/5 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Identifikatsiya</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Aloqa kanali</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Huquqlar</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-indigo-500/5 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center">
                        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xl mr-5 shadow-lg group-hover:scale-110 transition-transform">
                          {admin.username[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{admin.username}</p>
                           <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Faol admin</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                         {admin.email}
                       </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest ${
                        admin.role === UserRole.SUPER_ADMIN 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {admin.role === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right space-x-3">
                      <button 
                        onClick={() => handleOpenModal(admin)}
                        className="w-12 h-12 glass rounded-2xl text-xl hover:bg-indigo-500 hover:text-white transition-all shadow-md dark:text-white"
                        title="Tahrirlash"
                      >
                        ⚙️
                      </button>
                      <button 
                        onClick={() => confirmDelete(admin.id)}
                        className="w-12 h-12 glass rounded-2xl text-xl hover:bg-red-500 hover:text-white transition-all shadow-md dark:text-white"
                        title="O'chirish"
                      >
                        💀
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass rounded-[3rem] p-10 max-w-sm w-full border border-white/20 text-center animate-in zoom-in duration-300 shadow-2xl">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">Ishonchingiz komilmi?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
              Ushbu adminni o'chirib tashlash ortga qaytarilmaydigan amaldir.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal({ open: false, id: null })}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
              >
                Ha, o'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modali */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass rounded-[4rem] w-full max-w-xl shadow-2xl animate-in zoom-in duration-500 border border-white/20 dark:border-white/10 overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
            <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                   {editingAdmin ? 'Tahrirlash' : 'Yangi admin'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2">Ma'lumotlarni kiriting</p>
              </div>
              <button onClick={handleCloseModal} className="w-14 h-14 glass rounded-3xl text-3xl font-light hover:bg-red-500 hover:text-white transition-all dark:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. zafar_admin"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@simosh.io"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Parol {editingAdmin && '(o\'zgartirish ixtiyoriy)'}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  className="w-full px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                />
              </div>

              <div className="pt-10 flex gap-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:glow-primary transition-all shadow-xl shadow-indigo-500/20"
                >
                  {editingAdmin ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
