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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instrument, setInstrument] = useState('ALL');
  const [strategy, setStrategy] = useState('ALL');

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
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">COMPUTING STATISTICAL DISTRIBUTIONS...</p>
        </div>
      </div>
    );
  }

  const hasData = data && data.closedTrades > 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Performance & Strategy Analytics</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            CALENDAR MATRIX HEATMAP • WIN/LOSS STREAKS • STRATEGY RANKINGS
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0f1726] p-2 rounded-2xl border border-[#1e293b] font-mono">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />

          <select
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Instruments</option>
            {instrumentsList.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Strategies</option>
            {strategiesList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 rounded-lg border border-[#1e293b] hover:bg-slate-800 text-slate-300"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          title="No closed trades recorded yet"
          description="Log closed trades with entry and exit prices to view detailed performance metrics, calendar heatmaps, and streak ratios."
        />
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Realized Net Profit"
              value={formatCurrency(data.totalRealizedNetPnl)}
              subValue={`Total fees: ${formatCurrency(data.totalCharges)}`}
              icon={data.totalRealizedNetPnl >= 0 ? TrendingUp : TrendingDown}
              colorScheme={data.totalRealizedNetPnl >= 0 ? 'green' : 'red'}
            />
            <StatCard
              title="Win Percentage"
              value={`${data.winRate}%`}
              subValue={`${data.closedTrades} closed trades`}
              icon={PieIcon}
              colorScheme="green"
            />
            <StatCard
              title="Profit Factor"
              value={data.profitFactor > 50 ? '∞' : Number(data.profitFactor).toFixed(2)}
              subValue={data.profitFactor >= 1.5 ? 'Strong Edge' : 'Needs Optimization'}
              icon={Target}
              colorScheme={data.profitFactor >= 1.5 ? 'green' : 'red'}
            />
            <StatCard
              title="Streak Record"
              value={`${data.maxConsecutiveWins}W / ${data.maxConsecutiveLosses}L`}
              subValue={`Current streak: ${data.currentStreak > 0 ? `+${data.currentStreak} Wins` : `${data.currentStreak} Losses`}`}
              icon={Flame}
              colorScheme="purple"
            />
          </div>

          {/* Trade Size & Outlier Strips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Win</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{formatCurrency(data.avgWinningTrade)}</span>
              <span className="text-[10px] text-slate-500">per winning trade</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Loss</span>
              <span className="text-xl font-black text-rose-400 mt-1 block">{formatCurrency(data.avgLosingTrade)}</span>
              <span className="text-[10px] text-slate-500">per losing trade</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Largest Win</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">{formatCurrency(data.largestWinningTrade)}</span>
              <span className="text-[10px] text-slate-500">single best trade</span>
            </div>

            <div className="bg-[#0f1726] p-4 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Largest Loss</span>
              <span className="text-xl font-black text-rose-400 mt-1 block">{formatCurrency(data.largestLosingTrade)}</span>
              <span className="text-[10px] text-slate-500">single worst trade</span>
            </div>
          </div>

          {/* Long vs Short Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-[#0f1726] p-5 rounded-3xl border border-[#1e293b] shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Long Trades (Buy)
                </span>
                <h4 className="text-2xl font-black text-white mt-1">{formatCurrency(data.longTradesPnl)}</h4>
                <p className="text-xs text-slate-400">
                  {data.longTradesCount} trades • <span className="font-bold text-emerald-400">{data.longWinRate}% win rate</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="bg-[#0f1726] p-5 rounded-3xl border border-[#1e293b] shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Short Trades (Sell)
                </span>
                <h4 className="text-2xl font-black text-white mt-1">{formatCurrency(data.shortTradesPnl)}</h4>
                <p className="text-xs text-slate-400">
                  {data.shortTradesCount} trades • <span className="font-bold text-rose-400">{data.shortWinRate}% win rate</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Daily Trading Heatmap Matrix */}
          <div className="bg-[#0f1726] p-6 rounded-3xl border border-[#1e293b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Trading Session Heatmap Calendar
                </h3>
                <p className="text-xs text-slate-400">Green indicates profitable sessions, Red indicates drawdowns</p>
              </div>
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 font-mono">
              {data.calendarHeatmap && data.calendarHeatmap.length > 0 ? (
                data.calendarHeatmap.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center transition-transform hover:scale-105 cursor-default ${
                      day.netPnl > 0
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : day.netPnl < 0
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                          : 'bg-[#080c14] border-[#1e293b] text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-bold block opacity-70">{day.date}</span>
                    <span className="text-xs font-black mt-1 block">
                      {formatCurrency(day.netPnl)}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 block mt-0.5">
                      {day.tradeCount} trade{day.tradeCount > 1 ? 's' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-xs text-slate-500 font-mono">NO SESSIONS RECORDED</div>
              )}
            </div>
          </div>

          {/* Performance by Strategy & Instrument Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
            <div className="bg-[#0f1726] p-5 rounded-3xl border border-[#1e293b] shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Performance by Strategy
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2 font-sans">Strategy</th>
                      <th className="py-2 px-2 text-center">Trades</th>
                      <th className="py-2 px-2 text-center">Win %</th>
                      <th className="py-2 px-2 text-right">Net P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162032]">
                    {data.strategyPerformance && data.strategyPerformance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#131d2e]">
                        <td className="py-2.5 px-2 font-bold text-white font-sans">{item.strategy}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{item.count}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-blue-400">{item.winRate}%</td>
                        <td className={`py-2.5 px-2 text-right font-black ${item.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(item.netPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#0f1726] p-5 rounded-3xl border border-[#1e293b] shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Performance by Instrument
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2 font-sans">Instrument</th>
                      <th className="py-2 px-2 text-center">Trades</th>
                      <th className="py-2 px-2 text-center">Win %</th>
                      <th className="py-2 px-2 text-right">Net P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#162032]">
                    {data.instrumentPerformance && data.instrumentPerformance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#131d2e]">
                        <td className="py-2.5 px-2 font-bold text-white font-sans">{item.instrument}</td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{item.count}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-blue-400">{item.winRate}%</td>
                        <td className={`py-2.5 px-2 text-right font-black ${item.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(item.netPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
