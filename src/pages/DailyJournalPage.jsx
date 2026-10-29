import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Activity,
  Layers,
  Layout,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { journalsApi, watchlistApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import NotebookView from '../components/NotebookView';
import EmptyState from '../components/EmptyState';

const DailyJournalPage = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('modern');
  const [journalData, setJournalData] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    profitReflection: '',
    lossReflection: '',
    whatWentWell: '',
    whatWentWrong: '',
    marketMovement: '',
    mistakes: '',
    riskRewardObservations: '',
    marketOutlook: '',
    emotionalControl: '',
    lessonsLearned: '',
    notes: '',
  });

  useEffect(() => {
    watchlistApi.getWatchlist('WATCHING')
      .then(res => setWatchlistItems(res.data || []))
      .catch(console.warn);
  }, []);

  const fetchJournal = async (date) => {
    setLoading(true);
    try {
      const res = await journalsApi.getJournalByDate(date);
      setJournalData(res.data);

      if (res.data && res.data.journal) {
        const j = res.data.journal;
        setForm({
          profitReflection: j.profitReflection || '',
          lossReflection: j.lossReflection || '',
          whatWentWell: j.whatWentWell || '',
          whatWentWrong: j.whatWentWrong || '',
          marketMovement: j.marketMovement || '',
          mistakes: j.mistakes || '',
          riskRewardObservations: j.riskRewardObservations || '',
          marketOutlook: j.marketOutlook || '',
          emotionalControl: j.emotionalControl || '',
          lessonsLearned: j.lessonsLearned || '',
          notes: j.notes || '',
        });
      } else {
        setForm({
          profitReflection: '',
          lossReflection: '',
          whatWentWell: '',
          whatWentWrong: '',
          marketMovement: '',
          mistakes: '',
          riskRewardObservations: '',
          marketOutlook: '',
          emotionalControl: '',
          lessonsLearned: '',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to load journal summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal(currentDate);
  }, [currentDate]);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const payload = {
        journalDate: currentDate,
        ...form,
      };
      await journalsApi.saveJournal(payload);
      setNotification({ type: 'success', message: 'Daily Journal reflections saved successfully!' });
      fetchJournal(currentDate);
    } catch (err) {
      console.error('Failed to save journal', err);
      setNotification({ type: 'error', message: 'Failed to save journal. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const navigateDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Daily Trading Journal</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              SESSION LOG
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            SESSION REFLECTION • DISCIPLINE SCORE • RECONCILED BALANCES
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0f1726] border border-[#1e293b]">
            <button
              onClick={() => setViewMode('modern')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'modern' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5 mr-1.5" />
              Terminal View
            </button>
            <button
              onClick={() => setViewMode('notebook')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                viewMode === 'notebook' ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Notebook Replica
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center space-x-1 bg-[#0f1726] p-1 rounded-xl border border-[#1e293b] font-mono">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-xs font-bold text-white bg-transparent px-2 py-1 focus:outline-none"
            />
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            {saving ? 'Saving...' : 'Save Journal'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Render selected view */}
      {viewMode === 'notebook' ? (
        <NotebookView
          journalDate={currentDate}
          dayOfWeek={journalData?.dayOfWeek || ''}
          startingBalance={journalData?.startingBalance || 0}
          closingBalance={journalData?.closingBalance || 0}
          closedPnl={journalData?.closedPnl || 0}
          totalBrokerage={journalData?.totalBrokerage || 0}
          trades={journalData?.trades || []}
          journalForm={form}
          onJournalFormChange={handleFieldChange}
          onSave={handleSave}
          saving={saving}
          watchlistItems={watchlistItems}
        />
      ) : (
        /* Modern Terminal View */
        <div className="space-y-6">
          {/* Daily Account Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Date</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDate}</span>
              <span className="text-[11px] text-emerald-400 font-medium">{journalData?.dayOfWeek}</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Starting Balance</span>
              <span className="text-base font-black text-slate-200 mt-0.5 block">{formatCurrency(journalData?.startingBalance)}</span>
              <span className="text-[10px] text-slate-500">Opening capital</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Net P/L</span>
              <span className={`text-base font-black mt-0.5 block ${
                (journalData?.closedPnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatCurrency(journalData?.closedPnl)}
              </span>
              <span className="text-[10px] text-slate-500">Realized session</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brokerage & Fees</span>
              <span className="text-base font-black text-slate-300 mt-0.5 block">
                {formatCurrency((Number(journalData?.totalBrokerage) || 0) + (Number(journalData?.otherCharges) || 0))}
              </span>
              <span className="text-[10px] text-slate-500">Session deductions</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Closing Balance</span>
              <span className="text-base font-black text-white mt-0.5 block">{formatCurrency(journalData?.closingBalance)}</span>
              <span className="text-[10px] text-emerald-400 font-medium">Reconciled</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trades & Win Rate</span>
              <span className="text-base font-black text-white mt-0.5 block">
                {journalData?.tradeCount || 0} trades
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">{journalData?.dailyWinRate || 0}% Win Rate</span>
            </div>
          </div>

          {/* Synced Trades for this Date */}
          <div className="bg-[#0f1726] rounded-3xl p-5 border border-[#1e293b] shadow-xl space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#1a2333] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Trades Executed on {currentDate}
                </h3>
              </div>
              <button
                onClick={() => navigate(`/add-trade?tradeDate=${currentDate}`)}
                className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                Add Trade for this Day
              </button>
            </div>

            {journalData?.trades && journalData.trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Symbol / Name</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3 text-right">Entry</th>
                      <th className="py-2.5 px-3 text-right">Exit</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Fees</th>
                      <th className="py-2.5 px-3 text-right">Net P/L</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162032]">
                    {journalData.trades.map(t => (
                      <tr key={t.id} className="hover:bg-[#131d2e]">
                        <td className="py-2 px-3 font-bold text-white font-sans">
                          {t.instrumentName} <span className="text-emerald-400 font-mono font-normal">({t.symbol})</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-slate-200">{formatCurrency(t.entryPrice)}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-200">{t.exitPrice ? formatCurrency(t.exitPrice) : 'Open'}</td>
                        <td className="py-2 px-3 text-right text-slate-300 font-bold">{t.quantity}</td>
                        <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(t.brokerage)}</td>
                        <td className={`py-2 px-3 text-right font-black ${
                          t.status === 'OPEN' ? 'text-amber-400' : (t.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')
                        }`}>
                          {t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 italic text-center font-mono">No trades logged on this date yet.</p>
            )}
          </div>

          {/* Section: After Trade Close */}
          <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1a2333] pb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              After Trade Close Reflections
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1 font-mono uppercase">Profitable Trades Reflection</label>
                <textarea
                  rows={3}
                  value={form.profitReflection}
                  onChange={(e) => handleFieldChange('profitReflection', e.target.value)}
                  placeholder="What worked well? Clean setups that generated gains..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1 font-mono uppercase">Losing Trades Reflection</label>
                <textarea
                  rows={3}
                  value={form.lossReflection}
                  onChange={(e) => handleFieldChange('lossReflection', e.target.value)}
                  placeholder="What caused losses? Hesitations, poor stop-loss placement..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">What went well today?</label>
                <textarea
                  rows={2}
                  value={form.whatWentWell}
                  onChange={(e) => handleFieldChange('whatWentWell', e.target.value)}
                  placeholder="Good discipline, waited for trigger..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">What could have been done better?</label>
                <textarea
                  rows={2}
                  value={form.whatWentWrong}
                  onChange={(e) => handleFieldChange('whatWentWrong', e.target.value)}
                  placeholder="Execution gaps, hesitations, sizing adjustments..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: My Observations */}
          <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1a2333] pb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Market Movement, Mistakes & Risk/Reward Observations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Market Movement</label>
                <textarea
                  rows={4}
                  value={form.marketMovement}
                  onChange={(e) => handleFieldChange('marketMovement', e.target.value)}
                  placeholder="Index trends, institutional volume, sector strength..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1 font-mono uppercase">Mistakes</label>
                <textarea
                  rows={4}
                  value={form.mistakes}
                  onChange={(e) => handleFieldChange('mistakes', e.target.value)}
                  placeholder="Rule violations, emotional entries, overtrading..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1 font-mono uppercase">Risk / Reward Observations</label>
                <textarea
                  rows={4}
                  value={form.riskRewardObservations}
                  onChange={(e) => handleFieldChange('riskRewardObservations', e.target.value)}
                  placeholder="Stop-loss respect, R:R capture efficiency..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Daily Notes & Psychology */}
          <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[#1a2333] pb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Outlook, Psychology & Discipline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Market Outlook</label>
                <textarea
                  rows={3}
                  value={form.marketOutlook}
                  onChange={(e) => handleFieldChange('marketOutlook', e.target.value)}
                  placeholder="Bias for next trading day..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Emotional Control</label>
                <textarea
                  rows={3}
                  value={form.emotionalControl}
                  onChange={(e) => handleFieldChange('emotionalControl', e.target.value)}
                  placeholder="Mindset state, discipline score..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lessons Learned</label>
                <textarea
                  rows={3}
                  value={form.lessonsLearned}
                  onChange={(e) => handleFieldChange('lessonsLearned', e.target.value)}
                  placeholder="Core rules reinforced..."
                  className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">General Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Any other reminders, quotes, or thoughts..."
                className="w-full text-xs sm:text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2 stroke-[2.5]" />
                {saving ? 'Saving...' : 'Save Journal Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyJournalPage;
