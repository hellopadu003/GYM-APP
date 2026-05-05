import React, { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../store';
import { t } from '../lib/i18n';
import { format } from 'date-fns';

export function Attendance() {
  const { language, members, attendance, markAttendance } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredMembers = members.filter(m => 
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="card p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">ID</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Member Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-center">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {filteredMembers.map(m => {
              const record = attendance.find(a => a.memberId === m.id && a.date === date);
              return (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">{m.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{m.fullName}</td>
                  <td className="px-6 py-4 text-center">
                    {record ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status === 'present' ? t.present[language] : t.absent[language]}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <button
                        onClick={() => markAttendance(m.id, 'present', date)}
                        className={`p-2 rounded-lg transition-colors ${record?.status === 'present' ? 'bg-green-100 text-green-700' : 'text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                        title="Mark Present"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => markAttendance(m.id, 'absent', date)}
                        className={`p-2 rounded-lg transition-colors ${record?.status === 'absent' ? 'bg-red-100 text-red-700' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                        title="Mark Absent"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
             {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No members found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
