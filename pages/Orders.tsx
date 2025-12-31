
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { statisticsService } from '../services/statisticsService';
import { productService } from '../services/productService';
import { Order, OrderStatus, Product, OrderItem } from '../types';
// Fix: Import useNotification from AppContext instead of App
import { useNotification } from '../AppContext';

const Orders: React.FC = () => {
  const { status: urlStatus } = useParams<{ status: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const filterStatus = useMemo(() => {
    if (!urlStatus) return 'ALL';
    const upper = urlStatus.toUpperCase();
    return ['SOLD', 'CANCELED', 'IN_PROGRESS'].includes(upper) ? upper : 'ALL';
  }, [urlStatus]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [selectedOrderItems, setSelectedOrderItems] = useState<{items: OrderItem[], orderId: string} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{id: string, nextStatus: string, label: string} | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusLabel = (code: string) => {
    switch (code) {
      case 'SOLD': return 'Sotib olingan';
      case 'IN_PROGRESS': return 'Jarayonda';
      case 'CANCELED': return 'Bekor qilingan';
      case 'ALL': return 'Barchasi';
      default: return code;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, statusesData, productsData] = await Promise.all([
        filterStatus === 'ALL' 
          ? statisticsService.getOrders() 
          : statisticsService.getOrdersByStatus(filterStatus),
        statisticsService.getStatuses(),
        productService.getAll()
      ]);
      setOrders(ordersData);
      setStatuses(statusesData);
      setProducts(productsData);
      setCurrentPage(1);
    } catch (err: any) {
      showNotification("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return orders.slice(startIndex, startIndex + pageSize);
  }, [orders, currentPage, pageSize]);

  const totalPages = Math.ceil(orders.length / pageSize);

  const handleUpdateStatus = async () => {
    if (!confirmModal) return;
    const { id, nextStatus } = confirmModal;
    setUpdatingId(id);
    setConfirmModal(null);
    try {
      await statisticsService.updateOrderStatus(id, nextStatus);
      showNotification("Status yangilandi", "success");
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus, statusDescription: getStatusLabel(nextStatus) } : o));
    } catch (err: any) {
      showNotification("Xatolik yuz berdi", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getProductData = (id: string) => products.find(p => p.id === id);

  const calculateOrderTotal = (items: OrderItem[]) => {
    let total = 0;
    let currency = 'UZS';
    items.forEach(item => {
      const p = getProductData(item.productId);
      if (p) {
        total += p.price * item.quantity;
        currency = p.currency;
      }
    });
    return { total, currency };
  };

  const getStatusStyle = (code: string) => {
    switch (code) {
      case 'SOLD': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'CANCELED': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30';
      case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 sm:px-0">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-40%] right-[-10%] w-80 h-80 bg-white/10 blur-[90px] rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">Buyurtmalar</h1>
          <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.4em] mt-2 opacity-80">{getStatusLabel(filterStatus)} ro'yxati</p>
        </div>
        <div className="relative z-10 mt-10 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {['ALL', 'SOLD', 'IN_PROGRESS', 'CANCELED'].map(statusKey => {
            const isActive = filterStatus === statusKey;
            return (
              <button 
                key={statusKey}
                onClick={() => navigate(`/orders/${statusKey.toLowerCase()}`)}
                className={`px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap shadow-md ${isActive ? 'bg-white text-indigo-600 scale-105' : 'bg-indigo-500/30 text-white hover:bg-indigo-500/50'}`}
              >
                {getStatusLabel(statusKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sahifa hajmi:</span>
          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800">
            {[5, 10, 20].map(size => (
              <button key={size} onClick={() => {setPageSize(size); setCurrentPage(1);}} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${pageSize === size ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600'}`}>{size}</button>
            ))}
          </div>
        </div>
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
          Topildi: <span className="text-indigo-600">{orders.length}</span> buyurtma
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-40">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="hidden lg:block glass rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Vaqt</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mijoz</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Telefon</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Summa</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Buyurtma</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Status / Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedOrders.map((order) => {
                  const { date, time } = formatDateTime(order.createdAt);
                  const isInProgress = order.status === 'IN_PROGRESS';
                  const { total, currency } = calculateOrderTotal(order.items);
                  return (
                    <tr key={order.id} className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-all group">
                      <td className="px-8 py-6">
                         <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">{date}</p>
                         <p className="text-[10px] font-bold text-amber-500 mt-1">{time}</p>
                      </td>
                      <td className="px-8 py-6">
                         <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{order.firstName} {order.lastName}</p>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">{order.phone}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-900 dark:text-white">{total.toLocaleString()}</span>
                           <span className="text-[9px] font-black text-indigo-500 uppercase">{currency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button onClick={() => setSelectedOrderItems({items: order.items, orderId: order.id})} className="px-5 py-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          Ko'rish (x{order.items.reduce((acc, curr) => acc + curr.quantity, 0)})
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                           {updatingId === order.id ? (
                             <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                           ) : isInProgress ? (
                             <div className="flex gap-2">
                                <button onClick={() => setConfirmModal({id: order.id, nextStatus: 'SOLD', label: 'Sotib olingan'})} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 shadow-md shadow-emerald-500/20">✅ Sotildi</button>
                                <button onClick={() => setConfirmModal({id: order.id, nextStatus: 'CANCELED', label: 'Bekor qilingan'})} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 shadow-md shadow-red-500/20">❌ Bekor</button>
                             </div>
                           ) : (
                             <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] ${getStatusStyle(order.status)}`}>
                               {getStatusLabel(order.status)}
                             </span>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {paginatedOrders.map((order) => {
              const { date, time } = formatDateTime(order.createdAt);
              const isInProgress = order.status === 'IN_PROGRESS';
              const { total, currency } = calculateOrderTotal(order.items);
              return (
                <div key={order.id} className="glass p-6 rounded-[2.5rem] shadow-xl border border-white/20 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase">{date}</span>
                        <span className="text-[10px] font-black text-amber-500 uppercase">{time}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{order.firstName} {order.lastName}</h3>
                    </div>
                    <div className={`${getStatusStyle(order.status)} px-3 py-1.5 rounded-xl text-[8px] font-black uppercase`}>{getStatusLabel(order.status)}</div>
                  </div>
                  <div className="flex justify-between items-center mb-6 px-1">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{total.toLocaleString()} {currency}</p>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{order.phone}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedOrderItems({items: order.items, orderId: order.id})} className="flex-1 py-4 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Ko'rish</button>
                    {isInProgress && !updatingId && (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmModal({id: order.id, nextStatus: 'SOLD', label: 'Sotib olingan'})} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">✅</button>
                        <button onClick={() => setConfirmModal({id: order.id, nextStatus: 'CANCELED', label: 'Bekor qilingan'})} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg">❌</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 font-black text-slate-600 dark:text-white">&larr;</button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg' : 'glass text-slate-600 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400'}`}>{page}</button>
                    );
                  } else if (page === 2 || page === totalPages - 1) {
                    return <span key={page} className="px-1 text-slate-400 font-bold">...</span>;
                  }
                  return null;
                })}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 font-black text-slate-600 dark:text-white">&rarr;</button>
            </div>
          )}

          {orders.length === 0 && !loading && (
            <div className="text-center py-40 glass rounded-[3rem]">
               <div className="text-6xl mb-6 opacity-30">📦</div>
               <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Ushbu kategoriyada buyurtmalar mavjud emas</p>
            </div>
          )}
        </div>
      )}

      {selectedOrderItems && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full max-w-xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in duration-500">
            <div className="h-2 bg-indigo-600 w-full"></div>
            <div className="p-8 sm:p-12 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Mahsulotlar</h3>
              <button onClick={() => setSelectedOrderItems(null)} className="w-12 h-12 glass rounded-2xl text-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-slate-800 dark:text-white">&times;</button>
            </div>
            <div className="p-8 sm:p-12 space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide">
              {selectedOrderItems.items.map((item, idx) => {
                const p = getProductData(item.productId);
                return (
                  <div key={idx} className="flex justify-between items-center p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                        {p?.imgUrl ? <img src={p.imgUrl} className="w-full h-full object-cover rounded-xl" /> : <span>🧼</span>}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 dark:text-white text-sm uppercase block">{p?.nameUz || 'Noma\'lum'}</span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{p?.price.toLocaleString()} {p?.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.quantity} ta</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-8 sm:p-12 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-6">
              <div className="flex justify-between items-end border-b-2 border-dashed border-slate-200 dark:border-slate-800 pb-4">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jami hisob:</span>
                 <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{calculateOrderTotal(selectedOrderItems.items).total.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mt-1">{calculateOrderTotal(selectedOrderItems.items).currency}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedOrderItems(null)} className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl">Tushunarli</button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass rounded-[3rem] p-10 sm:p-12 max-w-sm w-full border border-white/20 text-center animate-in zoom-in duration-300">
            <div className="text-6xl mb-8">⚠️</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase mb-6 tracking-tighter">Ishonchingiz komilmi?</h3>
            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl mb-10 text-left">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                Ushbu operatsiyani bajarganingizdan so'ng, amalni qayta qilolmaydi.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">Bekor</button>
              <button onClick={handleUpdateStatus} className={`flex-1 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg ${confirmModal.nextStatus === 'SOLD' ? 'bg-emerald-500' : 'bg-red-500'}`}>Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
