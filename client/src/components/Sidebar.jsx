import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Target, 
  UploadCloud, 
  FileSpreadsheet, 
  LogOut, 
  User,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'KPI Monitoring', path: '/kpis', icon: Target },
    { name: 'Data Import', path: '/import', icon: UploadCloud },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <div 
      className={`fixed top-0 left-0 h-screen glass-panel border-r border-dark-border z-30 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 h-20 border-b border-dark-border">
          <div className="bg-gradient-to-tr from-brand-primary to-brand-secondary p-2.5 rounded-xl shadow-glass-glow flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-fade">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">BI INSIGHT</span>
              <span className="text-[10px] font-semibold text-brand-primary tracking-wider uppercase">Analytics Engine</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 px-3 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/5 border border-brand-primary/30 text-white shadow-glass-glow' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {!collapsed && <span className="animate-fade">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Session Info / Logout */}
      <div className="p-4 border-t border-dark-border">
        {!collapsed ? (
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-3 animate-fade mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.fullName || 'Demo User'}</span>
                <span className="text-[10px] text-gray-400 truncate">{user?.email || 'demo@bidashboard.com'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-brand-primary/10 border border-brand-primary/25 flex items-center justify-center group relative cursor-pointer">
            <User className="w-4 h-4 text-brand-primary" />
            {/* Simple tooltip */}
            <span className="absolute left-14 bg-dark-bg border border-dark-border text-white text-xs py-1 px-2.5 rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {user?.fullName || 'Demo User'}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-brand-danger hover:bg-brand-danger/10 border border-transparent hover:border-brand-danger/25 transition-all duration-200 font-medium text-sm"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="animate-fade">Log Out</span>}
        </button>
      </div>
    </div>
  );
}
