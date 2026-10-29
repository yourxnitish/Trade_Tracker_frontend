import React, { useState, useEffect } from 'react';
import { Menu, Plus, Wallet, Calendar as CalendarIcon, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { dashboardApi } from '../services/api';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();
  const [currentBalance, setCurrentBalance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await dashboardApi.getSummary({ period: 'ALL' });
      if (res.data && res.data.currentBalance !== undefined) {
        setCurrentBalance(res.data.currentBalance);
      }
    } catch (err) {
      console.warn('Could not fetch quick balance', err);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#080c14]/90 backdrop-blur-md border-b border-[#1a2333]">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight sm:text-base flex items-center gap-2">
            <span>TradeTrack Terminal</span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● PRO
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Real-time Trading Journal & Performance Analytics</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Date and time display */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono font-medium text-slate-400 bg-[#0f1726] px-3 py-1.5 rounded-xl border border-[#1e293b]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            {formattedDate}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            {formattedTime}
          </span>
        </div>

        {/* Current Balance Chip */}
        {currentBalance !== null && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold shadow-sm shadow-emerald-500/10">
            <Wallet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="hidden sm:inline text-emerald-500/80 font-normal">Balance:</span>
            <span className="font-bold font-mono">{formatCurrency(currentBalance)}</span>
          </div>
        )}

        {/* Add Trade Quick Button (Vivid Green) */}
        <button
          onClick={() => navigate('/add-trade')}
          className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-1 stroke-[3]" />
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
