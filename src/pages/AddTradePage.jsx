import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { tradesApi } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const AddTradePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { formatCurrency } = useSettings();
  const isEditMode = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    entryTime: new Date().toTimeString().slice(0, 5),
    exitTime: '',
    instrumentName: '',
    symbol: '',
    exchange: 'NSE',
    segment: 'Equity',
    direction: 'LONG',
    status: 'CLOSED',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    targetPrice: '',
    stopLoss: '',
    brokerage: '20.00',
    otherCharges: '5.00',
    strategy: '',
    entryReason: '',
    exitReason: '',
    marketConditions: 'Normal',
    emotionalStateBefore: 'Calm & Disciplined',
    emotionalStateAfter: 'Satisfied with Execution',
    mistakes: '',
    lessonsLearned: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      tradesApi.getTradeById(id)
        .then(res => {
          const t = res.data;
          setFormData({
            tradeDate: t.tradeDate || '',
            entryTime: t.entryTime ? t.entryTime.slice(0, 5) : '',
            exitTime: t.exitTime ? t.exitTime.slice(0, 5) : '',
            instrumentName: t.instrumentName || '',
            symbol: t.symbol || '',
            exchange: t.exchange || 'NSE',
            segment: t.segment || 'Equity',
            direction: t.direction || 'LONG',
            status: t.status || 'CLOSED',
            entryPrice: t.entryPrice || '',
            exitPrice: t.exitPrice || '',
            quantity: t.quantity || '',
            targetPrice: t.targetPrice || '',
            stopLoss: t.stopLoss || '',
            brokerage: t.brokerage || '0.00',
            otherCharges: t.otherCharges || '0.00',
            strategy: t.strategy || '',
            entryReason: t.entryReason || '',
            exitReason: t.exitReason || '',
            marketConditions: t.marketConditions || 'Normal',
            emotionalStateBefore: t.emotionalStateBefore || 'Calm & Disciplined',
            emotionalStateAfter: t.emotionalStateAfter || 'Satisfied with Execution',
            mistakes: t.mistakes || '',
            lessonsLearned: t.lessonsLearned || '',
            notes: t.notes || '',
          });
        })
        .catch(err => {
          setError('Failed to fetch trade details for editing.');
        })
        .finally(() => setFetching(false));
    } else {
      const sym = searchParams.get('symbol');
      const inst = searchParams.get('instrumentName');
      const ex = searchParams.get('exchange');
      const plannedEntry = searchParams.get('plannedEntryPrice');
      const target = searchParams.get('targetPrice');
      const sl = searchParams.get('stopLoss');
      const strat = searchParams.get('strategy');

      if (sym || inst) {
        setFormData(prev => ({
          ...prev,
          symbol: sym || prev.symbol,
          instrumentName: inst || prev.instrumentName,
          exchange: ex || prev.exchange,
          entryPrice: plannedEntry || prev.entryPrice,
          targetPrice: target || prev.targetPrice,
          stopLoss: sl || prev.stopLoss,
          strategy: strat || prev.strategy,
        }));
      }
    }
  }, [id, isEditMode, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateLiveMetrics = () => {
    const entry = parseFloat(formData.entryPrice) || 0;
    const exit = parseFloat(formData.exitPrice) || 0;
    const qty = parseFloat(formData.quantity) || 0;
    const brok = parseFloat(formData.brokerage) || 0;
    const other = parseFloat(formData.otherCharges) || 0;
    const target = parseFloat(formData.targetPrice) || 0;
    const sl = parseFloat(formData.stopLoss) || 0;
    const isLong = formData.direction === 'LONG';
    const isClosed = formData.status === 'CLOSED';

    let grossPnl = 0;
    let netPnl = 0;

    if (isClosed && entry > 0 && exit > 0 && qty > 0) {
      grossPnl = isLong ? (exit - entry) * qty : (entry - exit) * qty;
      netPnl = grossPnl - brok - other;
    }

    let riskAmount = 0;
    let rewardAmount = 0;
    let rrRatio = 0;

    if (entry > 0 && qty > 0 && target > 0 && sl > 0) {
      if (isLong) {
        riskAmount = Math.abs(entry - sl) * qty;
        rewardAmount = Math.abs(target - entry) * qty;
      } else {
        riskAmount = Math.abs(sl - entry) * qty;
        rewardAmount = Math.abs(entry - target) * qty;
      }

      if (riskAmount > 0) {
        rrRatio = (rewardAmount / riskAmount).toFixed(2);
      }
    }

    return {
      grossPnl,
      netPnl,
      riskAmount,
      rewardAmount,
      rrRatio,
    };
  };

  const metrics = calculateLiveMetrics();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: formData.status === 'CLOSED' && formData.exitPrice ? parseFloat(formData.exitPrice) : null,
        quantity: parseFloat(formData.quantity),
        targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : null,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        brokerage: formData.brokerage ? parseFloat(formData.brokerage) : 0,
        otherCharges: formData.otherCharges ? parseFloat(formData.otherCharges) : 0,
      };

      if (isEditMode) {
        await tradesApi.updateTrade(id, payload);
      } else {
        await tradesApi.createTrade(payload);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/trades');
      }, 1000);
    } catch (err) {
      console.error('Save trade error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save trade. Please check required fields.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-[#0f1726] border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{isEditMode ? `Edit Trade Entry #${id}` : 'Record New Trade Entry'}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                formData.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {formData.direction}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              REAL-TIME RISK/REWARD ENGINE • LIVE GROSS/NET AUDIT
            </p>
          </div>
        </div>

        {/* Live Net Preview Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs bg-[#0f1726] border-[#1e293b]">
          <span className="text-slate-400">Live P/L:</span>
          <span className={metrics.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {formatCurrency(metrics.netPnl)}
          </span>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>Trade successfully saved to database! Redirecting...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Basic Information */}
        <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            1. Trade Identifier & Direction
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trade Date *</label>
              <input
                type="date"
                name="tradeDate"
                required
                value={formData.tradeDate}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Entry Time</label>
              <input
                type="time"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Exit Time</label>
              <input
                type="time"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Exchange</label>
              <select
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="MCX">MCX</option>
                <option value="NASDAQ">NASDAQ</option>
                <option value="NYSE">NYSE</option>
                <option value="FOREX">FOREX</option>
                <option value="CRYPTO">CRYPTO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trading Symbol *</label>
              <input
                type="text"
                name="symbol"
                required
                placeholder="e.g. RELIANCE, NIFTY"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 uppercase font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Instrument Name *</label>
              <input
                type="text"
                name="instrumentName"
                required
                placeholder="e.g. Reliance Industries"
                value={formData.instrumentName}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Segment</label>
              <select
                name="segment"
                value={formData.segment}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Equity">Equity</option>
                <option value="Intraday">Intraday</option>
                <option value="Futures">Futures</option>
                <option value="Options">Options</option>
                <option value="Commodity">Commodity</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trade Status *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'CLOSED' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all font-mono ${
                    formData.status === 'CLOSED'
                      ? 'bg-slate-700 text-white border-slate-500'
                      : 'bg-[#080c14] text-slate-400 border-[#1e293b]'
                  }`}
                >
                  CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'OPEN' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all font-mono ${
                    formData.status === 'OPEN'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-[#080c14] text-slate-400 border-[#1e293b]'
                  }`}
                >
                  OPEN
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Direction (Buy / Sell) *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'LONG' }))}
                  className={`py-2.5 text-xs font-black rounded-xl border transition-all font-mono flex items-center justify-center gap-1.5 ${
                    formData.direction === 'LONG'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/30'
                      : 'bg-[#080c14] text-slate-400 border-[#1e293b] hover:border-emerald-500/50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 stroke-[3]" />
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'SHORT' }))}
                  className={`py-2.5 text-xs font-black rounded-xl border transition-all font-mono flex items-center justify-center gap-1.5 ${
                    formData.direction === 'SHORT'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                      : 'bg-[#080c14] text-slate-400 border-[#1e293b] hover:border-rose-500/50'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 stroke-[3]" />
                  SELL / SHORT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trade Execution & Price Details */}
        <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              2. Execution Prices & Live Financial Preview
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Calculator className="w-4 h-4" />
              <span>DYNAMIC FORMULA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Entry Price *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                name="entryPrice"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Exit Price {formData.status === 'CLOSED' ? '*' : '(Holding Position)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required={formData.status === 'CLOSED'}
                name="exitPrice"
                placeholder={formData.status === 'OPEN' ? 'Holding Open' : '0.00'}
                value={formData.exitPrice}
                onChange={handleChange}
                disabled={formData.status === 'OPEN'}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono font-bold disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                name="quantity"
                placeholder="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Price</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="targetPrice"
                placeholder="Planned Target"
                value={formData.targetPrice}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Stop Loss (SL)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="stopLoss"
                placeholder="Risk SL"
                value={formData.stopLoss}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Brokerage</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="brokerage"
                placeholder="20.00"
                value={formData.brokerage}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Other Fees (STT/GST)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="otherCharges"
                placeholder="5.00"
                value={formData.otherCharges}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Trading Strategy</label>
              <input
                type="text"
                name="strategy"
                placeholder="e.g. VWAP Breakout, Retest"
                value={formData.strategy}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Terminal Live Calculation Glow Banner */}
          <div className="mt-4 p-5 rounded-2xl bg-[#080c14] border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                Live Net Realized P/L
              </span>
              <span className={`text-3xl font-black font-mono tracking-tight ${
                metrics.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formData.status === 'OPEN' ? 'Holding Open' : formatCurrency(metrics.netPnl)}
              </span>
              {formData.status === 'CLOSED' && (
                <span className="text-xs text-slate-400 font-mono block mt-1">
                  Gross: <span className="text-slate-200">{formatCurrency(metrics.grossPnl)}</span> • Total Fees: <span className="text-slate-200">{formatCurrency((parseFloat(formData.brokerage) || 0) + (parseFloat(formData.otherCharges) || 0))}</span>
                </span>
              )}
            </div>

            <div className="flex gap-4 sm:gap-6 text-xs font-mono border-l border-[#1e293b] pl-4 sm:pl-6">
              <div>
                <span className="text-slate-400 block text-[10px]">Risk Amount</span>
                <span className="font-bold text-rose-400 text-sm">{formatCurrency(metrics.riskAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reward Amount</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(metrics.rewardAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Planned R:R</span>
                <span className="font-bold text-blue-400 text-sm">{metrics.rrRatio ? `1 : ${metrics.rrRatio}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Psychology & Qualitative Review */}
        <div className="bg-[#0f1726] rounded-3xl p-6 border border-[#1e293b] shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            3. Qualitative Reflection & Trading Psychology
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Market Conditions</label>
              <select
                name="marketConditions"
                value={formData.marketConditions}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Trending Bullish">Trending Bullish</option>
                <option value="Trending Bearish">Trending Bearish</option>
                <option value="Sideways / Range-bound">Sideways / Range-bound</option>
                <option value="High Volatility">High Volatility</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Emotional State Before</label>
              <select
                name="emotionalStateBefore"
                value={formData.emotionalStateBefore}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Calm & Disciplined">Calm & Disciplined</option>
                <option value="Confident Setup">Confident Setup</option>
                <option value="Anxious / Hesitant">Anxious / Hesitant</option>
                <option value="FOMO (Fear of Missing Out)">FOMO</option>
                <option value="Revenge Trading">Revenge Trading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Emotional State After</label>
              <select
                name="emotionalStateAfter"
                value={formData.emotionalStateAfter}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Satisfied with Execution">Satisfied with Execution</option>
                <option value="Relieved">Relieved</option>
                <option value="Frustrated with Error">Frustrated with Error</option>
                <option value="Regretful">Regretful</option>
                <option value="Greedy">Greedy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Entering</label>
              <textarea
                name="entryReason"
                rows={2}
                placeholder="Technical trigger, chart pattern, volume confirmation..."
                value={formData.entryReason}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Exiting</label>
              <textarea
                name="exitReason"
                rows={2}
                placeholder="Target hit, trailing stop-loss, reversal sign..."
                value={formData.exitReason}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mistakes Made (if any)</label>
              <textarea
                name="mistakes"
                rows={2}
                placeholder="Moved stop-loss, oversized position, early exit..."
                value={formData.mistakes}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Lessons Learned</label>
              <textarea
                name="lessonsLearned"
                rows={2}
                placeholder="Actionable takeaway for future trades..."
                value={formData.lessonsLearned}
                onChange={handleChange}
                className="w-full text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Personal Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional thoughts or general observations..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full text-sm p-3 bg-[#080c14] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 bg-[#0f1726] border border-[#1e293b] hover:text-white hover:border-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2 stroke-[2.5]" />
            {loading ? 'Recording...' : isEditMode ? 'Update Trade Record' : 'Save Trade to Database'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddTradePage;
