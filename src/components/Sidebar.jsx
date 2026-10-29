import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BookOpen,
  Eye,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { settings } = useSettings();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Trade', path: '/add-trade', icon: PlusCircle },
    { name: 'Trade History', path: '/trades', icon: History },
    { name: 'Daily Journal', path: '/daily-journal', icon: BookOpen },
    { name: 'Watchlist', path: '/watchlist', icon: Eye },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notes & Observations', path: '/notes', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b101b] border-r border-[#1a2333] transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Logo / Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#1a2333]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-black font-extrabold shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-200">
                <span className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1">
                  Trade<span className="text-emerald-400">Track</span>
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Terminal Journal</p>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse toggle on desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all group relative
                  ${isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User / Live Session Indicator */}
        <div className="p-3 border-t border-[#1a2333]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-xl bg-[#0f1726] border border-[#1e293b]`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              {settings.traderName ? settings.traderName.charAt(0).toUpperCase() : 'T'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{settings.traderName || 'Trader'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] text-emerald-400 font-medium">Terminal Connected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
