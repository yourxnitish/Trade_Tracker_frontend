import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Award,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  BookOpen,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import StatCard from '../components/StatCard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();
  const [period, setPeriod] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = { period };
      if (period === 'CUSTOM' && customStart && customEnd) {
        params.customStart = customStart;
        params.customEnd = customEnd;
      }
      const res = await dashboardApi.getSummary(params);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'CUSTOM' || (customStart && customEnd)) {
      fetchDashboard();
    }
  }, [period, customStart, customEnd]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">CONNECTING TO TRADING TERMINAL...</p>
        </div>
      </div>
    );
  }

  const hasTrades = data && data.totalTrades > 0;
  const isNetPositive = data && data.totalRealizedPnl >= 0;

  const winLossData = data && hasTrades ? [
    { name: 'Wins', value: Number(data.winningTrades || 0), color: '#10b981' },
    { name: 'Losses', value: Number(data.losingTrades || 0), color: '#ef4444' },
    { name: 'Breakeven', value: Number(data.breakevenTrades || 0), color: '#64748b' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Trading Performance Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            LIVE ANALYTICS • REAL-TIME P/L • DATABASE SYNCED
          </p>
        </div>

        {/* Period Selector in Trading Terminal Style */}
        <div className="flex flex-wrap items-center gap-2">
          {['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_YEAR', 'ALL', 'CUSTOM'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                period === p
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-[#0f1726] text-slate-400 border border-[#1e293b] hover:text-white hover:border-slate-600'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
          <button
            onClick={fetchDashboard}
            className="p-1.5 rounded-xl bg-[#0f1726] border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600"
            title="Refresh Terminal"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Inputs */}
      {period === 'CUSTOM' && (
        <div className="flex items-center gap-3 bg-[#0f1726] p-3 rounded-2xl border border-[#1e293b] w-fit">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-slate-400">From:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <span className="text-xs font-medium text-slate-400">To:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="text-xs p-1.5 bg-[#080c14] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      )}

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Account Balance"
          value={formatCurrency(data?.currentBalance || 100000)}
          subValue={`Starting Baseline: ${formatCurrency(data?.startingBalance || 100000)}`}
          icon={DollarSign}
          colorScheme="green"
        />
        <StatCard
          title="Realized Net P/L"
          value={formatCurrency(data?.totalRealizedPnl || 0)}
          subValue={hasTrades ? `${data.closedTrades} closed trades` : 'Clean Slate (0 Trades)'}
          icon={isNetPositive ? TrendingUp : TrendingDown}
          colorScheme={!hasTrades ? 'green' : isNetPositive ? 'green' : 'red'}
          badgeText={!hasTrades ? 'READY' : isNetPositive ? 'PROFIT' : 'DRAWDOWN'}
        />
        <StatCard
          title="Win Rate"
          value={hasTrades ? `${data.winRate}%` : '0.00%'}
          subValue={hasTrades ? `${data.winningTrades}W - ${data.losingTrades}L (${data.breakevenTrades} BE)` : '0 closed trades'}
          icon={PieIcon}
          colorScheme={data?.winRate >= 50 ? 'green' : 'red'}
        />
        <StatCard
          title="Profit Factor"
          value={hasTrades ? (data.profitFactor > 50 ? '∞ (No Loss)' : Number(data.profitFactor).toFixed(2)) : '0.00'}
          subValue={`Total fees: ${formatCurrency(data?.totalCharges || 0)}`}
          icon={Activity}
          colorScheme={data?.profitFactor >= 1.5 ? 'green' : 'red'}
        />
      </div>

      {!hasTrades ? (
        /* Fresh Empty State with Dark Terminal Glow */
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0f1726] to-[#0a0f1a] rounded-3xl p-8 border border-emerald-500/20 shadow-2xl text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>
            
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 mb-4">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            
            <h2 className="text-xl font-black text-white tracking-tight">Terminal Ready: Start Logging Your Trades</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Your personal journal database is initialized and clean. All charts, win rate calculations, risk/reward metrics, and notebook reflections will calculate automatically from the trades you enter.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/add-trade')}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                <PlusCircle className="w-4 h-4 mr-2 stroke-[2.5]" />
                Record Trade Entry
              </button>
              <button
                onClick={() => navigate('/daily-journal')}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0b101b] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                <BookOpen className="w-4 h-4 mr-2 text-emerald-400" />
                Physical Notebook View
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0b101b] border border-[#1e293b] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                Account Capital
              </button>
            </div>
          </div>

          {/* Quick Guide Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] text-emerald-400">1</span>
                <span>Configure Capital</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set your exact starting balance and currency in Settings to calibrate equity curves.
              </p>
            </div>

            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] text-emerald-400">2</span>
                <span>Execute & Journal</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log Long or Short trades with live P/L preview, stop-loss, target, and strategy details.
              </p>
            </div>

            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase font-mono">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[11px] text-rose-400">3</span>
                <span>Audit & Eliminate Mistakes</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review your session reflections, profit factors, and streaks to master psychological edge.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Secondary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Trades</span>
              <span className="text-lg font-black text-white mt-0.5 block">{data.totalTrades}</span>
              <span className="text-[10px] text-emerald-400 font-medium">{data.openTrades} open</span>
            </div>
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brokerage Paid</span>
              <span className="text-lg font-black text-slate-300 mt-0.5 block">{formatCurrency(data.totalBrokerage)}</span>
              <span className="text-[10px] text-slate-500">Other: {formatCurrency(data.totalOtherCharges)}</span>
            </div>
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Win</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">{formatCurrency(data.avgProfitWinningTrade)}</span>
              <span className="text-[10px] text-emerald-500/70">per winning trade</span>
            </div>
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Loss</span>
              <span className="text-lg font-black text-rose-400 mt-0.5 block">{formatCurrency(data.avgLossLosingTrade)}</span>
              <span className="text-[10px] text-rose-500/70">per losing trade</span>
            </div>
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best Trade</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">
                {data.bestTrade ? formatCurrency(data.bestTrade.netPnl) : '-'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {data.bestTrade ? data.bestTrade.symbol : 'None'}
              </span>
            </div>
            <div className="bg-[#0f1726] p-3.5 rounded-2xl border border-[#1e293b] text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Worst Trade</span>
              <span className="text-lg font-black text-rose-400 mt-0.5 block">
                {data.worstTrade ? formatCurrency(data.worstTrade.netPnl) : '-'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {data.worstTrade ? data.worstTrade.symbol : 'None'}
              </span>
            </div>
          </div>

          {/* Interactive Chart Row 1: Daily P/L & Cumulative P/L */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Profit / Loss Bar Chart */}
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Daily Realized P/L</h3>
                  <p className="text-xs text-slate-400">Green for profits • Red for losses</p>
                </div>
                <BarChart2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="h-64 w-full">
                {data.dailyPnlList && data.dailyPnlList.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyPnlList} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2333" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Net P/L']}
                        contentStyle={{ backgroundColor: '#080c14', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                        {data.dailyPnlList.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">NO SESSION DATA</div>
                )}
              </div>
            </div>

            {/* Cumulative Realized P/L Area Chart */}
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Cumulative Equity Realization</h3>
                  <p className="text-xs text-slate-400">Equity curve across closed trades</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="h-64 w-full">
                {data.cumulativePnlList && data.cumulativePnlList.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.cumulativePnlList} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pnlGradDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2333" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Cumulative P/L']}
                        contentStyle={{ backgroundColor: '#080c14', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="cumulativePnl" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#pnlGradDark)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">NO EQUITY CURVE DATA</div>
                )}
              </div>
            </div>

          </div>

          {/* Interactive Chart Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Monthly Profit/Loss */}
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-1">Monthly P/L</h3>
              <p className="text-xs text-slate-400 mb-4">Breakdown by calendar month</p>
              <div className="h-56 w-full">
                {data.monthlyPnlList && data.monthlyPnlList.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyPnlList}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a2333" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Net P/L']}
                        contentStyle={{ backgroundColor: '#080c14', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {data.monthlyPnlList.map((entry, index) => (
                          <Cell key={`cell-m-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">NO MONTHLY DATA</div>
                )}
              </div>
            </div>

            {/* Win vs Loss Distribution */}
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-1">Win / Loss Ratio</h3>
              <p className="text-xs text-slate-400 mb-4">Closed trade outcomes distribution</p>
              <div className="h-56 w-full flex items-center justify-center">
                {winLossData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winLossData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {winLossData.map((entry, index) => (
                          <Cell key={`cell-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [`${val} trades`, name]}
                        contentStyle={{ backgroundColor: '#080c14', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px', color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500 font-mono">NO TRADES RECORDED</div>
                )}
              </div>
            </div>

            {/* Performance by Instrument */}
            <div className="bg-[#0f1726] p-5 rounded-2xl border border-[#1e293b] shadow-xl">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">P/L by Instrument</h3>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mb-4">Top contributors to your P/L</p>
              <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
                {data.pnlByInstrument && data.pnlByInstrument.length > 0 ? (
                  data.pnlByInstrument.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#080c14] border border-[#1e293b]">
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[120px]">
                          {item.instrument}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.count} trades • {item.winRate}% win
                        </span>
                      </div>
                      <span className={`text-xs font-bold font-mono ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(item.pnl)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 font-mono text-center py-8">NO INSTRUMENT DATA</div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
