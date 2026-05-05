import React from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { useAppContext } from '../store';
import { format, differenceInDays } from 'date-fns';

export function Reminders() {
  const { members } = useAppContext();

  // Find members who are expiring soon (e.g. <= 3 days) or already expired
  const alertingMembers = members.filter(m => {
    const daysLeft = differenceInDays(new Date(m.expiryDate), new Date());
    return daysLeft <= 3 && m.status !== 'inactive';
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const generateMessage = (m: any, daysLeft: number) => {
    if (daysLeft < 0) {
      return `Dear ${m.fullName},\nYour GYM subscription has expired on ${format(new Date(m.expiryDate), 'dd MMM yyyy')}. Please renew your subscription to continue your fitness journey. Thank you!`;
    } else if (daysLeft === 0) {
      return `Dear ${m.fullName},\nYour GYM subscription expires TODAY. Please renew to avoid interruption. Thank you!`;
    } else {
      return `Dear ${m.fullName},\nYour GYM subscription will expire in ${daysLeft} day(s) on ${format(new Date(m.expiryDate), 'dd MMM yyyy')}. Kindly renew your subscription. Thank you!`;
    }
  };

  const generateBanglaMessage = (m: any, daysLeft: number) => {
    if (daysLeft < 0) {
        return `প্রিয় ${m.fullName},\nআপনার জিম সাবস্ক্রিপশনের মেয়াদ ${format(new Date(m.expiryDate), 'dd MMM yyyy')} তারিখে শেষ হয়েছে। অনুগ্রহ করে রিনিউ করুন। ধন্যবাদ!`;
      } else if (daysLeft === 0) {
        return `প্রিয় ${m.fullName},\nআপনার জিম সাবস্ক্রিপশনের মেয়াদ আজ শেষ হচ্ছে। অনুগ্রহ করে রিনিউ করুন। ধন্যবাদ!`;
      } else {
        return `প্রিয় ${m.fullName},\nআপনার জিম সাবস্ক্রিপশনের মেয়াদ আর ${daysLeft} দিন পর (${format(new Date(m.expiryDate), 'dd MMM yyyy')}) শেষ হবে। অনুগ্রহ করে রিনিউ করুন। ধন্যবাদ!`;
      }
  };

  const handleCopy = (msg: string) => {
    navigator.clipboard.writeText(msg);
    alert('Message copied to clipboard! You can now paste it in WhatsApp.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center text-slate-800 mb-6">
        <Bell className="w-6 h-6 mr-2 text-indigo-600" />
        <h2 className="text-xl font-semibold">Subscription Reminders</h2>
      </div>

      <div className="space-y-4">
        {alertingMembers.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            No pending reminders. Everyone is up to date!
          </div>
        ) : (
          alertingMembers.map(m => {
            const daysLeft = differenceInDays(new Date(m.expiryDate), new Date());
            const isExpired = daysLeft < 0;
            const msgEn = generateMessage(m, daysLeft);
            const msgBn = generateBanglaMessage(m, daysLeft);

            return (
              <div key={m.id} className="card p-6 border-l-4" style={{ borderLeftColor: isExpired ? '#ef4444' : 'indigo-500' }}>
                <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{m.fullName}</h3>
                    <p className="text-sm text-slate-500 font-mono">{m.id} • {m.phone}</p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${isExpired ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-indigo-600'}`}>
                      {isExpired ? 'Expired' : `Expires in ${daysLeft} days`}
                    </span>
                    <p className="text-sm text-slate-500 mt-1">Due: {format(new Date(m.expiryDate), 'dd MMM, yyyy')}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{msgEn}</p>
                    <button 
                      onClick={() => handleCopy(msgEn)}
                      className="mt-3 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Copy English
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-[Hind_Siliguri]">{msgBn}</p>
                    <button 
                      onClick={() => handleCopy(msgBn)}
                      className="mt-3 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Copy Bangla
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
