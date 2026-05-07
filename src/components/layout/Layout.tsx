import React, { useState } from 'react';
import { LayoutDashboard, Users, UserPlus, CalendarCheck, Bell, DollarSign, Menu, X, LogOut, Globe } from 'lucide-react';
import { useAppContext } from '../../store';
import { t } from '../../lib/i18n';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { language, setLanguage, logout, currentUser } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard[language] },
    { id: 'members', icon: Users, label: t.members[language] },
    { id: 'registration', icon: UserPlus, label: t.registration[language] },
    { id: 'attendance', icon: CalendarCheck, label: t.attendance[language] },
    { id: 'reminders', icon: Bell, label: t.reminders[language] },
    ...(currentUser?.role === 'owner' ? [{ id: 'finance', icon: DollarSign, label: t.finance[language] }] : []),
  ];

  return (
    <div className="min-h-screen flex font-sans text-slate-800 overflow-hidden bg-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed z-30 inset-y-0 left-0 w-60 transform bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold">GM</div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-white">GYM SOLUTION</h1>
              <p className="text-[10px] opacity-60">জিম ম্যানেজমেন্ট</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${active 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
                {item.id === 'reminders' && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 rounded-full">!</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mb-4">
            <p className="text-[10px] mb-2 text-slate-400">Language / ভাষা</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 text-[10px] px-2 py-1 rounded border ${language === 'en' ? 'bg-slate-700 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('bn')}
                className={`flex-1 text-[10px] px-2 py-1 rounded border ${language === 'bn' ? 'bg-slate-700 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
              >
                বাংলা
              </button>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t.logout[language]}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 capitalize sm:block hidden">
              {navItems.find(i => i.id === currentPage)?.label}
            </h2>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-300"></div>
            <span className="hidden sm:block text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block relative">
               <input type="text" placeholder="Search..." className="bg-slate-100 border-none rounded-full px-4 py-1 text-xs w-48 focus:ring-1 focus:outline-none ring-indigo-400" />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-none">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-1 capitalize">{currentUser?.role} Access</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                {currentUser?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
