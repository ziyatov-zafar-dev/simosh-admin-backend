
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { useTheme } from '../App';
import { logoService } from '../services/logoService';
import { Logo } from '../types';

const data = [
  { name: 'Du', visits: 4000, users: 2400 },
  { name: 'Se', visits: 3000, users: 1398 },
  { name: 'Ch', visits: 6000, users: 9800 },
  { name: 'Pa', visits: 2780, users: 3908 },
  { name: 'Ju', visits: 1890, users: 4800 },
  { name: 'Sha', visits: 2390, users: 3800 },
  { name: 'Yak', visits: 7490, users: 4300 },
];

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [logo, setLogo] = useState<Logo | null>(null);

  useEffect(() => {
    logoService.get().then(setLogo).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
         <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tizim holati</h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mt-1">Real vaqtdagi ko'rsatkichlar</p>
         </div>
         <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brending:</span>
            {logo?.imgUrl ? (
              <img src={logo.imgUrl} alt="Logo Preview" className="h-6 w-auto object-contain" />
            ) : (
              <span className="text-xs font-bold text-indigo-600">Standart SiMoSh</span>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Jami adminlar', value: '24', trend: '+4', icon: '👑', color: 'from-indigo-500 to-indigo-600' },
          { label: 'Tashriflar', value: '1.2M', trend: '+18%', icon: '🚀', color: 'from-purple-500 to-purple-600' },
          { label: 'Faol havolalar', value: '1,042', trend: '+5%', icon: '⚡', color: 'from-cyan-500 to-cyan-600' },
          { label: 'Tizim tozaligi', value: '99.9%', trend: 'Maks', icon: '💎', color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, idx) => (
          <div key={idx} className="glass group hover:scale-[1.03] transition-all p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.05] rounded-bl-full`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg glow-primary group-hover:rotate-12 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest border border-emerald-500/20">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-[3rem] shadow-xl border border-white/50 dark:border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">O'sish grafigi</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest">Tarmoq o'tkazuvchanligi tahlili</p>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
               <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 800}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#glowGradient)" />
                <Area type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={5} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-[3rem] shadow-xl flex flex-col">
          <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter mb-8">Kanallar sinxronizatsiyasi</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass px-4 py-2 rounded-2xl shadow-lg border-indigo-500/20">
                        <p className="text-xs font-black text-indigo-600">{`${payload[0].value} ball`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="users" radius={[12, 12, 12, 12]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
             <div className="flex justify-between items-center glass p-3 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Samaradorlik</span>
                <span className="text-sm font-black text-emerald-500">92%</span>
             </div>
             <div className="flex justify-between items-center glass p-3 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ish vaqti</span>
                <span className="text-sm font-black text-indigo-500">24/7</span>
             </div>
          </div>
        </div>
      </div>

      {/* Terminal Audit Log */}
      <div className="glass rounded-[3rem] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
          <div>
             <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-tighter">Audit Terminali</h3>
             <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Xavfsizlik oqimi</p>
          </div>
          <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-lg hover:rotate-180 transition-transform">🔄</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { action: 'Admin tasdiqlandi', user: 'Zafar', ip: '192.168.1.1', status: 'Muvaffaqiyat', color: 'emerald' },
            { action: 'Ma\'lumotlar sinxronlandi', user: 'Tizim', ip: 'ichki', status: 'Tayyor', color: 'indigo' },
            { action: 'Hujum to\'sildi', user: 'Bot-X', ip: '45.12.33.2', status: 'Kritik', color: 'red' },
            { action: 'Yangi tugun faol', user: 'Admin-01', ip: '10.0.0.4', status: 'Onlayn', color: 'cyan' },
          ].map((log, i) => (
            <div key={i} className="px-8 py-5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full bg-${log.color}-500 mr-6 shadow-[0_0_10px_rgba(var(--tw-color-${log.color}-500),0.5)]`}></div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user} &bull; {log.ip}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full bg-${log.color}-500/10 text-${log.color}-600 border border-${log.color}-500/20 uppercase tracking-[0.2em]`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
