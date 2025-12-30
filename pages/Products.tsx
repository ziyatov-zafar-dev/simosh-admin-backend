
import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';
import { Product, ProductStatus } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useNotification } from '../App';

type Lang = 'Uz' | 'Ru' | 'Tr' | 'En';

const Products: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<Lang>('Uz');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    nameUz: '', nameRu: '', nameTr: '', nameEn: '',
    descUz: '', descRu: '', descTr: '', descEn: '',
    price: 0, currency: 'UZS', status: ProductStatus.ACTIVE,
    imgUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      showNotification(err.message || 'Mahsulotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAiGenerate = async () => {
    if (!formData.nameUz || formData.nameUz.trim().length < 3) {
      showNotification("Avval o'zbekcha nomni kiriting!", "warning");
      return;
    }

    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Siz SiMoSh mahsulot mutaxassisiz. Nomi: "${formData.nameUz}". Boshqa tillarga tarjima va marketing tavsifini JSON formatda bering.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameRu: { type: Type.STRING },
              nameTr: { type: Type.STRING },
              nameEn: { type: Type.STRING },
              descUz: { type: Type.STRING },
              descRu: { type: Type.STRING },
              descTr: { type: Type.STRING },
              descEn: { type: Type.STRING },
            },
            required: ["nameRu", "nameTr", "nameEn", "descUz", "descRu", "descTr", "descEn"]
          }
        }
      });

      const aiResult = JSON.parse(response.text?.trim() || '{}');
      setFormData(prev => ({ ...prev, ...aiResult }));
      showNotification("AI tomonidan to'ldirildi", "success");
    } catch (err) {
      showNotification("AI xatoligi", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
      setPreviewUrl(product.imgUrl);
    } else {
      setEditingProduct(null);
      setFormData({
        nameUz: '', nameRu: '', nameTr: '', nameEn: '',
        descUz: '', descRu: '', descTr: '', descEn: '',
        price: 0, currency: 'UZS', status: ProductStatus.ACTIVE,
        imgUrl: ''
      });
      setPreviewUrl(null);
    }
    setSelectedFile(undefined);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saveLoading) return;
    setModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      let payload = { ...formData };
      if (selectedFile) {
        const uploadRes = await productService.uploadFile(selectedFile);
        payload.imgUrl = uploadRes.url;
      }
      const { id, createdAt, updatedAt, ...requestData } = payload as any;
      if (editingProduct) {
        await productService.update(editingProduct.id, requestData);
        showNotification("Yangilandi", "success");
      } else {
        if (!requestData.imgUrl) {
          showNotification("Rasm shart!", "warning");
          setSaveLoading(false);
          return;
        }
        await productService.create(requestData);
        showNotification("Qo'shildi", "success");
      }
      fetchProducts();
      handleCloseModal();
    } catch (err: any) {
      showNotification("Xatolik", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const confirmDelete = (id: string) => setConfirmModal({ open: true, id });

  const handleDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await productService.delete(confirmModal.id);
      showNotification("O'chirildi", "success");
      fetchProducts();
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-2 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-indigo-600 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 blur-[100px] rounded-full"></div>
        <div className="z-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Mahsulotlar</h1>
          <p className="text-indigo-100 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.3em] mt-2">Katalog boshqaruvi</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="z-10 w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          ✨ Yangi mahsulot
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product) => (
            <div key={product.id} className="glass group hover:scale-[1.02] transition-all rounded-[2.5rem] sm:rounded-[3rem] shadow-xl overflow-hidden flex flex-col border border-white/40 dark:border-white/10">
              <div className="relative aspect-square sm:aspect-video md:aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img src={product.imgUrl} alt={product.nameUz} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg ${product.status === ProductStatus.ACTIVE ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {product.status === ProductStatus.ACTIVE ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{product.nameUz}</h3>
                  <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {product.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="min-w-0 mr-2">
                    <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 truncate block">{product.price.toLocaleString()}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{product.currency}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleOpenModal(product)} className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl hover:bg-indigo-500 hover:text-white transition-all shadow-md dark:text-white">⚙️</button>
                    <button onClick={() => confirmDelete(product.id)} className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl hover:bg-red-500 hover:text-white transition-all shadow-md dark:text-white">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 max-w-sm w-full border border-white/20 text-center animate-in zoom-in duration-300">
            <div className="text-5xl sm:text-6xl mb-6">🗑️</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase mb-4">O'chirilsinmi?</h3>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal({ open: false, id: null })} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest">Yo'q</button>
              <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg">Ha</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass h-full sm:h-auto sm:rounded-[3rem] lg:rounded-[4rem] w-full max-w-4xl sm:max-h-[90vh] shadow-2xl animate-in zoom-in duration-500 border-white/20 overflow-hidden flex flex-col">
            <div className="h-2 sm:h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full"></div>
            <div className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                 {editingProduct ? 'Tahrirlash' : 'Yangi'}
              </h3>
              <button onClick={handleCloseModal} className="w-10 h-10 sm:w-14 sm:h-14 glass rounded-xl sm:rounded-3xl text-2xl sm:text-3xl hover:bg-red-500 hover:text-white transition-all text-slate-700 dark:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                <div className="space-y-6">
                  <div onClick={() => !saveLoading && fileInputRef.current?.click()} className="relative aspect-video rounded-3xl sm:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden">
                    {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center"><span className="text-4xl mb-2 block">📸</span><p className="text-[10px] font-black text-slate-400 uppercase">Rasm yuklash</p></div>}
                  </div>
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                  
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Narxi</label><input type="number" required className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valyuta</label><select className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}><option value="UZS">UZS</option><option value="USD">USD</option></select></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl gap-1 flex-1 mr-4">
                      {(['Uz', 'Ru', 'Tr', 'En'] as Lang[]).map((l) => (
                        <button key={l} type="button" onClick={() => setActiveLangTab(l)} className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeLangTab === l ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{l}</button>
                      ))}
                    </div>
                    <button type="button" onClick={handleAiGenerate} disabled={aiLoading} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg flex items-center justify-center">{aiLoading ? '⏳' : '✨'}</button>
                  </div>
                  <div className="space-y-4 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-3xl p-5 border border-indigo-500/10">
                    <input type="text" required className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={(formData as any)[`name${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`name${activeLangTab}`]: e.target.value })} placeholder="Nomi" />
                    <textarea required rows={4} className="w-full px-5 py-4 sm:px-6 sm:py-5 rounded-2xl sm:rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold resize-none" value={(formData as any)[`desc${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`desc${activeLangTab}`]: e.target.value })} placeholder="Tavsifi" />
                  </div>
                </div>
              </div>

              <div className="pt-6 pb-4 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={handleCloseModal} className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800">Bekor qilish</button>
                <button type="submit" disabled={saveLoading} className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-xl">{saveLoading ? '...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
