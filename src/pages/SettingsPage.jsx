import React, { useState, useEffect } from 'react';
import {
  Settings,
  DollarSign,
  Download,
  Database,
  Info,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { settingsApi, tradesApi } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';

const SettingsPage = () => {
  const { settings, updateSettings, formatCurrency } = useSettings();

  const [form, setForm] = useState({
    initialBalance: '100000.00',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'YYYY-MM-DD',
    traderName: 'Trader',
    theme: 'dark',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Transactions (Deposits / Withdrawals)
  const [transactions, setTransactions] = useState([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'DEPOSIT',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [txToDelete, setTxToDelete] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        initialBalance: settings.initialBalance || '100000.00',
        currency: settings.currency || 'INR',
        currencySymbol: settings.currencySymbol || '₹',
        dateFormat: settings.dateFormat || 'YYYY-MM-DD',
        traderName: settings.traderName || 'Trader',
        theme: settings.theme || 'dark',
      });
    }
  }, [settings]);

  const loadTransactions = async () => {
    try {
      const res = await settingsApi.getTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.warn('Failed to load transactions', err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleCurrencyChange = (e) => {
    const val = e.target.value;
    let symbol = '₹';
    if (val === 'USD') symbol = '$';
    else if (val === 'EUR') symbol = '€';
    else if (val === 'GBP') symbol = '£';
    else if (val === 'INR') symbol = '₹';

    setForm((prev) => ({
      ...prev,
      currency: val,
      currencySymbol: symbol,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateSettings(form);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAllData = async () => {
    setResetting(true);
    try {
      await settingsApi.resetAllData();
      setResetModalOpen(false);
      setSuccessMsg('All trading data has been reset to a clean state!');
      loadTransactions();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to reset data', err);
    } finally {
      setResetting(false);
    }
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.addTransaction(txForm);
      setIsTxModalOpen(false);
      setTxForm({
        type: 'DEPOSIT',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadTransactions();
    } catch (err) {
      console.error('Failed to add transaction', err);
    }
  };

  const handleDeleteTx = async () => {
    if (!txToDelete) return;
    try {
      await settingsApi.deleteTransaction(txToDelete.id);
      setTxToDelete(null);
      loadTransactions();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">System & Account Settings</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Terminal Config
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Configure capital balance baseline, currency preferences, deposit tracking, and data backups
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Account Preferences Form */}
      <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-lg shadow-black/30 space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-dark-border pb-3">
          <Settings className="w-4 h-4 text-emerald-400" />
          General Account Configuration
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trader Name / Display Alias</label>
              <input
                type="text"
                value={form.traderName}
                onChange={(e) => setForm({ ...form, traderName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Initial Account Balance ({form.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.initialBalance}
                onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Starting baseline before logged trade P/L</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Currency Code & Symbol</label>
              <select
                value={form.currency}
                onChange={handleCurrencyChange}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="INR" className="bg-dark-card text-slate-100">INR (₹ - Indian Rupee)</option>
                <option value="USD" className="bg-dark-card text-slate-100">USD ($ - US Dollar)</option>
                <option value="EUR" className="bg-dark-card text-slate-100">EUR (€ - Euro)</option>
                <option value="GBP" className="bg-dark-card text-slate-100">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Date Format</label>
              <select
                value={form.dateFormat}
                onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="YYYY-MM-DD" className="bg-dark-card text-slate-100">YYYY-MM-DD (ISO)</option>
                <option value="DD-MM-YYYY" className="bg-dark-card text-slate-100">DD-MM-YYYY (Indian / European)</option>
                <option value="MM/DD/YYYY" className="bg-dark-card text-slate-100">MM/DD/YYYY (US)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Funding & Capital Adjustments (Deposits / Withdrawals) */}
      <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-lg shadow-black/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Account Funding (Deposits & Withdrawals)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Capital injections and payouts adjust your current balance without polluting your trading P/L
            </p>
          </div>
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
            Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 italic font-mono">
            No deposits or withdrawals logged. Your account balance is driven by Initial Balance + Realized P/L.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-dark-border text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-dark-bg/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{tx.transactionDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{tx.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setTxToDelete(tx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Backup & CSV Export Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-lg shadow-black/30 space-y-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Complete CSV Export
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Download your entire trading archive, including entries, exits, R:R metrics, and qualitative psychology notes into a clean spreadsheet file.
          </p>
          <div className="pt-2">
            <a
              href={tradesApi.getExportCsvUrl()}
              download
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-dark-bg border border-dark-border text-slate-200 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-1.5 text-emerald-400" />
              Download Trades CSV
            </a>
          </div>
        </div>

        {/* Clear Data / Reset Journal Card */}
        <div className="bg-dark-card rounded-2xl p-6 border border-rose-500/30 shadow-lg shadow-black/30 space-y-3">
          <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            Clean Slate / Reset Journal
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Wipe all sample or historical records to start journaling fresh from today. All trades, daily journals, watchlist items, and notes will be cleared.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Clear All Data & Start Fresh
            </button>
          </div>
        </div>

        {/* Database Backup Instructions Card */}
        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-lg shadow-black/30 space-y-3 md:col-span-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            MySQL Database Backup & Restore
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Backup your database <code className="text-emerald-400 font-mono">trading_journal</code> to retain permanent offline copies using standard MySQL CLI commands:
          </p>
          <div className="bg-dark-bg text-emerald-400 border border-dark-border p-3.5 rounded-xl text-xs font-mono select-all overflow-x-auto">
            mysqldump -u root -p trading_journal &gt; backup.sql
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Restore with:{' '}
            <code className="text-slate-400 font-mono">
              mysql -u root -p trading_journal &lt; backup.sql
            </code>
          </p>
        </div>
      </div>

      {/* Application Specs Card */}
      <div className="bg-dark-card rounded-2xl p-6 border border-dark-border shadow-lg shadow-black/30">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-400" />
          Terminal Environment Specs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-dark-bg rounded-xl border border-dark-border">
            <span className="text-slate-500 block text-[10px] uppercase">Application</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">TradeTrack v1.0</span>
          </div>
          <div className="p-3 bg-dark-bg rounded-xl border border-dark-border">
            <span className="text-slate-500 block text-[10px] uppercase">Theme</span>
            <span className="font-bold text-slate-200 mt-0.5 block">Pro Terminal (G/R/B)</span>
          </div>
          <div className="p-3 bg-dark-bg rounded-xl border border-dark-border">
            <span className="text-slate-500 block text-[10px] uppercase">Backend API</span>
            <span className="font-bold text-slate-200 mt-0.5 block">Spring Boot 3.2.5</span>
          </div>
          <div className="p-3 bg-dark-bg rounded-xl border border-dark-border">
            <span className="text-slate-500 block text-[10px] uppercase">Database</span>
            <span className="font-bold text-slate-200 mt-0.5 block">MySQL 8.0</span>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-card w-full max-w-md rounded-2xl p-6 shadow-2xl border border-dark-border text-slate-100">
            <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                Add Capital Transaction
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-dark-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'DEPOSIT' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txForm.type === 'DEPOSIT'
                        ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-dark-bg text-slate-400 border-dark-border hover:border-slate-700'
                    }`}
                  >
                    Deposit (Capital In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'WITHDRAWAL' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txForm.type === 'WITHDRAWAL'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                        : 'bg-dark-bg text-slate-400 border-dark-border hover:border-slate-700'
                    }`}
                  >
                    Withdrawal (Capital Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Amount ({form.currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Bank transfer reference, profits withdrawal"
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-dark-bg border border-dark-border hover:border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tx Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        title="Delete Transaction"
        message={`Are you sure you want to remove this ${txToDelete?.type} of ${formatCurrency(
          txToDelete?.amount
        )}?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTx}
        onCancel={() => setTxToDelete(null)}
      />

      {/* Reset All Data Confirmation */}
      <ConfirmDialog
        isOpen={resetModalOpen}
        title="Reset Entire Journal Database"
        message="Are you sure you want to wipe all records? This will delete all trade history, daily journal reflections, watchlist setups, and notes so you can start completely fresh. This action cannot be undone."
        confirmLabel={resetting ? 'Resetting...' : 'Yes, Clear All Data'}
        isDanger={true}
        onConfirm={handleResetAllData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;