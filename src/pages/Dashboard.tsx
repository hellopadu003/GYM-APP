import React from 'react';
import { Users, UserPlus, FileWarning, DollarSign } from 'lucide-react';
import { useAppContext } from '../store';
import { t } from '../lib/i18n';
import { isToday, format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function Dashboard() {
  const { members, attendance, payments, expenses, language, currentUser } = useAppContext();

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const todayAttnd = attendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd') && a.status === 'present').length;

  // Monthly Revenue Calculation
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());
  const monthlyRevenue = payments
    .filter(p => {
      const d = parseISO(p.date);
      return d >= start && d <= end;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonthExpenses = expenses
    .filter(e => {
        const d = parseISO(e.date);
        return d >= start && d <= end;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const profit = monthlyRevenue - currentMonthExpenses;

  // Growth mock data
  const growthData = [
    { name: 'Jan', members: activeMembers > 20 ? activeMembers - 10 : 5 },
    { name: 'Feb', members: activeMembers > 10 ? activeMembers - 5 : 8 },
    { name: 'Mar', members: activeMembers },
  ];

  return (
    <div className="grid grid-cols-12 gap-5 h-full">
      {/* KPI Stats Bar (Span 12) */}
      <section className="col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <p className="data-label">{t.totalMembers[language]}</p>
          <p className="data-value text-2xl font-semibold mt-2">{totalMembers}</p>
        </div>
        <div className="card p-4">
          <p className="data-label">{t.activeMembers[language]}</p>
          <p className="data-value text-2xl font-semibold text-indigo-600 mt-2">{activeMembers}</p>
        </div>
        <div className="card p-4">
          <p className="data-label">{t.todayAttendance[language]}</p>
          <p className="data-value text-2xl font-semibold mt-2">{todayAttnd}</p>
        </div>
        
        <div className="card p-4">
          <p className="data-label">{t.expiredMembers[language]}</p>
          <p className="data-value text-2xl font-semibold text-red-500 mt-2">{expiredMembers}</p>
        </div>

        {currentUser?.role === 'owner' && (
          <>
            <div className="card p-4">
              <p className="data-label">{t.monthlyRevenue[language]}</p>
              <p className="data-value text-2xl font-semibold mt-2">৳{monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="card p-4 bg-slate-900 border-slate-900 text-white">
              <p className="data-label text-slate-400">Net Profit</p>
              <p className="data-value text-2xl font-semibold text-white mt-2">৳{profit.toLocaleString()}</p>
            </div>
          </>
        )}
      </section>

      {/* Main Visual Section (Span 8) */}
      <section className="col-span-12 lg:col-span-8 flex flex-col gap-5">
        <div className="card p-5 flex-1">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-800">Member Growth</h3>
          </div>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Area type="monotone" dataKey="members" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorMembers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member List Table Card */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-800">Recent Registrations</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">ID</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Member Name</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Plan</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.slice(-3).reverse().map(m => (
                 <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400">{m.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{m.fullName} <span className="text-[10px] text-slate-400 block mt-0.5">{m.phone}</span></td>
                  <td className="py-3 px-4 text-slate-500 capitalize">{m.planType}</td>
                  <td className="py-3 px-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-semibold tracking-wide uppercase ${
                        m.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 
                        m.status === 'expired' ? 'bg-red-50 text-red-600' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {m.status}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Sidebar Panel (Span 4) */}
      <section className="col-span-12 lg:col-span-4 flex flex-col gap-5">
        <div className="card bg-slate-900 border-slate-900 p-5 text-white shadow-xl shadow-slate-900/10">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-200 mb-4">Quick Attendance</h3>
          <div className="flex gap-2">
            <input type="text" placeholder="Enter Member ID..." className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 transition-colors font-mono" />
            <button className="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-lg font-bold text-xs tracking-wider transition-colors">MARK</button>
          </div>
        </div>

        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Alerts & Tips
            </h3>
          </div>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
             {expiredMembers > 0 && (
              <div className="border-l-2 border-red-500 pl-3 py-1">
                <p className="text-xs font-semibold tracking-wide text-red-600 uppercase">Expire Alert</p>
                <p className="text-xs text-slate-600 mt-1">{expiredMembers} members expired.</p>
              </div>
            )}
            {activeMembers === 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                 <p className="text-xs font-medium text-slate-500">No active members yet.</p>
              </div>
            )}
             <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-3 mt-auto">
              <p className="data-label mb-1.5 text-indigo-800/60">Tip of the day</p>
              <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">Auto-reminder saves up to 15 hours of manual follow-ups per month!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
