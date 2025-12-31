
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Fix: Import hooks from AppContext instead of App
import { useTheme, useNotification, useLanguage, useT } from '../AppContext';
import { statisticsService } from '../services/statisticsService';
import { productService } from '../services/productService';
import { Product, Order } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#3b82f6'];

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  // Fix: useLanguage and useT return values directly in AppContext.tsx
  const language = useLanguage();
  const t = useT();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        statisticsService.getOrders().catch(() => []),
        productService.getAll().catch(() => [])
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err: any) {
      showNotification(t('error_loading'), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const soldOrders = useMemo(() => orders.filter(o => o.status === 'SOLD'), [orders]);

  const revenueByCurrency = useMemo(() => {
    return soldOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const currency = product.currency || 'UZS';
          acc[currency] = (acc[currency] || 0) + (item.quantity * product.price);
        }
      });
      return acc;
    }, {} as Record<string, number>);
  }, [soldOrders, products]);

  const productPerformance = useMemo(() => {
    return products.map(product => {
      const totalSold = soldOrders.reduce((acc, order) => {
        const item = order.items.find(i => i.productId === product.id);
        return acc + (item ? item.quantity : 0);
      }, 0);
      
      const name = language === 'RU' ? product.nameRu :
                   language === 'EN' ? product.nameEn :
                   language === 'TR' ? product.nameTr : product.nameUz;

      return {
        id: product.id,
        name: name || product.nameUz,
        count: totalSold,
        revenue: totalSold * product.price,
        currency: product.currency,
        img: product.imgUrl
      };
    }).filter(p => p.count > 0).sort((a, b) => b.revenue - a.revenue);
  }, [soldOrders, products, language]);

  const chartData = useMemo(() => {
    const total = productPerformance.reduce((acc, p) => acc + p.count, 0);
    return productPerformance.map(p => ({
      name: p.name,
      percentage: total > 0 ? Number(((p.count / total) * 100).toFixed(1)) : 0,
      count: p.count,
      revenue: p.revenue,
      currency: p.currency
    }));
  }, [productPerformance]);

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-12 animate-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{t('nav_home')}</h1>
        </div>
        <button onClick={fetchData} className="px-8 py-4 glass rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">{t('refresh')} ⚡</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 border-none">
          <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-6 opacity-70">{t('revenue')}</p>
          <div className="space-y-4">
            {Object.entries(revenueByCurrency).map(([curr, val]) => (
              <div key={curr} className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black text-white tracking-tight">{val.toLocaleString()}</h3>
                <span className="text-xs font-black text-white/50 uppercase">{curr}</span>
              </div>
            ))}
          </div>
        </div>

        {[
          { label: t('status_sold'), value: soldOrders.length, color: 'text-emerald-500', icon: '✅' },
          { label: t('status_progress'), value: orders.filter(o => o.status === 'IN_PROGRESS').length, color: 'text-amber-500', icon: '⏳' },
          { label: t('status_canceled'), value: orders.filter(o => o.status === 'CANCELED').length, color: 'text-red-500', icon: '❌' },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-8 rounded-[3rem] shadow-xl transition-all">
            <div className="text-2xl mb-4">{stat.icon}</div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className={`text-4xl font-black ${stat.color} tracking-tight`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass p-8 sm:p-12 rounded-[4rem] shadow-2xl">
           <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8">{t('nav_products')}</h3>
           <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={100} tick={{fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                             <div className="glass p-6 rounded-3xl shadow-2xl border-white/20 dark:bg-slate-900 min-w-[200px] animate-in">
                                <p className="text-[11px] font-black text-indigo-500 uppercase mb-3">{data.name}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{data.count} <span className="text-[10px] text-slate-400">units</span></p>
                                <p className="text-[10px] font-black text-emerald-500 uppercase">{data.revenue.toLocaleString()} {data.currency}</p>
                             </div>
                          );
                       }
                       return null;
                  }} />
                  <Bar dataKey="percentage" radius={[15, 15, 0, 0]} barSize={50}>
                     {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-1 glass p-8 sm:p-10 rounded-[4rem] shadow-2xl flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic">{t('leaderboard')}</h3>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[600px] scrollbar-hide pr-2">
              {productPerformance.map((p) => (
                <div key={p.id} className="flex items-center justify-between group p-4 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md">
                      {p.img ? <img src={p.img} className="w-full h-full object-cover" /> : <span className="text-2xl m-auto">📦</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase truncate">{p.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.count} SOLD</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{p.revenue.toLocaleString()}</p>
                    <p className="text-[8px] font-black text-indigo-500 uppercase mt-0.5">{p.currency}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
