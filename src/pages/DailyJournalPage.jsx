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
  const [viewMode, setViewMode] = useState('modern'); // 'modern' or 'notebook'
  const [journalData, setJournalData] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [notification, setNotification] = useState(null);

  // Form State
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

  // Fetch Watchlist once for notebook view
  useEffect(() => {
    watchlistApi.getWatchlist('WATCHING')
      .then(res => setWatchlistItems(res.data || []))
      .catch(err => console.warn('Could not load watchlist for notebook', err));
  }, []);

  // Fetch journal summary for date
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
        // Reset form for fresh date
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Trading Journal</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log session reflections, market observations, and discipline takeaways
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('modern')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'modern' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5 mr-1.5" />
              Modern View
            </button>
            <button
              onClick={() => setViewMode('notebook')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'notebook' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Physical Notebook Replica
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent px-2 py-1 focus:outline-none"
            />
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Journal'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
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
        /* Modern View */
        <div className="space-y-6">
          {/* Daily Account Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Session Date</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">{currentDate}</span>
              <span className="text-[11px] text-blue-600 font-medium">{journalData?.dayOfWeek}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Starting Balance</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">{formatCurrency(journalData?.startingBalance)}</span>
              <span className="text-[10px] text-slate-400">Opening capital</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Session Realized P/L</span>
              <span className={`text-base font-bold mt-0.5 block ${
                (journalData?.closedPnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {formatCurrency(journalData?.closedPnl)}
              </span>
              <span className="text-[10px] text-slate-400">Net of charges</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Brokerage & Fees</span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                {formatCurrency((Number(journalData?.totalBrokerage) || 0) + (Number(journalData?.otherCharges) || 0))}
              </span>
              <span className="text-[10px] text-slate-400">Total session cost</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Closing Balance</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">{formatCurrency(journalData?.closingBalance)}</span>
              <span className="text-[10px] text-emerald-600 font-medium">Reconciled</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Trades & Win Rate</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {journalData?.tradeCount || 0} trades
              </span>
              <span className="text-[10px] text-blue-600 font-bold">{journalData?.dailyWinRate || 0}% Win Rate</span>
            </div>
          </div>

          {/* Synced Trades for this Date */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-base font-bold text-slate-900">Trades Executed on {currentDate}</h3>
              </div>
              <button
                onClick={() => navigate(`/add-trade?tradeDate=${currentDate}`)}
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Trade for this Day
              </button>
            </div>

            {journalData?.trades && journalData.trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Symbol / Name</th>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3 text-right">Entry</th>
                      <th className="py-2.5 px-3 text-right">Exit</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Brokerage</th>
                      <th className="py-2.5 px-3 text-right">Net P/L</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {journalData.trades.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {t.instrumentName} <span className="text-blue-600 font-normal">({t.symbol})</span>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.direction === 'LONG' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(t.entryPrice)}</td>
                        <td className="py-2 px-3 text-right font-medium">{t.exitPrice ? formatCurrency(t.exitPrice) : 'Open'}</td>
                        <td className="py-2 px-3 text-right">{t.quantity}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatCurrency(t.brokerage)}</td>
                        <td className={`py-2 px-3 text-right font-bold ${
                          t.status === 'OPEN' ? 'text-amber-600' : (t.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600')
                        }`}>
                          {t.status === 'OPEN' ? 'Open' : formatCurrency(t.netPnl)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 italic text-center">No trades recorded on this date.</p>
            )}
          </div>

          {/* Section: After Trade Close */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              After Trade Close Reflections
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profitable Trades Reflection</label>
                <textarea
                  rows={3}
                  value={form.profitReflection}
                  onChange={(e) => handleFieldChange('profitReflection', e.target.value)}
                  placeholder="What worked well? Setups that generated gains..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Losing Trades Reflection</label>
                <textarea
                  rows={3}
                  value={form.lossReflection}
                  onChange={(e) => handleFieldChange('lossReflection', e.target.value)}
                  placeholder="What caused losses? Premature entry, poor stop-loss placement..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What went well today?</label>
                <textarea
                  rows={2}
                  value={form.whatWentWell}
                  onChange={(e) => handleFieldChange('whatWentWell', e.target.value)}
                  placeholder="Good discipline, waited for triggers..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">What could have been done better?</label>
                <textarea
                  rows={2}
                  value={form.whatWentWrong}
                  onChange={(e) => handleFieldChange('whatWentWrong', e.target.value)}
                  placeholder="Execution gaps, hesitations, sizing tweaks..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: My Observations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              My Market & Discipline Observations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Market Movement</label>
                <textarea
                  rows={4}
                  value={form.marketMovement}
                  onChange={(e) => handleFieldChange('marketMovement', e.target.value)}
                  placeholder="Index trends, support/resistance reaction, sector strength..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mistakes</label>
                <textarea
                  rows={4}
                  value={form.mistakes}
                  onChange={(e) => handleFieldChange('mistakes', e.target.value)}
                  placeholder="Rule violations, emotional trades, overtrading..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Risk / Reward Observations</label>
                <textarea
                  rows={4}
                  value={form.riskRewardObservations}
                  onChange={(e) => handleFieldChange('riskRewardObservations', e.target.value)}
                  placeholder="Capital at risk vs reward captured..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Daily Notes & Psychology */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Daily Notes, Outlook & Psychology
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Market Outlook</label>
                <textarea
                  rows={3}
                  value={form.marketOutlook}
                  onChange={(e) => handleFieldChange('marketOutlook', e.target.value)}
                  placeholder="Bias for next trading day, upcoming events..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emotional Control</label>
                <textarea
                  rows={3}
                  value={form.emotionalControl}
                  onChange={(e) => handleFieldChange('emotionalControl', e.target.value)}
                  placeholder="Mindset state, discipline score, stress levels..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lessons Learned</label>
                <textarea
                  rows={3}
                  value={form.lessonsLearned}
                  onChange={(e) => handleFieldChange('lessonsLearned', e.target.value)}
                  placeholder="Core rules reinforced..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">General Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Any other reminders, quotes, or thoughts..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Journal Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyJournalPage;
