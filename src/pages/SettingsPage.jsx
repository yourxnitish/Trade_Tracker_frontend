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
  ShieldAlert
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
    theme: 'light',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
        theme: settings.theme || 'light',
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

    setForm(prev => ({
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure capital balance baseline, currency preferences, deposit tracking, and data backups
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Preferences Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-4 h-4 text-blue-600" />
          General Account Configuration
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trader Name / Display Alias</label>
              <input
                type="text"
                value={form.traderName}
                onChange={(e) => setForm({ ...form, traderName: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Account Balance ({form.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.initialBalance}
                onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Starting baseline before logged trade P/L</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code & Symbol</label>
              <select
                value={form.currency}
                onChange={handleCurrencyChange}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date Format</label>
              <select
                value={form.dateFormat}
                onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY (Indian / European)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Funding & Capital Adjustments (Deposits / Withdrawals) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              Account Funding (Deposits & Withdrawals)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Capital injections and payouts adjust your current balance without polluting your trading P/L
            </p>
          </div>
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Transaction
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">
            No deposits or withdrawals logged. Your account balance is driven by Initial Balance + Realized P/L.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3">Notes</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.transactionDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${
                      tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{tx.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setTxToDelete(tx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Complete CSV Export
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Download your entire trading archive, including entries, exits, R:R metrics, and qualitative psychology notes into a clean spreadsheet file.
          </p>
          <div className="pt-2">
            <a
              href={tradesApi.getExportCsvUrl()}
              download
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download Trades CSV
            </a>
          </div>
        </div>

        {/* Database Backup Instructions Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            MySQL Database Backup
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Backup your database `trading_journal` to retain permanent offline copies using standard MySQL CLI commands:
          </p>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] font-mono select-all overflow-x-auto">
            mysqldump -u root -p trading_journal &gt; backup.sql
          </div>
          <p className="text-[11px] text-slate-400">
            Restore with: <code className="text-slate-600 font-mono">mysql -u root -p trading_journal &lt; backup.sql</code>
          </p>
        </div>

      </div>

      {/* Application Specs Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          Application Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Application</span>
            <span className="font-bold text-slate-800 mt-0.5 block">TradeTrack</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Version</span>
            <span className="font-bold text-slate-800 mt-0.5 block">1.0.0 (Production)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Backend API</span>
            <span className="font-bold text-slate-800 mt-0.5 block">Spring Boot 3.2.5</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Database</span>
            <span className="font-bold text-slate-800 mt-0.5 block">MySQL 8.0</span>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Account Funding Transaction</h3>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'DEPOSIT' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txForm.type === 'DEPOSIT'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Deposit (Capital In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxForm({ ...txForm, type: 'WITHDRAWAL' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txForm.type === 'WITHDRAWAL'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Withdrawal (Capital Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({form.currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Bank transfer reference, profits withdrawal"
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
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
        message={`Are you sure you want to remove this ${txToDelete?.type} of ${formatCurrency(txToDelete?.amount)}?`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTx}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};

export default SettingsPage;
