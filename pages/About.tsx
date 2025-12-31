
import React, { useState, useEffect, useRef } from 'react';
import { aboutService } from '../services/aboutService';
import { logoService } from '../services/logoService';
import { About as AboutType, Logo } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useNotification, useT } from '../AppContext';

type Lang = 'Uz' | 'Ru' | 'Tr' | 'En';

const About: React.FC = () => {
  const { showNotification } = useNotification();
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState<Lang>('Uz');
  const [logo, setLogo] = useState<Logo | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AboutType>({
    descriptionUz: '', descriptionRu: '', descriptionTr: '', descriptionEn: '',
    officeAddressUz: '', officeAddressRu: '', officeAddressTr: '', officeAddressEn: '',
    instagram: '', telegram: '', phone: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aboutData, logoData] = await Promise.all([
        aboutService.get(),
        logoService.get()
      ]);
      if (aboutData) setFormData(aboutData);
      if (logoData) setLogo(logoData);
    } catch (err: any) {
      showNotification("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    try {
      const updatedLogo = await logoService.upload(file);
      setLogo(updatedLogo);
      showNotification("Logotip yangilandi", "success");
      window.dispatchEvent(new CustomEvent('logoUpdated', { detail: updatedLogo }));
    } catch (err: any) {
      showNotification("Logotip yuklashda xatolik", "error");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.descriptionUz || formData.descriptionUz.trim().length < 10) {
      showNotification("Avval o'zbekcha tavsifni batafsilroq kiriting!", "warning");
      return;
    }

    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Siz SiMoSh marketing mutaxassisiz. O'zbekcha tavsifni boshqa tillarga jozibador marketing matni ko'rinishida tarjima qiling.
      UZ Tavsif: ${formData.descriptionUz}
      UZ Manzil: ${formData.officeAddressUz}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              descriptionRu: { type: Type.STRING },
              descriptionTr: { type: Type.STRING },
              descriptionEn: { type: Type.STRING },
              officeAddressRu: { type: Type.STRING },
              officeAddressTr: { type: Type.STRING },
              officeAddressEn: { type: Type.STRING },
            },
            required: ["descriptionRu", "descriptionTr", "descriptionEn", "officeAddressRu", "officeAddressTr", "officeAddressEn"]
          }
        }
      });

      const aiResult = JSON.parse(response.text?.trim() || '{}');
      setFormData(prev => ({ ...prev, ...aiResult }));
      showNotification("AI tarjimasi yakunlandi", "success");
    } catch (err) {
      showNotification("AI bilan ishlashda xatolik", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await aboutService.update(formData);
      showNotification("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
    } catch (err: any) {
      showNotification("Saqlashda xatolik yuz berdi", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Brend boshqaruvi</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Kompaniya haqida ma'lumotlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10 flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-8">Logotip</h3>
            <div className="relative group w-full aspect-square max-w-[240px] glass rounded-[3rem] overflow-hidden flex items-center justify-center p-8 bg-white/40 dark:bg-slate-800/60 border border-white/20 shadow-inner mb-8">
              {logoLoading ? (
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : logo?.imgUrl ? (
                <img src={logo.imgUrl} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-xl" />
              ) : (
                <span className="text-6xl">🏢</span>
              )}
            </div>
            <input ref={logoInputRef} type="file" hidden accept="image/*" onChange={handleLogoUpload} />
            <button 
              type="button"
              onClick={() => logoInputRef.current?.click()} 
              disabled={logoLoading} 
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Logotipni yangilash ☁️
            </button>
          </div>

          <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-8">Kontaktlar</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
                <input type="text" className="w-full px-6 py-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram</label>
                <input type="text" className="w-full px-6 py-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telegram</label>
                <input type="text" className="w-full px-6 py-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={formData.telegram} onChange={(e) => setFormData({...formData, telegram: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl gap-1">
                {(['Uz', 'Ru', 'Tr', 'En'] as Lang[]).map((l) => (
                  <button key={l} type="button" onClick={() => setActiveLangTab(l)} className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeLangTab === l ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{l}</button>
                ))}
              </div>
              <button type="button" onClick={handleAiGenerate} disabled={aiLoading} className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-all">
                {aiLoading ? '⏳' : '✨'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{activeLangTab} dagi tavsif</label>
                <textarea rows={8} className="w-full px-8 py-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold resize-none" value={(formData as any)[`description${activeLangTab}`]} onChange={(e) => setFormData({...formData, [`description${activeLangTab}`]: e.target.value})} placeholder="Kompaniya haqida batafsil..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{activeLangTab} dagi manzil</label>
                <input type="text" className="w-full px-8 py-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={(formData as any)[`officeAddress${activeLangTab}`]} onChange={(e) => setFormData({...formData, [`officeAddress${activeLangTab}`]: e.target.value})} placeholder="Manzil..." />
              </div>
            </div>

            <button type="submit" disabled={saveLoading} className="w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] text-white bg-indigo-600 shadow-xl hover:scale-[1.02] transition-all">
              {saveLoading ? 'Saqlanmoqda...' : 'Ma\'lumotlarni saqlash 💾'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default About;
