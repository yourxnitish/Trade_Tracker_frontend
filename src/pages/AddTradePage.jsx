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
  HelpCircle,
  Clock,
  Calendar,
  Sparkles
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
    emotionalStateAfter: 'Satisfied',
    mistakes: '',
    lessonsLearned: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Auto populate if converted from watchlist or editing
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
            emotionalStateAfter: t.emotionalStateAfter || 'Satisfied',
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
      // Check query params for watchlist convert
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

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Live PnL & Risk/Reward Calculations
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

  // Submit Handler
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? `Edit Trade #${id}` : 'Record New Trade'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isEditMode ? 'Update historical parameters and notes' : 'Enter trade details for analysis and automated journal tracking'}
            </p>
          </div>
        </div>

        {/* Live Net Preview Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-semibold text-xs shadow-sm bg-white border-slate-200">
          <span className="text-slate-500">Live Net P/L:</span>
          <span className={`font-bold ${metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(metrics.netPnl)}
          </span>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>Trade successfully saved to database! Redirecting...</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Date *</label>
              <input
                type="date"
                name="tradeDate"
                required
                value={formData.tradeDate}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Time</label>
              <input
                type="time"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exit Time</label>
              <input
                type="time"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exchange</label>
              <select
                name="exchange"
                value={formData.exchange}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instrument Name *</label>
              <input
                type="text"
                name="instrumentName"
                required
                placeholder="e.g. Reliance Industries"
                value={formData.instrumentName}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trading Symbol *</label>
              <input
                type="text"
                name="symbol"
                required
                placeholder="e.g. RELIANCE"
                value={formData.symbol}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Segment</label>
              <select
                name="segment"
                value={formData.segment}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Status *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'CLOSED' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formData.status === 'CLOSED'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'OPEN' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formData.status === 'OPEN'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  OPEN
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direction *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'LONG' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formData.direction === 'LONG'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'SHORT' }))}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    formData.direction === 'SHORT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Trade Execution & Price Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              2. Trade Pricing & Live P/L Calculation
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Auto calculated</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Price *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                name="entryPrice"
                placeholder="0.00"
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exit Price {formData.status === 'CLOSED' ? '*' : '(Optional for Open)'}
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
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                name="quantity"
                placeholder="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Price</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="targetPrice"
                placeholder="Planned target"
                value={formData.targetPrice}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stop Loss (SL)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="stopLoss"
                placeholder="Planned stop loss"
                value={formData.stopLoss}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brokerage</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="brokerage"
                placeholder="20.00"
                value={formData.brokerage}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Other Charges (STT, GST)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="otherCharges"
                placeholder="5.00"
                value={formData.otherCharges}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trading Strategy</label>
              <input
                type="text"
                name="strategy"
                placeholder="e.g. Breakout, Pullback, CPR"
                value={formData.strategy}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Live Realized Net P/L</span>
              <span className={`text-2xl font-bold tracking-tight ${metrics.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formData.status === 'OPEN' ? 'Holding Open' : formatCurrency(metrics.netPnl)}
              </span>
              {formData.status === 'CLOSED' && (
                <span className="text-xs text-slate-400 block mt-0.5">
                  Gross: {formatCurrency(metrics.grossPnl)} • Charges: {formatCurrency((parseFloat(formData.brokerage) || 0) + (parseFloat(formData.otherCharges) || 0))}
                </span>
              )}
            </div>

            <div className="flex gap-4 sm:gap-6 text-xs border-l border-slate-700 pl-4 sm:pl-6">
              <div>
                <span className="text-slate-400 block">Risk Amount:</span>
                <span className="font-bold text-rose-400">{formatCurrency(metrics.riskAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reward Amount:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(metrics.rewardAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Planned R:R:</span>
                <span className="font-bold text-blue-400">{metrics.rrRatio ? `1 : ${metrics.rrRatio}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Psychology, Reflection & Learnings (From Physical Notebook) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            3. Qualitative Reflection & Trading Psychology
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Market Conditions</label>
              <select
                name="marketConditions"
                value={formData.marketConditions}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Trending Bullish">Trending Bullish</option>
                <option value="Trending Bearish">Trending Bearish</option>
                <option value="Sideways / Range-bound">Sideways / Range-bound</option>
                <option value="High Volatility">High Volatility</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emotional State Before Trade</label>
              <select
                name="emotionalStateBefore"
                value={formData.emotionalStateBefore}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Calm & Disciplined">Calm & Disciplined</option>
                <option value="Confident Setup">Confident Setup</option>
                <option value="Anxious / Hesitant">Anxious / Hesitant</option>
                <option value="FOMO (Fear of Missing Out)">FOMO (Fear of Missing Out)</option>
                <option value="Revenge Trading">Revenge Trading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emotional State After Trade</label>
              <select
                name="emotionalStateAfter"
                value={formData.emotionalStateAfter}
                onChange={handleChange}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Entering</label>
              <textarea
                name="entryReason"
                rows={2}
                placeholder="Technical trigger, chart pattern, volume confirmation..."
                value={formData.entryReason}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Exiting</label>
              <textarea
                name="exitReason"
                rows={2}
                placeholder="Target hit, trailing stop-loss, reversal sign, time of day..."
                value={formData.exitReason}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mistakes Made (if any)</label>
              <textarea
                name="mistakes"
                rows={2}
                placeholder="Entered prematurely, moved stop-loss, oversized position..."
                value={formData.mistakes}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lessons Learned</label>
              <textarea
                name="lessonsLearned"
                rows={2}
                placeholder="Actionable takeaway for future trades..."
                value={formData.lessonsLearned}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional thoughts or general observations..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : isEditMode ? 'Update Trade' : 'Save Trade Record'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddTradePage;
