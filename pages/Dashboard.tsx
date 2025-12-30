
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
         <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tizim holati</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Real vaqtdagi ko'rsatkichlar</p>
         </div>
         <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Brending:</span>
            {logo?.imgUrl ? (
              <img src={logo.imgUrl} alt="Logo" className="h-5 w-auto object-contain" />
            ) : (
              <span className="text-[10px] font-black text-indigo-600 uppercase">SiMoSh</span>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Jami adminlar', value: '24', trend: '+4', icon: '👑', color: 'from-indigo-500 to-indigo-600' },
          { label: 'Tashriflar', value: '1.2M', trend: '+18%', icon: '🚀', color: 'from-purple-500 to-purple-600' },
          { label: 'Faol havolalar', value: '1,042', trend: '+5%', icon: '⚡', color: 'from-cyan-500 to-cyan-600' },
          { label: 'Tizim tozaligi', value: '99.9%', trend: 'Maks', icon: '💎', color: 'from-emerald-500 to-emerald-600' },
        ].map((stat, idx) => (
          <div key={idx} className="glass group hover:scale-[1.03] transition-all p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.05] rounded-bl-full`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl sm:text-2xl shadow-lg glow-primary group-hover:rotate-12 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest border border-emerald-500/20">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-white/50 dark:border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl uppercase tracking-tighter">O'sish grafigi</h3>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest">Tarmoq tahlili</p>
            </div>
            <div className="flex gap-2">
               <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
               <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
          </div>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="visits" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#glowGradient)" />
                <Area type="monotone" dataKey="users" stroke="#a855f7" strokeWidth={4} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl flex flex-col">
          <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl uppercase tracking-tighter mb-8">Sinxronizatsiya</h3>
          <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass px-3 py-1.5 rounded-xl shadow-lg border-indigo-500/20">
                        <p className="text-[10px] font-black text-indigo-600">{`${payload[0].value}`}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="users" radius={[10, 10, 10, 10]} barSize={16}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
             <div className="flex justify-between items-center glass p-3 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Samaradorlik</span>
                <span className="text-xs font-black text-emerald-500">92%</span>
             </div>
             <div className="flex justify-between items-center glass p-3 rounded-2xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ish vaqti</span>
                <span className="text-xs font-black text-indigo-500">24/7</span>
             </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] sm:rounded-[3rem] shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
          <div>
             <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl uppercase tracking-tighter">Audit Terminali</h3>
             <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Xavfsizlik oqimi</p>
          </div>
          <button className="w-10 h-10 sm:w-12 sm:h-12 glass rounded-2xl flex items-center justify-center text-lg hover:rotate-180 transition-transform">🔄</button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { action: 'Admin tasdiqlandi', user: 'Zafar', ip: '192.168.1.1', status: 'OK', color: 'emerald' },
            { action: 'Sinxronlandi', user: 'Tizim', ip: 'ichki', status: 'TAYYOR', color: 'indigo' },
            { action: 'Hujum to\'sildi', user: 'Bot-X', ip: '45.12.33.2', status: 'BLOK', color: 'red' },
          ].map((log, i) => (
            <div key={i} className="px-6 sm:px-8 py-4 sm:py-5 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between">
              <div className="flex items-center min-w-0 mr-4">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-${log.color}-500 mr-4 sm:mr-6 flex-shrink-0`}></div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{log.action}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{log.user} &bull; {log.ip}</p>
                </div>
              </div>
              <span className={`flex-shrink-0 text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full bg-${log.color}-500/10 text-${log.color}-600 border border-${log.color}-500/20 uppercase tracking-[0.2em]`}>
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
