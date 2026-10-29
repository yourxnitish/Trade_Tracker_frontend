import React from 'react';
import { TrendingUp, Printer } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const NotebookView = ({
  journalDate,
  dayOfWeek,
  startingBalance,
  closingBalance,
  closedPnl,
  totalBrokerage,
  trades = [],
  journalForm,
  onJournalFormChange,
  onSave,
  saving,
  watchlistItems = [],
}) => {
  const { formatCurrency } = useSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto my-4">
      {/* Top action bar */}
      <div className="w-full flex justify-between items-center mb-4 no-print px-2">
        <div className="text-sm font-semibold text-slate-300 flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Physical Notebook Replica Mode
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-dark-card border border-dark-border text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Print / Save PDF
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Journal Notes'}
          </button>
        </div>
      </div>

      {/* Notebook Page with Spiral */}
      <div className="relative w-full bg-white shadow-2xl rounded-2xl border border-slate-300 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        {/* Spiral Binder along the left margin */}
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-10 bg-slate-100/90 border-r border-slate-300 flex flex-col justify-around py-4 items-center z-10 print:hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400/80 shadow-inner"></div>
              <div className="w-4 h-1.5 bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400 rounded-sm shadow-sm -ml-1"></div>
            </div>
          ))}
        </div>

        {/* Notebook Content Container */}
        <div className="pl-10 sm:pl-14 pr-6 sm:pr-8 py-6 sm:py-8 space-y-4 font-sans text-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-800 uppercase font-sans">
                TRADING <span className="font-light text-slate-600">JOURNAL</span>
              </h1>
            </div>
            {/* Logo from notebook */}
            <div className="flex items-center space-x-1 text-emerald-600">
              <div className="relative flex items-center justify-center p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <span className="text-[10px] font-bold text-amber-500 absolute -bottom-1 -right-1">🪙</span>
              </div>
            </div>
          </div>

          {/* Top Metadata Grid */}
          <div className="border border-slate-800 rounded-sm overflow-hidden text-xs sm:text-sm">
            <div className="grid grid-cols-2 divide-x divide-slate-800">
              {/* Left Column */}
              <div className="divide-y divide-slate-800">
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Date:</span>
                  <span className="font-semibold text-slate-900">{journalDate}</span>
                </div>
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Day:</span>
                  <span className="font-semibold text-slate-900">{dayOfWeek}</span>
                </div>
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Starting A/C Balance:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(startingBalance)}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-slate-800">
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Closed P/L:</span>
                  <span className={`font-bold ${closedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(closedPnl)}
                  </span>
                </div>
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Total Brokerage:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(totalBrokerage)}</span>
                </div>
                <div className="p-2 sm:px-3 flex justify-between items-center bg-white">
                  <span className="font-bold text-slate-700">Closing A/C Balance:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(closingBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trades Table with Cyan Header */}
          <div className="border border-slate-800 rounded-sm overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#67c2d2] text-slate-900 font-bold border-b border-slate-800 divide-x divide-slate-800">
                  <th className="py-2 px-2.5 w-[22%]">Name:</th>
                  <th className="py-2 px-2 w-[13%]">Buy:</th>
                  <th className="py-2 px-2 w-[13%]">Sell:</th>
                  <th className="py-2 px-2 w-[11%]">Qty:</th>
                  <th className="py-2 px-2 w-[13%]">Target:</th>
                  <th className="py-2 px-2 w-[13%]">SL:</th>
                  <th className="py-2 px-2 w-[15%]">P/L:</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-white">
                {trades && trades.length > 0 ? (
                  trades.map((t, idx) => {
                    const isLong = t.direction === 'LONG';
                    const buyPrice = isLong ? t.entryPrice : t.exitPrice;
                    const sellPrice = isLong ? t.exitPrice : t.entryPrice;
                    return (
                      <tr key={t.id || idx} className="divide-x divide-slate-800 hover:bg-slate-50/80">
                        <td className="py-1.5 px-2.5 font-bold text-slate-900 truncate">
                          {t.instrumentName} <span className="text-[10px] text-slate-500 font-normal">({t.symbol})</span>
                        </td>
                        <td className="py-1.5 px-2 font-medium">{buyPrice ? formatCurrency(buyPrice) : '-'}</td>
                        <td className="py-1.5 px-2 font-medium">{sellPrice ? formatCurrency(sellPrice) : '-'}</td>
                        <td className="py-1.5 px-2 font-medium">{t.quantity}</td>
                        <td className="py-1.5 px-2 font-medium">{t.targetPrice ? formatCurrency(t.targetPrice) : '-'}</td>
                        <td className="py-1.5 px-2 font-medium">{t.stopLoss ? formatCurrency(t.stopLoss) : '-'}</td>
                        <td className={`py-1.5 px-2 font-bold ${
                          t.status === 'OPEN'
                            ? 'text-amber-600'
                            : (t.netPnl >= 0 ? 'text-emerald-700' : 'text-rose-700')
                        }`}>
                          {t.status === 'OPEN' ? 'OPEN' : formatCurrency(t.netPnl)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="divide-x divide-slate-800 h-8">
                      <td className="py-1.5 px-2 text-slate-300 italic text-xs">{i === 0 ? 'No trades recorded yet today' : ''}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Middle Section: After Trade Close (Left) & Watchlist (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* After Trade Close Box (Teal header) */}
            <div className="border border-slate-800 rounded-sm overflow-hidden flex flex-col bg-white">
              <div className="bg-[#a8dadc] py-1.5 px-3 font-bold text-xs sm:text-sm text-slate-900 text-center border-b border-slate-800 uppercase tracking-wide">
                After Trade Close
              </div>
              <div className="p-3 space-y-3 flex-1 flex flex-col">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Profit:</label>
                  <textarea
                    rows={2}
                    value={journalForm.profitReflection || ''}
                    onChange={(e) => onJournalFormChange('profitReflection', e.target.value)}
                    placeholder="What trades generated profit? Key drivers..."
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Loss:</label>
                  <textarea
                    rows={2}
                    value={journalForm.lossReflection || ''}
                    onChange={(e) => onJournalFormChange('lossReflection', e.target.value)}
                    placeholder="Losing trades analysis, what could have been avoided..."
                    className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Watchlist Box (Soft Pink/Red header) */}
            <div className="border border-slate-800 rounded-sm overflow-hidden flex flex-col bg-white">
              <div className="bg-[#f4a261]/40 py-1.5 px-3 font-bold text-xs sm:text-sm text-slate-900 text-center border-b border-slate-800 uppercase tracking-wide">
                Watchlist
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                {watchlistItems && watchlistItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {watchlistItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-200">
                        <span className="font-bold text-slate-800">{item.instrumentName} ({item.symbol})</span>
                        <span className="text-slate-600 font-medium">Plan: {formatCurrency(item.plannedEntryPrice)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="border-b border-slate-300 pb-1 text-xs text-slate-400">1. Planned stock / setup</div>
                    <div className="border-b border-slate-300 pb-1 text-xs text-slate-400">2. Planned stock / setup</div>
                    <div className="border-b border-slate-300 pb-1 text-xs text-slate-400">3. Planned stock / setup</div>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 italic mt-2">Active watchlist tracked in system</p>
              </div>
            </div>

          </div>

          {/* Lower Section: My Observations (Peach header) */}
          <div className="border border-slate-800 rounded-sm overflow-hidden bg-white">
            <div className="bg-[#fcd5b4] py-1.5 px-3 font-bold text-xs sm:text-sm text-slate-900 text-center border-b border-slate-800 uppercase tracking-wide">
              My Observations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
              
              <div className="p-3">
                <span className="block text-xs font-bold text-slate-800 text-center mb-1.5 border-b border-slate-200 pb-1">
                  Market Movement
                </span>
                <textarea
                  rows={4}
                  value={journalForm.marketMovement || ''}
                  onChange={(e) => onJournalFormChange('marketMovement', e.target.value)}
                  placeholder="Trends, volatility, index behavior..."
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
                />
              </div>

              <div className="p-3">
                <span className="block text-xs font-bold text-slate-800 text-center mb-1.5 border-b border-slate-200 pb-1">
                  Mistakes
                </span>
                <textarea
                  rows={4}
                  value={journalForm.mistakes || ''}
                  onChange={(e) => onJournalFormChange('mistakes', e.target.value)}
                  placeholder="Early exit, fomo, chasing prices..."
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
                />
              </div>

              <div className="p-3">
                <span className="block text-xs font-bold text-slate-800 text-center mb-1.5 border-b border-slate-200 pb-1">
                  Risk / Reward
                </span>
                <textarea
                  rows={4}
                  value={journalForm.riskRewardObservations || ''}
                  onChange={(e) => onJournalFormChange('riskRewardObservations', e.target.value)}
                  placeholder="Position sizing, stop-loss adherence..."
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
                />
              </div>

            </div>
          </div>

          {/* Bottom Section: Notes (Mint / Teal header) */}
          <div className="border border-slate-800 rounded-sm overflow-hidden bg-white">
            <div className="bg-[#b7e4c7] py-1.5 px-3 font-bold text-xs sm:text-sm text-slate-900 text-center border-b border-slate-800 uppercase tracking-wide">
              Notes
            </div>
            <div className="p-3">
              <textarea
                rows={3}
                value={journalForm.notes || ''}
                onChange={(e) => onJournalFormChange('notes', e.target.value)}
                placeholder="Key takeaways, psychological observations, tomorrow's plan..."
                className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:border-blue-500 font-sans resize-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotebookView;
