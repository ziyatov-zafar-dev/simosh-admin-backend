
import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { AdminUser, UserRole } from '../types';
// Fix: Import useNotification from AppContext instead of App
import { useNotification } from '../AppContext';

const Admins: React.FC = () => {
  const { showNotification } = useNotification();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAll();
      setAdmins(data);
    } catch (err: any) {
      showNotification("Adminlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

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
        showNotification("Admin ma'lumotlari yangilandi", "success");
      } else {
        await adminService.create(formData);
        showNotification("Yangi admin qo'shildi", "success");
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
      showNotification("O'chirishda xatolik", "error");
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-12 animate-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Jamoani <span className="text-indigo-600">Boshqarish</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] mt-4 ml-1">Adminlar va kirish huquqlari</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/30 font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
        >
          Yangi a'zo qo'shish +
        </button>
      </div>

      <div className="glass rounded-[3.5rem] shadow-2xl border-none overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-10 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Foydalanuvchi</th>
                  <th className="px-10 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Elektron pochta</th>
                  <th className="px-10 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Huquqi</th>
                  <th className="px-10 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.05] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-indigo-500/20">
                          {admin.username[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 dark:text-white text-lg tracking-tighter uppercase">{admin.username}</p>
                           <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Status: Faol</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                         {admin.email}
                       </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex px-6 py-2.5 text-[10px] font-black rounded-full uppercase tracking-widest ${
                        admin.role === UserRole.SUPER_ADMIN ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {admin.role === UserRole.SUPER_ADMIN ? 'Bosh admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right space-x-3">
                      <button onClick={() => handleOpenModal(admin)} className="w-12 h-12 glass rounded-2xl text-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg">⚙️</button>
                      <button onClick={() => confirmDelete(admin.id)} className="w-12 h-12 glass rounded-2xl text-xl hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500">💀</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl animate-in">
          <div className="glass rounded-[4rem] w-full max-w-2xl shadow-2xl border-none overflow-hidden">
            <div className="p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{editingAdmin ? 'Tahrirlash' : 'Yangi'} a'zo</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Kirish ma'lumotlari</p>
              </div>
              <button onClick={handleCloseModal} className="w-16 h-16 glass rounded-[2rem] text-3xl hover:bg-red-500 hover:text-white transition-all">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Foydalanuvchi nomi</label>
                  <input type="text" required className="w-full px-8 py-5 rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email manzili</label>
                  <input type="email" required className="w-full px-8 py-5 rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maxfiy parol</label>
                <input type="password" required={!editingAdmin} className="w-full px-8 py-5 rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-indigo-500/10" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="pt-8 flex flex-col md:flex-row gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 transition-all">Bekor qilish</button>
                <button type="submit" className="flex-1 py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest text-white bg-indigo-600 shadow-2xl shadow-indigo-500/20">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Prompt */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
          <div className="glass rounded-[4rem] p-12 max-w-sm w-full border-none text-center shadow-2xl">
            <div className="text-7xl mb-10 animate-pulse">💀</div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase mb-6 tracking-tighter italic">Kirishni cheklash?</h3>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-12 uppercase tracking-widest">
              Ushbu amalni ortga qaytarib bo'lmaydi. Admin huquqlari butunlay bekor qilinadi.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal({ open: false, id: null })} className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest">Yo'q</button>
              <button onClick={handleDelete} className="flex-1 py-5 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/30">Ha, o'chirilsin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
