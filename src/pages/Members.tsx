import React, { useState } from 'react';
import { Search, Edit, Trash2, User, Phone, Calendar, X, Download, Eye, DollarSign, Activity } from 'lucide-react';
import { useAppContext, Member } from '../store';
import { t } from '../lib/i18n';

export function Members() {
  const { members, updateMember, deleteMember, language, currentUser, payments, attendance } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  const filtered = members.filter(m => {
    const searchMatch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || m.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingMember) {
      updateMember(editingMember.id, editingMember);
      setEditingMember(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Address', 'Status', 'Plan Type', 'Expiry Date'];
    const csvData = filtered.map(m => [
      m.id, m.fullName, m.phone, m.address, m.status, m.planType, m.expiryDate
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'members.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.search[language]}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto overflow-hidden">
          <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
            {['all', 'active', 'expired', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  filterStatus === status 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm font-bold">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Member</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] hidden md:table-cell">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Status / Expiry</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0 overflow-hidden">
                        {m.photoUrl ? (
                          <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{m.fullName}</p>
                        <p className="text-xs text-slate-500 font-mono">{m.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-600">
                    <div className="flex items-center mb-1">
                      <Phone className="w-4 h-4 mr-2" />
                      {m.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider mb-1 ${
                        m.status === 'active' ? 'bg-green-100 text-green-700' : 
                        m.status === 'expired' ? 'bg-red-100 text-red-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center font-mono">
                        <Calendar className="w-3 h-3 mr-1" />
                        {m.expiryDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setViewingMember(m)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingMember(m)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {currentUser?.role === 'owner' && (
                      <button 
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors" 
                        title="Delete"
                        onClick={() => confirm('Are you sure you want to delete this member?') && deleteMember(m.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {viewingMember.photoUrl ? (
                    <img src={viewingMember.photoUrl} alt={viewingMember.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{viewingMember.fullName}</h2>
                  <p className="text-sm text-slate-500 font-mono flex items-center gap-2">
                    {viewingMember.id}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      viewingMember.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 
                      viewingMember.status === 'expired' ? 'bg-red-100 text-red-700' : 
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {viewingMember.status}
                    </span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="data-label text-slate-500 mb-1">Phone</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {viewingMember.phone}
                    {viewingMember.isWhatsApp && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-2 uppercase font-bold">WA</span>}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="data-label text-slate-500 mb-1">Join Date</p>
                  <p className="font-semibold text-slate-800 text-sm">{viewingMember.joinDate}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="data-label text-slate-500 mb-1">Age & Gender</p>
                  <p className="font-semibold text-slate-800 text-sm">{viewingMember.age}y, {viewingMember.gender}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="data-label text-slate-500 mb-1">Blood Group</p>
                  <p className="font-semibold text-red-600 text-sm">{viewingMember.bloodGroup || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="data-label text-slate-500 mb-1">Address</p>
                  <p className="font-semibold text-slate-800 text-sm">{viewingMember.address || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="data-label text-slate-500 mb-1">Plan & Expiry</p>
                  <p className="font-semibold text-slate-800 text-sm capitalize">{viewingMember.planType} • <span className="font-normal text-slate-600 text-xs">Expires {viewingMember.expiryDate}</span></p>
                </div>
              </div>

              {/* History Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payments Log */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-800">Payment History</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-4 py-3 data-label text-slate-400">Date</th>
                          <th className="px-4 py-3 data-label text-slate-400">Type</th>
                          <th className="px-4 py-3 data-label text-slate-400 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.filter(p => p.memberId === viewingMember.id).map(payment => (
                          <tr key={payment.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs">{payment.date}</td>
                            <td className="px-4 py-3 capitalize text-xs text-slate-600">
                              {payment.type.replace('_', ' ')}
                              <span className="block text-[10px] text-slate-400 mt-1">{payment.method}</span>
                            </td>
                            <td className="px-4 py-3 data-value text-right font-medium">৳{payment.amount}</td>
                          </tr>
                        ))}
                        {payments.filter(p => p.memberId === viewingMember.id).length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-4 text-center text-slate-500 text-sm">No payment records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800">Recent Attendance</h3>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-4 py-3 data-label text-slate-400">Date</th>
                          <th className="px-4 py-3 data-label text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendance.filter(a => a.memberId === viewingMember.id).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10).map(record => (
                          <tr key={record.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-xs">{record.date}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {attendance.filter(a => a.memberId === viewingMember.id).length === 0 && (
                          <tr><td colSpan={2} className="px-4 py-4 text-center text-slate-500 text-sm">No recent attendance.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-slate-900">Edit Member ({editingMember.id})</h2>
              <button 
                onClick={() => setEditingMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    value={editingMember.fullName} 
                    onChange={e => setEditingMember({...editingMember, fullName: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input 
                    required 
                    type="tel" 
                    value={editingMember.phone} 
                    onChange={e => setEditingMember({...editingMember, phone: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input 
                    type="text" 
                    value={editingMember.address} 
                    onChange={e => setEditingMember({...editingMember, address: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Plan Type</label>
                  <select 
                    value={editingMember.planType} 
                    onChange={e => setEditingMember({...editingMember, planType: e.target.value as any})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select 
                    value={editingMember.status} 
                    onChange={e => setEditingMember({...editingMember, status: e.target.value as any})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                  <input 
                    required 
                    type="date" 
                    value={editingMember.expiryDate} 
                    onChange={e => setEditingMember({...editingMember, expiryDate: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setEditingMember(null)}
                  className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
