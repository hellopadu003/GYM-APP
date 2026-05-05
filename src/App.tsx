/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Registration } from './pages/Registration';
import { Attendance } from './pages/Attendance';
import { Reminders } from './pages/Reminders';
import { Finance } from './pages/Finance';

function MainApp() {
  const { currentUser, login } = useAppContext();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="card p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-indigo-600">G</span>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 mb-2">
            GYM Management
          </h1>
          <p className="text-slate-500 mb-8">Sign in to continue</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => login('owner')}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
            >
              Login as Owner
            </button>
            <button 
              onClick={() => login('staff')}
              className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Login as Staff
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <Members />;
      case 'registration': return <Registration />;
      case 'attendance': return <Attendance />;
      case 'reminders': return <Reminders />;
      case 'finance': return <Finance />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

