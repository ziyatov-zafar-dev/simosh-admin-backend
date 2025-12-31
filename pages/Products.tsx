
import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/productService';
import { Product, ProductStatus } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useNotification } from '../AppContext';

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
      showNotification(err.message || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAiGenerate = async () => {
    if (!formData.nameUz || formData.nameUz.trim().length < 3) {
      showNotification("Nom kiriting", "warning");
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `SiMoSh mahsuloti: "${formData.nameUz}". Boshqa tillarga tarjima va marketing tavsifi. JSON format.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nameRu: { type: Type.STRING }, nameTr: { type: Type.STRING }, nameEn: { type: Type.STRING },
              descUz: { type: Type.STRING }, descRu: { type: Type.STRING }, descTr: { type: Type.STRING }, descEn: { type: Type.STRING },
            }
          }
        }
      });
      const aiResult = JSON.parse(response.text?.trim() || '{}');
      setFormData(prev => ({ ...prev, ...aiResult }));
      showNotification("AI yakunlandi", "success");
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
      if (editingProduct) await productService.update(editingProduct.id, requestData);
      else await productService.create(requestData);
      fetchProducts();
      setModalOpen(false);
      showNotification("Muvaffaqiyatli", "success");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-indigo-600 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full"></div>
        <div className="z-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-white tracking-tight">Katalog</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Barcha Mahsulotlar</p>
        </div>
        <button onClick={() => handleOpenModal()} className="z-10 bg-white text-indigo-600 px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl">
          Qo'shish +
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="glass group hover:scale-[1.03] transition-all duration-500 rounded-[3.5rem] shadow-xl overflow-hidden flex flex-col border-white/20">
            {/* Premium Image Container */}
            <div className="relative aspect-square m-3 rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              <img src={product.imgUrl} alt={product.nameUz} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-6 right-6 z-20">
                <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md ${product.status === ProductStatus.ACTIVE ? 'bg-emerald-500/80 text-white' : 'bg-slate-500/80 text-white'}`}>
                  {product.status === ProductStatus.ACTIVE ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 truncate">{product.nameUz}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">ID: {product.id.slice(0, 8)}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="min-w-0">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{product.price.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{product.currency}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(product)} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg">⚙️</button>
                  <button onClick={() => setConfirmModal({ open: true, id: product.id })} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-xl hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl animate-in">
          <div className="glass rounded-[4rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border-white/20 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic">{editingProduct ? 'Tahrirlash' : 'Yangi Mahsulot'}</h3>
              <button onClick={() => setModalOpen(false)} className="w-14 h-14 glass rounded-3xl text-3xl hover:bg-red-500 hover:text-white transition-all">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="aspect-square rounded-[3.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all overflow-hidden relative group"
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📸</span>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Rasm tanlang</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase">O'zgartirish</span>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                
                <div className="space-y-8">
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-3xl gap-1">
                    {(['Uz', 'Ru', 'Tr', 'En'] as Lang[]).map((l) => (
                      <button key={l} type="button" onClick={() => setActiveLangTab(l)} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeLangTab === l ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>{l}</button>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <input type="text" required className="w-full px-8 py-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold" value={(formData as any)[`name${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`name${activeLangTab}`]: e.target.value })} placeholder="Nomi" />
                    <textarea required rows={5} className="w-full px-8 py-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold resize-none" value={(formData as any)[`desc${activeLangTab}`]} onChange={(e) => setFormData({ ...formData, [`desc${activeLangTab}`]: e.target.value })} placeholder="Tavsifi..." />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <input type="number" required className="w-full px-8 py-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} placeholder="Narxi" />
                    <select className="w-full px-8 py-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800">Bekor qilish</button>
                <button type="submit" disabled={saveLoading} className="flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-white bg-indigo-600 shadow-2xl shadow-indigo-500/20">{saveLoading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
