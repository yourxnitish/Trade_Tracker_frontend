import React, { useState, useEffect } from 'react';
import { Menu, Plus, Wallet, Calendar as CalendarIcon, Clock } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight sm:text-base">
            TradeTrack Journal
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">Record, review, and elevate your trading discipline</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Date and time display */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formattedTime}
          </span>
        </div>

        {/* Current Balance Chip */}
        {currentBalance !== null && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50/80 border border-blue-200/70 rounded-xl text-blue-900 text-xs font-semibold">
            <Wallet className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="hidden sm:inline text-blue-700/80 font-normal">Balance:</span>
            <span className="font-bold">{formatCurrency(currentBalance)}</span>
          </div>
        )}

        {/* Add Trade Quick Button */}
        <button
          onClick={() => navigate('/add-trade')}
          className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
