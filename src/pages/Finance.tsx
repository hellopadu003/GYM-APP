import React, { useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, Download } from 'lucide-react';
import { useAppContext } from '../store';
import { t } from '../lib/i18n';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export function Finance() {
  const { language, payments, expenses, addExpense } = useAppContext();
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [expenseData, setExpenseData] = useState({
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const currentMonthPayments = payments.filter(p => {
    const d = parseISO(p.date);
    return d >= start && d <= end;
  });

  const currentMonthExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    return d >= start && d <= end;
  });

  const totalIncome = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      amount: Number(expenseData.amount),
      category: expenseData.category,
      description: expenseData.description,
      date: expenseData.date
    });
    setShowAddExpense(false);
    setExpenseData({
      amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const exportFinanceCSV = () => {
    const headers = ['Type', 'Date', 'Amount', 'Category/MemberID', 'Description/Method'];
    const incomeRows = currentMonthPayments.map(p => [
      'Income', p.date, p.amount, p.memberId, p.method
    ]);
    const expenseRows = currentMonthExpenses.map(e => [
      'Expense', e.date, e.amount, e.category, e.description || ''
    ]);
    
    const csvContent = [headers, ...incomeRows, ...expenseRows]
      .map(row => row.join(','))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-end">
        <button 
          onClick={exportFinanceCSV}
          className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="text-sm font-bold">Export Report (CSV)</span>
        </button>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between">
            <h3 className="data-label">Income (This Month)</h3>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="data-value text-3xl font-semibold mt-2 text-slate-900">৳{totalIncome.toLocaleString()}</p>
        </div>
        
        <div className="card p-6 border-t-4 border-red-500">
          <div className="flex items-center justify-between">
            <h3 className="data-label">Expenses (This Month)</h3>
            <ArrowDownRight className="w-5 h-5 text-red-500" />
          </div>
          <p className="data-value text-3xl font-semibold mt-2 text-slate-900">৳{totalExpense.toLocaleString()}</p>
        </div>

        <div className="card p-6 border-t-4 border-indigo-600 bg-indigo-50/50">
          <div className="flex items-center justify-between">
            <h3 className="data-label text-indigo-800">Profit Overview</h3>
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="data-value text-3xl font-semibold mt-2 text-indigo-900">৳{profit.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Income */}
        <div className="card flex flex-col h-[500px]">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-800">Recent Income</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {currentMonthPayments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No income recorded this month.</p>
            ) : (
              <div className="space-y-4">
                {currentMonthPayments.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">Member: {p.memberId}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(p.date), 'dd MMM yyyy')} • {p.method}</p>
                    </div>
                    <p className="font-bold text-green-600 font-mono">+ ৳{p.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="card flex flex-col h-[500px]">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-800">Recent Expenses</h3>
            <button 
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="flex items-center text-[10px] uppercase tracking-wider font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Expense
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/30">
            {showAddExpense && (
              <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Amount</label>
                    <input autoFocus required type="number" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Date</label>
                    <input required type="date" value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Category (e.g. Rent, Salary)</label>
                    <input required type="text" value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Description (Optional)</label>
                    <input type="text" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-indigo-600 focus:border-indigo-600 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddExpense(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800">Save</button>
                </div>
              </form>
            )}

            {currentMonthExpenses.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No expenses recorded this month.</p>
            ) : (
              <div className="space-y-4">
                {currentMonthExpenses.map(e => (
                  <div key={e.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <div>
                      <p className="font-medium text-slate-900">{e.category}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(e.date), 'dd MMM yyyy')} {e.description && `• ${e.description}`}</p>
                    </div>
                    <p className="font-bold text-red-600 font-mono">- ৳{e.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
