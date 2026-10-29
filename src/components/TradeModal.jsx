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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              trade.direction === 'LONG' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {trade.direction}
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{trade.instrumentName} ({trade.symbol})</h2>
              <p className="text-xs text-slate-500 font-medium">
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
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Big PnL Banner */}
          <div className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            trade.status === 'OPEN'
              ? 'bg-amber-50/60 border-amber-200 text-amber-900'
              : isWin
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : isLoss
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider opacity-70">
                {trade.status === 'OPEN' ? 'Status: OPEN TRADE' : 'Net Realized Profit / Loss'}
              </p>
              <p className="text-3xl font-extrabold tracking-tight mt-1">
                {trade.status === 'OPEN' ? 'Holding Position' : formatCurrency(trade.netPnl)}
              </p>
            </div>
            {trade.status === 'CLOSED' && (
              <div className="flex gap-4 text-xs font-medium">
                <div>
                  <span className="opacity-70 block">Gross P/L:</span>
                  <span className="font-bold text-sm">{formatCurrency(trade.grossPnl)}</span>
                </div>
                <div>
                  <span className="opacity-70 block">Brokerage & Charges:</span>
                  <span className="font-bold text-sm text-slate-600">
                    {formatCurrency(Number(trade.brokerage || 0) + Number(trade.otherCharges || 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Execution Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Trade Date</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{trade.tradeDate}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Entry Time / Exit</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {trade.entryTime || '--:--'} → {trade.exitTime || '--:--'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Entry Price</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatCurrency(trade.entryPrice)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Exit Price</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {trade.exitPrice ? formatCurrency(trade.exitPrice) : 'Open'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Quantity</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{trade.quantity}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Target Price</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {trade.targetPrice ? formatCurrency(trade.targetPrice) : '-'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Stop Loss</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {trade.stopLoss ? formatCurrency(trade.stopLoss) : '-'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Risk : Reward</span>
              <p className="text-sm font-bold text-blue-600 mt-0.5">
                {trade.riskRewardRatio ? `1 : ${trade.riskRewardRatio}` : '-'}
              </p>
            </div>
          </div>

          {/* Strategy & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                Trading Strategy
              </span>
              <p className="text-sm font-medium text-slate-800">{trade.strategy || 'None specified'}</p>
              {trade.marketConditions && (
                <p className="text-xs text-slate-500 mt-2">
                  <span className="font-semibold text-slate-600">Market conditions:</span> {trade.marketConditions}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Brain className="w-4 h-4 text-purple-600" />
                Emotional State
              </span>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Before:</span> {trade.emotionalStateBefore || 'Neutral'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-semibold text-slate-700">After:</span> {trade.emotionalStateAfter || 'Neutral'}
              </p>
            </div>
          </div>

          {/* Entry & Exit Reasoning */}
          {(trade.entryReason || trade.exitReason) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Execution Rationale</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trade.entryReason && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Entry Reason:</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{trade.entryReason}</p>
                  </div>
                )}
                {trade.exitReason && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Exit Reason:</span>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{trade.exitReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mistakes & Lessons Learned */}
          {(trade.mistakes || trade.lessonsLearned) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Journal Learnings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trade.mistakes && (
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                    <span className="text-xs font-bold text-rose-800">Mistakes Identified:</span>
                    <p className="text-xs text-rose-950 mt-1 leading-relaxed whitespace-pre-wrap">{trade.mistakes}</p>
                  </div>
                )}
                {trade.lessonsLearned && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800">Lessons Learned:</span>
                    <p className="text-xs text-emerald-950 mt-1 leading-relaxed whitespace-pre-wrap">{trade.lessonsLearned}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {trade.notes && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                Personal Trade Notes
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
