import React from 'react';
import { X, Calendar, Clock, DollarSign, Target, Shield, BookOpen, Brain, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const TradeModal = ({ trade, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  if (!isOpen || !trade) return null;

  const isWin = trade.netPnl > 0;
  const isLoss = trade.netPnl < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1726] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-[#1e293b] text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a2333] sticky top-0 bg-[#0f1726]/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider ${
              trade.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {trade.direction}
            </span>
            <div>
              <h2 className="text-xl font-black text-white">{trade.instrumentName} ({trade.symbol})</h2>
              <p className="text-xs text-slate-400 font-mono">
                {trade.exchange || 'NSE'} • {trade.segment || 'Equity'} • Trade #{trade.id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/edit-trade/${trade.id}`);
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#080c14] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Big PnL Banner */}
          <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 font-mono ${
            trade.status === 'OPEN'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : isWin
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isLoss
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-300'
          }`}>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                {trade.status === 'OPEN' ? 'STATUS: OPEN TRADE' : 'NET REALIZED P/L'}
              </p>
              <p className="text-3xl font-black tracking-tight mt-1">
                {trade.status === 'OPEN' ? 'HOLDING POSITION' : formatCurrency(trade.netPnl)}
              </p>
            </div>
            {trade.status === 'CLOSED' && (
              <div className="flex gap-4 text-xs font-medium">
                <div>
                  <span className="opacity-70 block text-[10px]">Gross P/L:</span>
                  <span className="font-bold text-sm text-slate-200">{formatCurrency(trade.grossPnl)}</span>
                </div>
                <div>
                  <span className="opacity-70 block text-[10px]">Total Fees:</span>
                  <span className="font-bold text-sm text-slate-400">
                    {formatCurrency(Number(trade.brokerage || 0) + Number(trade.otherCharges || 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Execution Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080c14] p-4 rounded-2xl border border-[#1e293b] font-mono">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Trade Date</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{trade.tradeDate}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Entry → Exit</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">
                {trade.entryTime || '--:--'} → {trade.exitTime || '--:--'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Entry Price</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{formatCurrency(trade.entryPrice)}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Exit Price</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">
                {trade.exitPrice ? formatCurrency(trade.exitPrice) : 'Open'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Quantity</span>
              <p className="text-sm font-bold text-white mt-0.5">{trade.quantity}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Target</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                {trade.targetPrice ? formatCurrency(trade.targetPrice) : '-'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Stop Loss</span>
              <p className="text-sm font-bold text-rose-400 mt-0.5">
                {trade.stopLoss ? formatCurrency(trade.stopLoss) : '-'}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Risk : Reward</span>
              <p className="text-sm font-bold text-blue-400 mt-0.5">
                {trade.riskRewardRatio ? `1 : ${trade.riskRewardRatio}` : '-'}
              </p>
            </div>
          </div>

          {/* Strategy & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1e293b]">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1.5 font-mono">
                <Target className="w-4 h-4 text-emerald-400" />
                Trading Strategy
              </span>
              <p className="text-sm font-bold text-white">{trade.strategy || 'None specified'}</p>
              {trade.marketConditions && (
                <p className="text-xs text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">Market conditions:</span> {trade.marketConditions}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1e293b]">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1.5 font-mono">
                <Brain className="w-4 h-4 text-purple-400" />
                Emotional State
              </span>
              <p className="text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Before:</span> {trade.emotionalStateBefore || 'Neutral'}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                <span className="font-semibold text-slate-400">After:</span> {trade.emotionalStateAfter || 'Neutral'}
              </p>
            </div>
          </div>

          {/* Mistakes & Lessons Learned */}
          {(trade.mistakes || trade.lessonsLearned) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trade.mistakes && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-400 uppercase font-mono">Mistakes Identified:</span>
                  <p className="text-xs text-rose-200 mt-1.5 leading-relaxed whitespace-pre-wrap">{trade.mistakes}</p>
                </div>
              )}
              {trade.lessonsLearned && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono">Lessons Learned:</span>
                  <p className="text-xs text-emerald-200 mt-1.5 leading-relaxed whitespace-pre-wrap">{trade.lessonsLearned}</p>
                </div>
              )}
            </div>
          )}

          {/* Personal Notes */}
          {trade.notes && (
            <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1e293b]">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-1 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Personal Trade Notes
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
