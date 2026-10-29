import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Target,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Flame,
  RefreshCw,
  PieChart as PieIcon,
  Filter
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import { analyticsApi, tradesApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

const AnalyticsPage = () => {
  const { formatCurrency } = useSettings();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instrument, setInstrument] = useState('ALL');
  const [strategy, setStrategy] = useState('ALL');

  // Filter option lists
  const [instrumentsList, setInstrumentsList] = useState([]);
  const [strategiesList, setStrategiesList] = useState([]);

  useEffect(() => {
    Promise.all([
      tradesApi.getInstruments(),
      tradesApi.getStrategies(),
    ]).then(([instRes, stratRes]) => {
      setInstrumentsList(instRes.data || []);
      setStrategiesList(stratRes.data || []);
    }).catch(console.warn);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (instrument !== 'ALL') params.instrument = instrument;
      if (strategy !== 'ALL') params.strategy = strategy;

      const res = await analyticsApi.getAnalytics(params);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate, instrument, strategy]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Computing trading analytics...</p>
        </div>
      </div>
    );
  }

  const hasData = data && data.closedTrades > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deep statistical breakdown of win rates, risk/reward, strategies, and trading habits
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Instruments</option>
            {instrumentsList.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Strategies</option>
            {strategiesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="Insufficient trade records for analytics"
          description="Log closed trades with entry and exit prices to view detailed performance metrics, streak analysis, and heatmaps."
        />
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Realized Net Profit"
              value={formatCurrency(data.totalRealizedNetPnl)}
              subValue={`Total charges: ${formatCurrency(data.totalCharges)}`}
              icon={data.totalRealizedNetPnl >= 0 ? TrendingUp : TrendingDown}
              colorScheme={data.totalRealizedNetPnl >= 0 ? 'green' : 'red'}
            />
            <StatCard
              title="Win Percentage"
              value={`${data.winRate}%`}
              subValue={`${data.closedTrades} total closed trades`}
              icon={PieIcon}
              colorScheme="blue"
            />
            <StatCard
              title="Profit Factor"
              value={data.profitFactor > 50 ? '∞' : Number(data.profitFactor).toFixed(2)}
              subValue={data.profitFactor >= 1.5 ? 'Healthy Edge' : 'Needs Optimization'}
              icon={Target}
              colorScheme={data.profitFactor >= 1.5 ? 'green' : 'amber'}
            />
            <StatCard
              title="Winning vs Losing Streak"
              value={`${data.maxConsecutiveWins}W / ${data.maxConsecutiveLosses}L`}
              subValue={`Current streak: ${data.currentStreak > 0 ? `+${data.currentStreak} Wins` : `${data.currentStreak} Losses`}`}
              icon={Flame}
              colorScheme="purple"
            />
          </div>

          {/* Trade Size & Outlier Strips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Win</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(data.avgWinningTrade)}</span>
              <span className="text-[10px] text-slate-400">per profitable trade</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Loss</span>
              <span className="text-xl font-bold text-rose-600 mt-1 block">{formatCurrency(data.avgLosingTrade)}</span>
              <span className="text-[10px] text-slate-400">per losing trade</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Largest Win</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(data.largestWinningTrade)}</span>
              <span className="text-[10px] text-slate-400">single best trade</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Largest Loss</span>
              <span className="text-xl font-bold text-rose-600 mt-1 block">{formatCurrency(data.largestLosingTrade)}</span>
              <span className="text-[10px] text-slate-400">single worst trade</span>
            </div>
          </div>

          {/* Long vs Short Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                  Long Trades (Buy)
                </span>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(data.longTradesPnl)}</h4>
                <p className="text-xs text-slate-500">
                  {data.longTradesCount} trades • <span className="font-semibold text-emerald-600">{data.longWinRate}% win rate</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800">
                  Short Trades (Sell)
                </span>
                <h4 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(data.shortTradesPnl)}</h4>
                <p className="text-xs text-slate-500">
                  {data.shortTradesCount} trades • <span className="font-semibold text-rose-600">{data.shortWinRate}% win rate</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Daily Trading Heatmap / Calendar Matrix */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Trading Session Heatmap Calendar</h3>
                <p className="text-xs text-slate-400">Green indicates profitable sessions, red indicates drawdowns</p>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {data.calendarHeatmap && data.calendarHeatmap.length > 0 ? (
                data.calendarHeatmap.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center transition-transform hover:scale-105 cursor-default ${
                      day.netPnl > 0
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : day.netPnl < 0
                          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold block opacity-70">{day.date}</span>
                    <span className="text-xs font-extrabold mt-1 block">
                      {formatCurrency(day.netPnl)}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 block mt-0.5">
                      {day.tradeCount} trade{day.tradeCount > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-xs text-slate-400">No trading calendar sessions</div>
              )}
            </div>
          </div>

          {/* Performance by Strategy & Instrument Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Strategy Table */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Performance by Strategy
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2">Strategy</th>
                      <th className="py-2 px-2 text-center">Trades</th>
                      <th className="py-2 px-2 text-center">Win Rate</th>
                      <th className="py-2 px-2 text-right">Net P/L</th>
                      <th className="py-2 px-2 text-right">Avg P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.strategyPerformance && data.strategyPerformance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-bold text-slate-800">{item.strategy}</td>
                        <td className="py-2.5 px-2 text-center">{item.count}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-blue-600">{item.winRate}%</td>
                        <td className={`py-2.5 px-2 text-right font-bold ${item.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(item.netPnl)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">{formatCurrency(item.avgPnl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instrument Table */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Performance by Instrument
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2">Instrument</th>
                      <th className="py-2 px-2 text-center">Trades</th>
                      <th className="py-2 px-2 text-center">Win Rate</th>
                      <th className="py-2 px-2 text-right">Net P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.instrumentPerformance && data.instrumentPerformance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-bold text-slate-800">{item.instrument}</td>
                        <td className="py-2.5 px-2 text-center">{item.count}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-blue-600">{item.winRate}%</td>
                        <td className={`py-2.5 px-2 text-right font-bold ${item.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(item.netPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Cumulative Curve Full Width */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Cumulative Equity Realization</h3>
            <p className="text-xs text-slate-400 mb-4">Step-by-step account growth through disciplined trade journaling</p>
            <div className="h-64 w-full">
              {data.cumulativeCurve && data.cumulativeCurve.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.cumulativeCurve}>
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                    <Tooltip formatter={(val) => [formatCurrency(val), 'Cumulative P/L']} />
                    <Area type="monotone" dataKey="cumulativePnl" stroke="#059669" strokeWidth={2.5} fill="url(#curveGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No closed trade curve data</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
