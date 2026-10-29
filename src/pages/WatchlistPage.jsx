import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Plus,
  Search,
  ArrowRight,
  Edit2,
  Trash2,
  Target,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
  X
} from 'lucide-react';
import { watchlistApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    instrumentName: '',
    symbol: '',
    exchange: 'NSE',
    plannedEntryPrice: '',
    targetPrice: '',
    stopLoss: '',
    strategy: '',
    reasonForWatching: '',
    status: 'WATCHING',
    notes: '',
  });

  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await watchlistApi.getWatchlist(statusFilter);
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load watchlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [statusFilter]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setForm({
      instrumentName: '',
      symbol: '',
      exchange: 'NSE',
      plannedEntryPrice: '',
      targetPrice: '',
      stopLoss: '',
      strategy: '',
      reasonForWatching: '',
      status: 'WATCHING',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setForm({
      instrumentName: item.instrumentName || '',
      symbol: item.symbol || '',
      exchange: item.exchange || 'NSE',
      plannedEntryPrice: item.plannedEntryPrice || '',
      targetPrice: item.targetPrice || '',
      stopLoss: item.stopLoss || '',
      strategy: item.strategy || '',
      reasonForWatching: item.reasonForWatching || '',
      status: item.status || 'WATCHING',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        plannedEntryPrice: form.plannedEntryPrice ? parseFloat(form.plannedEntryPrice) : null,
        targetPrice: form.targetPrice ? parseFloat(form.targetPrice) : null,
        stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
      };

      if (editingItem) {
        await watchlistApi.updateWatchlistItem(editingItem.id, payload);
      } else {
        await watchlistApi.createWatchlistItem(payload);
      }
      setIsModalOpen(false);
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to save watchlist item', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await watchlistApi.deleteWatchlistItem(itemToDelete.id);
      setItemToDelete(null);
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleConvertToTrade = (item) => {
    const params = new URLSearchParams({
      symbol: item.symbol,
      instrumentName: item.instrumentName,
      exchange: item.exchange,
      plannedEntryPrice: item.plannedEntryPrice || '',
      targetPrice: item.targetPrice || '',
      stopLoss: item.stopLoss || '',
      strategy: item.strategy || '',
    });
    watchlistApi.updateStatus(item.id, 'TRADED').catch(console.warn);
    navigate(`/add-trade?${params.toString()}`);
  };

  const filteredItems = items.filter(it => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      it.symbol.toLowerCase().includes(q) ||
      it.instrumentName.toLowerCase().includes(q) ||
      (it.strategy && it.strategy.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Trading Setup Watchlist</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {filteredItems.length} SETUPS
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            PRE-MARKET PLANNING • R:R AUDIT • 1-CLICK CONVERT TO TRADE
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-1 stroke-[3]" />
          Add to Watchlist
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1726] p-4 rounded-3xl border border-[#1e293b] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search watchlist symbols, setups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto font-mono">
          {[
            { id: 'ALL', label: 'ALL' },
            { id: 'WATCHING', label: 'WATCHING' },
            { id: 'READY', label: 'READY' },
            { id: 'TRADED', label: 'TRADED' },
            { id: 'REMOVED', label: 'ARCHIVED' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'bg-[#080c14] text-slate-400 border border-[#1e293b] hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="No symbols currently on watchlist"
          description="Add candidate setups, planned trigger prices, and stop-loss levels to plan ahead."
          actionLabel="Add Watchlist Item"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const entry = parseFloat(item.plannedEntryPrice) || 0;
            const target = parseFloat(item.targetPrice) || 0;
            const sl = parseFloat(item.stopLoss) || 0;

            const riskPerShare = entry > 0 && sl > 0 ? Math.abs(entry - sl) : 0;
            const rewardPerShare = entry > 0 && target > 0 ? Math.abs(target - entry) : 0;
            const rr = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : null;

            return (
              <div
                key={item.id}
                className="bg-[#0f1726] rounded-3xl p-5 border border-[#1e293b] shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-black text-white font-mono">{item.symbol}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#080c14] text-slate-400 border border-[#1e293b]">
                          {item.exchange || 'NSE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] mt-0.5">
                        {item.instrumentName}
                      </p>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.status === 'READY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'TRADED'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-2xl bg-[#080c14] border border-[#1e293b] text-center font-mono">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Plan Entry</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        {item.plannedEntryPrice ? formatCurrency(item.plannedEntryPrice) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Target</span>
                      <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                        {item.targetPrice ? formatCurrency(item.targetPrice) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Stop Loss</span>
                      <span className="text-xs font-bold text-rose-400 mt-0.5 block">
                        {item.stopLoss ? formatCurrency(item.stopLoss) : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Planned R:R Badge */}
                  {rr && (
                    <div className="mt-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-slate-400">Planned Risk/Reward:</span>
                      <span className="font-bold text-emerald-400">1 : {rr}</span>
                    </div>
                  )}

                  {item.strategy && (
                    <div className="mt-3 text-xs">
                      <span className="font-semibold text-slate-400 font-mono">Strategy:</span>{' '}
                      <span className="text-slate-200 font-medium">{item.strategy}</span>
                    </div>
                  )}

                  {item.reasonForWatching && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.reasonForWatching}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-[#1a2333] flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleConvertToTrade(item)}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20 font-mono"
                  >
                    Convert to Trade
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Watchlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1726] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#1e293b]">
            <div className="flex items-center justify-between border-b border-[#1a2333] pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? 'Edit Watchlist Item' : 'Add Symbol to Watchlist'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Trading Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INFY"
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instrument Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys Ltd"
                    value={form.instrumentName}
                    onChange={(e) => setForm({ ...form, instrumentName: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Planned Entry</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.plannedEntryPrice}
                    onChange={(e) => setForm({ ...form, plannedEntryPrice: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.targetPrice}
                    onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.stopLoss}
                    onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Strategy</label>
                  <input
                    type="text"
                    placeholder="e.g. Trendline bounce"
                    value={form.strategy}
                    onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="WATCHING">Watching</option>
                    <option value="READY">Ready</option>
                    <option value="TRADED">Traded</option>
                    <option value="REMOVED">Removed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Watching / Trigger</label>
                <textarea
                  rows={2}
                  placeholder="Key technical support level, earnings upcoming..."
                  value={form.reasonForWatching}
                  onChange={(e) => setForm({ ...form, reasonForWatching: e.target.value })}
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white resize-none focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Remove Watchlist Item"
        message={`Are you sure you want to remove ${itemToDelete?.symbol} from your watchlist?`}
        confirmLabel="Remove"
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default WatchlistPage;
