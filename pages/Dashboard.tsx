
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useTheme, useNotification } from '../App';
import { logoService } from '../services/logoService';
import { statisticsService } from '../services/statisticsService';
import { productService } from '../services/productService';
import { Logo, Statistics, Product, Order, OrderStatus } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, statusesData, productsData] = await Promise.all([
        statisticsService.getOrders().catch(() => []),
        statisticsService.getStatuses().catch(() => []),
        productService.getAll().catch(() => [])
      ]);
      
      setOrders(ordersData);
      setStatuses(statusesData);
      setProducts(productsData);
    } catch (err: any) {
      showNotification("Statistika yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Faqat SOTIB OLINGAN buyurtmalarni filtrlash
  const soldOrders = useMemo(() => orders.filter(o => o.status === 'SOLD'), [orders]);

  // Jami tushumni faqat SOLD buyurtmalar bo'yicha hisoblash
  const revenueByCurrency = useMemo(() => {
    return soldOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const currency = product.currency || 'UZS';
          const amount = item.quantity * product.price;
          acc[currency] = (acc[currency] || 0) + amount;
        }
      });
      return acc;
    }, {} as Record<string, number>);
  }, [soldOrders, products]);

  // Har bir mahsulot bo'yicha sotuv tahlili (faqat SOLD)
  const productPerformance = useMemo(() => {
    return products.map(product => {
      const totalSold = soldOrders.reduce((acc, order) => {
        const item = order.items.find(i => i.productId === product.id);
        return acc + (item ? item.quantity : 0);
      }, 0);
      
      return {
        id: product.id,
        name: product.nameUz,
        count: totalSold,
        revenue: totalSold * product.price,
        currency: product.currency,
        img: product.imgUrl
      };
    }).filter(p => p.count > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [soldOrders, products]);

  const totalSoldItemsCount = useMemo(() => productPerformance.reduce((acc, p) => acc + p.count, 0), [productPerformance]);

  const chartData = useMemo(() => productPerformance.map(p => ({
    name: p.name,
    percentage: totalSoldItemsCount > 0 ? Number(((p.count / totalSoldItemsCount) * 100).toFixed(1)) : 0,
    count: p.count,
    revenue: p.revenue,
    currency: p.currency
  })), [productPerformance, totalSoldItemsCount]);

  const getStatusLabel = (code: string, defaultDesc: string) => {
    switch (code) {
      case 'SOLD': return 'Sotib olingan';
      case 'IN_PROGRESS': return 'Jarayonda';
      case 'CANCELED': return 'Bekor qilingan';
      default: return defaultDesc;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              SiMoSh <span className="text-indigo-600">Finance</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Faqat sotilgan mahsulotlar tahlili
            </p>
         </div>
         <button onClick={fetchData} className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg">
           ♻️ Yangilash
         </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 glass p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 opacity-[0.05] rounded-bl-full"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jami Sof Tushum (SOLD)</p>
          <div className="space-y-2">
            {Object.entries(revenueByCurrency).length > 0 ? (
              Object.entries(revenueByCurrency).map(([curr, val]) => (
                <h3 key={curr} className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                  {val.toLocaleString()} <span className="text-indigo-500 text-sm">{curr}</span>
                </h3>
              ))
            ) : (
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">0 UZS</h3>
            )}
          </div>
        </div>

        {[
          { label: 'Sotilganlar', value: soldOrders.length, icon: '✅', color: 'emerald', desc: 'Muvaffaqiyatli' },
          { label: 'Jarayonda', value: orders.filter(o => o.status === 'IN_PROGRESS').length, icon: '⏳', color: 'amber', desc: 'Kutilmoqda' },
          { label: 'Bekor qilingan', value: orders.filter(o => o.status === 'CANCELED').length, icon: '❌', color: 'red', desc: 'Rad etilgan' },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 sm:p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500 opacity-[0.05] rounded-bl-full`}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-500 mt-1 opacity-60 uppercase tracking-widest">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 glass p-6 sm:p-10 rounded-[3rem] shadow-2xl bg-slate-950 border-white/5">
           <div className="mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">MAHSULOTLAR ULUSHI (%)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Faqat muvaffaqiyatli sotilganlar bo'yicha</p>
           </div>
           
           <div className="h-80 sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} angle={-25} textAnchor="end" interval={0} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                             <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl">
                                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">{data.name}</p>
                                <p className="text-sm font-black text-white">{data.count} dona ({data.percentage}%)</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase mt-1">Daromad: {data.revenue.toLocaleString()} {data.currency}</p>
                             </div>
                          );
                       }
                       return null;
                    }}
                  />
                  <Bar dataKey="percentage" radius={[15, 15, 0, 0]} barSize={50}>
                     {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Product Performance Table - Fixed for Mobile */}
        <div className="lg:col-span-1 glass p-6 sm:p-8 rounded-[3rem] shadow-2xl border-white/10 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 text-center sm:text-left">Mahsulotlar Daromadi</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] scrollbar-hide pr-1">
            {productPerformance.map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-indigo-500/10 flex-shrink-0 flex items-center justify-center">
                    {p.img ? <img src={p.img} className="w-full h-full object-cover" /> : <span>🧼</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter max-w-[120px] sm:max-w-none">{p.name}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase">{p.count} ta sotildi</p>
                  </div>
                </div>
                {/* flex-shrink-0 ensures the price is NEVER hidden on mobile */}
                <div className="text-right flex-shrink-0 ml-auto">
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{p.revenue.toLocaleString()}</p>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase">{p.currency}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Faqat SOLD statusi asosida</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
