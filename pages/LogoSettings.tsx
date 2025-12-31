
import React, { useState, useEffect, useRef } from 'react';
import { logoService } from '../services/logoService';
import { Logo } from '../types';
import { useNotification } from '../AppContext';

const LogoSettings: React.FC = () => {
  const { showNotification } = useNotification();
  const [logo, setLogo] = useState<Logo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    if (!file.type.startsWith('image/')) {
      showNotification('Iltimos, faqat rasm faylini tanlang', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const updatedLogo = await logoService.upload(file);
      setLogo(updatedLogo);
      showNotification("Brend logotipi muvaffaqiyatli yangilandi", "success");
      window.dispatchEvent(new CustomEvent('logoUpdated', { detail: updatedLogo }));
    } catch (err: any) {
      showNotification(err.message || "Logotipni yuklashda xatolik yuz berdi", "error");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in pb-20 px-4 sm:px-0">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 sm:p-14 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-white/10 blur-[80px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-5%] w-60 h-60 bg-pink-500/20 blur-[60px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase italic leading-tight">
            Brend <span className="text-indigo-200">Identifikatsiyasi</span>
          </h1>
          <p className="text-indigo-100 font-bold uppercase text-[11px] tracking-[0.4em] mt-4 opacity-80">Logotipni yangilash va boshqarish</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="glass rounded-[4rem] p-10 sm:p-14 shadow-2xl border-white/40 dark:border-white/5 flex flex-col items-center justify-center relative group min-h-[450px]">
            <p className="absolute top-10 left-10 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900/50 px-5 py-2 rounded-full">Prevyu</p>
            
            <div className="w-full max-w-[320px] aspect-square relative flex items-center justify-center">
              {/* Pulsing background glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-[60px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000"></div>
              
              <div className="relative w-full h-full glass rounded-[4rem] flex items-center justify-center p-12 bg-white/80 dark:bg-slate-800/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden border border-white/60 dark:border-white/10 transition-all duration-700 group-hover:rounded-[3.5rem]">
                {(previewUrl || logo?.imgUrl) ? (
                  <img 
                    src={previewUrl || logo?.imgUrl} 
                    alt="Logo" 
                    className="max-h-full max-w-full object-contain drop-shadow-2xl animate-in zoom-in duration-700" 
                  />
                ) : (
                  <div className="text-center opacity-30">
                    <span className="text-9xl mb-6 block">🎨</span>
                    <p className="font-black uppercase tracking-[0.2em] text-xs">Logo Yo'q</p>
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-md flex items-center justify-center z-10">
                     <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[3.5rem] p-10 shadow-2xl border-white/40 dark:border-white/5 h-full flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-10">Faylni Tanlang</h3>
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative border-4 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer group overflow-hidden ${
                uploading 
                ? 'border-indigo-500 bg-indigo-500/5 cursor-not-allowed opacity-50' 
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5'
              }`}
            >
              <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
              <div className="text-center">
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500">☁️</div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase">Upload</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">SVG, PNG, JPG</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSettings;
