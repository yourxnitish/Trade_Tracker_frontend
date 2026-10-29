import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Printer,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X
} from 'lucide-react';
import { tradesApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import TradeModal from '../components/TradeModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const TradeHistoryPage = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ALL');
  const [outcome, setOutcome] = useState('ALL');
  const [direction, setDirection] = useState('ALL');
  const [instrument, setInstrument] = useState('ALL');
  const [exchange, setExchange] = useState('ALL');
  const [strategy, setStrategy] = useState('ALL');
  const [sortBy, setSortBy] = useState('tradeDate');
  const [sortDir, setSortDir] = useState('desc');

  const [instrumentsList, setInstrumentsList] = useState([]);
  const [strategiesList, setStrategiesList] = useState([]);
  const [exchangesList, setExchangesList] = useState([]);

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      tradesApi.getInstruments(),
      tradesApi.getStrategies(),
      tradesApi.getExchanges(),
    ]).then(([instRes, stratRes, exRes]) => {
      setInstrumentsList(instRes.data || []);
      setStrategiesList(stratRes.data || []);
      setExchangesList(exRes.data || []);
    }).catch(console.warn);
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy,
        sortDir,
      };
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (status !== 'ALL') params.status = status;
      if (outcome !== 'ALL') params.outcome = outcome;
      if (direction !== 'ALL') params.direction = direction;
      if (instrument !== 'ALL') params.instrument = instrument;
      if (exchange !== 'ALL') params.exchange = exchange;
      if (strategy !== 'ALL') params.strategy = strategy;

      const res = await tradesApi.getTrades(params);
      setTrades(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load trades', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [page, pageSize, sortBy, sortDir, status, outcome, direction, instrument, exchange, strategy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTrades();
  };

  const handleDeleteConfirm = async () => {
    if (!tradeToDelete) return;
    setIsDeleting(true);
    try {
      await tradesApi.deleteTrade(tradeToDelete.id);
      setTradeToDelete(null);
      fetchTrades();
    } catch (err) {
      console.error('Failed to delete trade', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Trade Ledger & History</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {totalElements} LOGS
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            SEARCHABLE DATABASE • REALIZED AUDIT • CSV EXPORT
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={tradesApi.getExportCsvUrl()}
            download
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0f1726] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors shadow-sm font-mono"
          >
            <Download className="w-4 h-4 mr-1.5 text-emerald-400" />
            CSV Export
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0f1726] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors shadow-sm font-mono"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-400" />
            Print
          </button>
          <button
            onClick={() => navigate('/add-trade')}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[3]" />
            Add Trade
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#0f1726] p-4 rounded-3xl border border-[#1e293b] shadow-xl space-y-3 no-print">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search symbol, instrument, or strategy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </form>

          {/* Quick Outcome Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'WIN', label: 'WINS', color: 'text-emerald-400' },
              { id: 'LOSS', label: 'LOSSES', color: 'text-rose-400' },
              { id: 'BREAKEVEN', label: 'BE', color: 'text-slate-400' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setOutcome(item.id); setPage(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  outcome === item.id
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-[#080c14] text-slate-400 border border-[#1e293b] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#1a2333] font-mono">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Direction</label>
            <select
              value={direction}
              onChange={(e) => { setDirection(e.target.value); setPage(0); }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Directions</option>
              <option value="LONG">Long (Buy)</option>
              <option value="SHORT">Short (Sell)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="CLOSED">Closed Only</option>
              <option value="OPEN">Open Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Instrument</label>
            <select
              value={instrument}
              onChange={(e) => { setInstrument(e.target.value); setPage(0); }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Instruments</option>
              {instrumentsList.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sort By</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="w-full text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="tradeDate-desc">Date (Newest)</option>
              <option value="tradeDate-asc">Date (Oldest)</option>
              <option value="netPnl-desc">P/L (Highest)</option>
              <option value="netPnl-asc">P/L (Lowest)</option>
              <option value="quantity-desc">Quantity</option>
              <option value="symbol-asc">Symbol (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[#0f1726] rounded-3xl border border-[#1e293b] shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <EmptyState
            title="No trades match current filters"
            description="Your trade history will display here as soon as you record trades."
            actionLabel="Add New Trade"
            onAction={() => navigate('/add-trade')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
              <thead>
                <tr className="bg-[#080c14] border-b border-[#1e293b] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Instrument</th>
                  <th className="py-3.5 px-4">Side</th>
                  <th className="py-3.5 px-4 text-right">Entry</th>
                  <th className="py-3.5 px-4 text-right">Exit</th>
                  <th className="py-3.5 px-4 text-right">Qty</th>
                  <th className="py-3.5 px-4 text-right">Target</th>
                  <th className="py-3.5 px-4 text-right">SL</th>
                  <th className="py-3.5 px-4 text-right">Charges</th>
                  <th className="py-3.5 px-4 text-right">Net P/L</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162032]">
                {trades.map((t) => {
                  const isLong = t.direction === 'LONG';
                  const isClosed = t.status === 'CLOSED';
                  const isWin = isClosed && t.netPnl > 0;
                  const isLoss = isClosed && t.netPnl < 0;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[#131d2e] transition-colors group cursor-pointer"
                      onClick={() => { setSelectedTrade(t); setIsDetailOpen(true); }}
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200 block">{t.tradeDate}</span>
                        <span className="text-[10px] text-slate-500">{t.entryTime || '--:--'}</span>
                      </td>

                      {/* Instrument & Symbol */}
                      <td className="py-3 px-4 font-sans">
                        <span className="font-bold text-white block truncate max-w-[140px]">{t.instrumentName}</span>
                        <span className="text-[11px] text-emerald-400 font-mono font-bold">{t.symbol}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({t.exchange || 'NSE'})</span>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isLong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {t.direction}
                        </span>
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-4 text-right font-medium text-slate-200">
                        {formatCurrency(t.entryPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-200">
                        {t.exitPrice ? formatCurrency(t.exitPrice) : <span className="text-amber-400 italic">Open</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-300">
                        {t.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400/80">
                        {t.targetPrice ? formatCurrency(t.targetPrice) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-400/80">
                        {t.stopLoss ? formatCurrency(t.stopLoss) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatCurrency((Number(t.brokerage) || 0) + (Number(t.otherCharges) || 0))}
                      </td>

                      {/* Net PnL */}
                      <td className="py-3 px-4 text-right">
                        {isClosed ? (
                          <span className={`font-black text-sm ${isWin ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'}`}>
                            {formatCurrency(t.netPnl)}
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold text-xs">OPEN</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isClosed ? 'bg-slate-800 text-slate-300' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right no-print" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => { setSelectedTrade(t); setIsDetailOpen(true); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-trade/${t.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Trade"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTradeToDelete(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#1a2333] text-xs text-slate-400 no-print font-mono">
            <div>
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} trades
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-[#1e293b] disabled:opacity-40 hover:bg-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-white">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-[#1e293b] disabled:opacity-40 hover:bg-slate-800 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TradeModal
        trade={selectedTrade}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(tradeToDelete)}
        title="Delete Trade Record"
        message={`Are you sure you want to delete trade #${tradeToDelete?.id} (${tradeToDelete?.symbol})? This action will permanently remove it from your journal.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Permanently'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTradeToDelete(null)}
      />
    </div>
  );
};

export default TradeHistoryPage;
