
import React, { useState, useEffect, useRef } from 'react';
import { aboutService } from '../services/aboutService';
import { logoService } from '../services/logoService';
import { About as AboutType, Logo } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useNotification } from '../App';

type Lang = 'Uz' | 'Ru' | 'Tr' | 'En';

const About: React.FC = () => {
  const { showNotification } = useNotification();
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
      UZ: ${formData.descriptionUz}
      Manzil: ${formData.officeAddressUz}`;

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
        <div className="z-10">
          <h1 className="text-4xl font-black text-white tracking-tight">Brend boshqaruvi</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Logotip va asosiy ma'lumotlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Logotip sozlamalari</h3>
            
            <div className="space-y-8 flex flex-col items-center">
              <div className="relative group w-full aspect-square max-w-[200px] glass rounded-[2.5rem] overflow-hidden flex items-center justify-center p-6 bg-white/40 dark:bg-slate-800/60 border border-white/20 shadow-inner">
                {logoLoading ? (
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : logo?.imgUrl ? (
                  <img src={logo.imgUrl} alt="SiMoSh Logo" className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                ) : (
                  <div className="text-center opacity-30"><span className="text-6xl mb-2 block">🖼️</span><p className="text-[10px] font-black uppercase tracking-widest">Logo yo'q</p></div>
                )}
              </div>

              <div className="w-full space-y-4">
                <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoLoading}
                  className="w-full py-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center"
                >
                  <span className="mr-3 text-lg">📷</span> Rasmni tanlash
                </button>
              </div>
            </div>
          </div>

          <div className="glass rounded-[3rem] p-10 shadow-xl space-y-8 border border-white/40 dark:border-white/10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Aloqa kanallari</h3>
            <div className="space-y-6">
              {[
                { label: 'Instagram', key: 'instagram', icon: '📸' },
                { label: 'Telegram', key: 'telegram', icon: '✈️' },
                { label: 'Telefon', key: 'phone', icon: '📞' }
              ].map(social => (
                <div key={social.key} className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{social.label}</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">{social.icon}</span>
                    <input type="text" className="w-full pl-16 pr-8 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={(formData as any)[social.key]} onChange={(e) => setFormData({ ...formData, [social.key]: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[3rem] p-10 shadow-xl border border-white/40 dark:border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Biz haqimizda matni</h3>
               <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl gap-1 border dark:border-slate-800">
                  {(['Uz', 'Ru', 'Tr', 'En'] as Lang[]).map((l) => (
                    <button key={l} type="button" onClick={() => setActiveLangTab(l)} className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeLangTab === l ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 dark:text-slate-500'}`}>{l}</button>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kompaniya tavsifi ({activeLangTab})</label>
                  {activeLangTab === 'Uz' && (
                    <button type="button" onClick={handleAiGenerate} disabled={aiLoading} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                      {aiLoading ? '⏳' : '✨ AI Tarjima'}
                    </button>
                  )}
                </div>
                <textarea required rows={10} className="w-full px-8 py-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-bold resize-none outline-none focus:ring-4 focus:ring-indigo-500/10" value={(formData as any)[`description${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`description${activeLangTab}`]: e.target.value })} />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Manzil ({activeLangTab})</label>
                <input type="text" required className="w-full px-8 py-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/10" value={(formData as any)[`officeAddress${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`officeAddress${activeLangTab}`]: e.target.value })} />
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSubmit}
                  disabled={saveLoading}
                  className="w-full py-8 rounded-[2.5rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {saveLoading ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
