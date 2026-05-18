import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Database, ShieldAlert, Sparkles, Calendar } from 'lucide-react';
import api from '../services/api';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState({ demoMode: true });
  const location = useLocation();

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setDbStatus(res.data);
      } catch (err) {
        console.warn('Unable to get health status.');
      }
    };
    fetchHealth();
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/analytics': return 'Data Analytics';
      case '/kpis': return 'KPI Metrics Monitor';
      case '/import': return 'Import Datasets';
      case '/reports': return 'Exportable Reports';
      default: return 'Business Intelligence';
    }
  };

  const getFormattedDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(new Date());
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex">
      {/* Ambient backgrounds for modern glass effect */}
      <div className="ambient-glow top-[10%] left-[10%]" />
      <div className="ambient-glow-2 bottom-[10%] right-[10%]" />

      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Pane */}
      <div 
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Header Bar */}
        <header className="h-20 px-8 border-b border-dark-border bg-dark-bg/40 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Database status pill */}
            {dbStatus.demoMode ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-warning/10 border border-brand-warning/20 text-brand-warning text-xs font-semibold shadow-rose-glow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Mode</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold shadow-emerald-glow">
                <Database className="w-3.5 h-3.5" />
                <span>Live PostgreSQL</span>
              </div>
            )}

            {/* Header Date */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-primary" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </header>

        {/* Content viewport */}
        <main className="flex-1 p-8 overflow-y-auto animate-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
