
import React, { useState, useEffect, useRef } from 'react';
import { logoService } from '../services/logoService';
import { Logo } from '../types';

const LogoSettings: React.FC = () => {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLogo = async () => {
    try {
      setLoading(true);
      const data = await logoService.get();
      if (data && data.imgUrl) setLogo(data);
    } catch (err: any) {
      console.error("Logo yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fayl turi va hajmini tekshirish (ixtiyoriy)
    if (!file.type.startsWith('image/')) {
      setError('Iltimos, faqat rasm faylini tanlang');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedLogo = await logoService.upload(file);
      setLogo(updatedLogo);
      setSuccess(true);
      
      // Sidebar va boshqa joylardagi logoni yangilash uchun event yuborish
      window.dispatchEvent(new CustomEvent('logoUpdated', { detail: updatedLogo }));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Logotipni yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="z-10 relative">
          <h1 className="text-4xl font-black text-white tracking-tight">Brend Identifikatsiyasi</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Tizim logotipini boshqarish va yangilash</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Joriy Logo Prevyusi */}
        <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10 flex flex-col items-center justify-center space-y-6">
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Hozirgi Logotip</h3>
          <div className="w-full aspect-square glass rounded-[2.5rem] flex items-center justify-center p-8 bg-white/40 dark:bg-slate-800/60 shadow-inner overflow-hidden">
            {logo?.imgUrl ? (
              <img src={logo.imgUrl} alt="SiMoSh Logo" className="max-h-full max-w-full object-contain drop-shadow-2xl animate-in zoom-in duration-500" />
            ) : (
              <div className="text-center opacity-20">
                <span className="text-8xl mb-4 block">🖼️</span>
                <p className="font-black uppercase tracking-widest text-sm">Logo mavjud emas</p>
              </div>
            )}
          </div>
          {logo && (
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{logo.imgName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Hajmi: {(logo.imgSize / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>

        {/* Yuklash Bo'limi */}
        <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10 flex flex-col">
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Yangilash</h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`group relative border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                uploading 
                ? 'border-indigo-500 bg-indigo-500/5 cursor-not-allowed' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              
              <div className="text-center">
                <div className={`text-6xl mb-6 transition-transform group-hover:scale-110 duration-500 ${uploading ? 'animate-bounce' : ''}`}>
                  {uploading ? '⏳' : '📤'}
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Yangi fayl tanlash</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">PNG, JPG yoki SVG (Max 2MB)</p>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black border border-red-500/20 uppercase tracking-widest animate-shake">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black border border-emerald-500/20 uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                  ✅ Logotip muvaffaqiyatli yangilandi!
                </div>
              )}
            </div>

            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed text-center">
              Eslatma: Logotip yangilangandan so'ng u butun tizim bo'ylab (sidebar, dashboard va login sahifasi) avtomatik o'zgaradi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSettings;
