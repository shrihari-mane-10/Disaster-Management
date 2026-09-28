import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  AlertTriangle,
  Package,
  Home,
  LogOut,
  Shield,
  Radio,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Live Operations Map', path: '/', icon: MapPin },
    { label: 'Incident Dispatch', path: '/incidents', icon: AlertTriangle },
    { label: 'Broadcast Alerts', path: '/alerts', icon: Radio },
    { label: 'Emergency Resources', path: '/resources', icon: Package },
    { label: 'Relief Shelters', path: '/shelters', icon: Home },
  ];


  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-lg tracking-tight text-white">ResQ Authority</h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Disaster Response & Coordination Center</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Status and Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-200">{user?.name || 'Authority Officer'}</span>
            <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">
              {user?.role} Access
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-red-950/80 hover:text-red-400 text-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-700 hover:border-red-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-900 text-slate-900 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
