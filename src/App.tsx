/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Percent,
  ShieldAlert,
  Globe,
  RefreshCw,
  Sliders,
  Calendar,
  DollarSign,
  Award,
  Info,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Search,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// Default Alpera tickers list
const DEFAULT_ALPERA_TICKERS = (
  "CSU.TO, ROP, VIT-B.ST, HEXA-B.ST, WKL.AS, TYL, ATCO-A.ST, IP.MI, BEIJ-B.ST, LIAB.ST, " +
  "NIBE-B.ST, MTRS.ST, HEI, TDG, APH, AME, ASSA-B.ST, SWEC-B.ST, AFRY.ST, REJL-B.ST, " +
  "BRO, CDW, ALIF-B.ST, VIMIAN.ST, SECARE.ST, DPLM.L, SITE, FERG, IMCD.AS, INSTAL.ST, " +
  "BRAV.ST, GREEN.ST, ERF.PA, DHR, HLMA.L, INDT.ST, LIFCO-B.ST, ADDT-B.ST, LAGR-B.ST, " +
  "SDIP-B.ST, BERG-B.ST, BEIA-B.ST"
);

interface BacktestMetrics {
  indexTotalReturn: number;
  spTotalReturn: number;
  brkTotalReturn: number;
  googlTotalReturn: number;
  aaplTotalReturn: number;
  indexCAGR: number;
  spCAGR: number;
  brkCAGR: number;
  googlCAGR: number;
  aaplCAGR: number;
  maxDrawdown: number;
  sharpe: number;
  volatility: number;
}

interface PerformancePoint {
  date: string;
  "Serial Acquirers": number;
  "S&P 500": number;
  "Berkshire Hathaway": number;
  "Google": number;
  "Apple": number;
}

interface DrawdownPoint {
  date: string;
  "Drawdown": number;
}

interface AnnualReturnItem {
  year: number;
  indexReturn: number;
  spReturn: number;
  brkReturn: number;
  googlReturn: number;
  aaplReturn: number;
}

interface AssetReportItem {
  symbol: string;
  name: string;
  country: string;
  isPremium: boolean;
  startPrice: number;
  startDate: string;
  endPrice: number;
  endDate: string;
  totalReturn: number;
  finalWeight: number;
}

interface BacktestResults {
  datesCount: number;
  metrics: BacktestMetrics;
  performanceSeries: PerformancePoint[];
  drawdownSeries: DrawdownPoint[];
  annualReturns: AnnualReturnItem[];
  assetReports: AssetReportItem[];
  geoBreakdownData: { name: string; value: number }[];
  weightingModelConfig: "equal" | "premium";
  startDateActual: string;
  endDateActual: string;
}

export default function App() {
  // Config state
  const [tickersInput, setTickersInput] = useState(DEFAULT_ALPERA_TICKERS);
  const [weightingStrategy, setWeightingStrategy] = useState<"equal" | "premium">("premium");
  const [startDate, setStartDate] = useState("2010-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [scaleType, setScaleType] = useState<"linear" | "log">("log");

  // Query engine statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BacktestResults | null>(null);

  // Asset Table interactive filtering
  const [assetSearch, setAssetSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState<"all" | "premium" | "standard" | "Nordic" | "US_CAN">("all");

  // Layer 1 Lock state: constituent analyzer wall (password: "realworldisreal")
  const [tableUnlocked, setTableUnlocked] = useState(false);
  const [tablePasswordInput, setTablePasswordInput] = useState("");
  const [tablePasswordError, setTablePasswordError] = useState(false);

  // Layer 2 Lock state: company names redacted (password: "itounite" to unlock)
  const [namesUnlocked, setNamesUnlocked] = useState(false);
  const [namesPasswordInput, setNamesPasswordInput] = useState("");
  const [namesPasswordError, setNamesPasswordError] = useState(false);

  const triggerBacktest = async (isInitial = false) => {
    setLoading(true);
    setError(null);
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Split and clean tickers list
        const cleanTickers = tickersInput
          .split(",")
          .map(t => t.trim())
          .filter(t => t.length > 0);

        const response = await fetch("/api/backtest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tickers: cleanTickers,
            startDate,
            endDate,
            weightingStrategy
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `HTTP ${response.status}: Failed to backtest indicators`);
        }

        const resData: BacktestResults = await response.json();
        setResults(resData);
        // Break on successful execution
        break;
      } catch (err: any) {
        attempt++;
        console.warn(`Connection attempt ${attempt} failed:`, err);
        const isNetworkError = err instanceof TypeError || err.message?.includes("Failed to fetch") || err.message?.includes("network");
        
        if (isNetworkError && attempt < maxRetries) {
          // Wait 1.5 seconds before retrying
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          setError(err.message || "An unpredictable connection issue occurred during calculations.");
          break;
        }
      } finally {
        if (attempt >= maxRetries || !error) {
          setLoading(false);
        }
      }
    }
  };

  // Run initial backtest on layout mounting
  useEffect(() => {
    triggerBacktest(true);
  }, []);

  const handleResetTickers = () => {
    setTickersInput(DEFAULT_ALPERA_TICKERS);
  };

  // Format percent utility
  const fmtPct = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return "N/A";
    return (val >= 0 ? "+" : "") + val.toFixed(2) + "%";
  };

  const fmtMtr = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return "0.00";
    return val.toFixed(2);
  };

  // Filtered asset lists
  const filteredAssets = results?.assetReports.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(assetSearch.toLowerCase()) || 
                          asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
                          asset.country.toLowerCase().includes(assetSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (assetFilter === "premium") return asset.isPremium;
    if (assetFilter === "standard") return !asset.isPremium;
    if (assetFilter === "Nordic") return asset.country.includes("Nordic");
    if (assetFilter === "US_CAN") return asset.country === "United States" || asset.country === "Canada";
    return true;
  }) || [];

  // Recharts color list for Country Breakdown (Monochrome scale)
  const COLORS_DONUT = ["#FFFFFF", "#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#3F3F46", "#27272A"];

  const handleApplyPreset = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const isOutOfSync = results && (startDate !== results.startDateActual || endDate !== results.endDateActual);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] font-sans antialiased tech-grid-bg" id="theme-workspace">
      {/* HEADER BAR */}
      <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50" id="top-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-zinc-900 text-white rounded-sm border border-zinc-800">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-[#18181B] flex items-center gap-1.5 font-mono uppercase">
                REAL WORLD INDEX [BENCHMARK]
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[9px] font-semibold font-mono rounded bg-zinc-900 text-white">
                  LIVE_FEED
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Thematic Serial Acquirer Capital Allocation Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-900"></span>
              </span>
              <span className="tracking-widest text-[9px] font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content-area">
        {/* BANNER REVEAL */}
        <div className="bg-white border border-zinc-200 rounded-sm p-6 sm:p-8 text-zinc-900 relative overflow-hidden animate-fade-in" id="dashboard-intro">
          <div className="max-w-4xl relative z-10 space-y-4">

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-mono text-zinc-900">
              REAL WORLD INDEX
            </h2>
            <div className="text-zinc-650 leading-relaxed text-xs sm:text-sm space-y-3 font-sans">
              <p>
                The <strong>Real World Index</strong> is a benchmark index designed to capture the superior returns of the &ldquo;Serial Acquirer&rdquo; business model. By investing in a curated basket of listed serial acquirers, this vehicle provides investors with diversified, liquid exposure to the high-yield private SME (Small and Medium Enterprise) market without the illiquidity or high fees of traditional PE.
              </p>
              <p>
                Through these public holdings, investors gain indirect ownership of over 3,000-10,000 underlying SMEs that are part of the real world economy. This creates a massive diversification effect, mitigating single-company risk.
              </p>
            </div>

            {/* VERY CLEAR DISCLAIMER */}
            <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-sm text-[11px] text-zinc-650 font-mono tracking-wide">
              <span className="text-zinc-900 font-bold uppercase block mb-1">DISCLAIMER</span>
              This page does not constitute an offer or a solicitation of investment. Past performance should not be construed as a guarantee of future performance.
            </div>
          </div>
        </div>

        {/* WORKSPACE SECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="calculator-split">
          
          {/* CONTROL SECTION (COL 4) */}
          <div className="lg:col-span-4 space-y-6" id="backtest-controls-card">
             <div className="bg-white rounded-sm border border-zinc-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2 pb-4 border-b border-zinc-100">
                <Sliders className="w-4 h-4 text-zinc-800" />
                <h3 className="font-bold text-zinc-900 text-xs uppercase tracking-wider font-mono">Parameters Config</h3>
              </div>

              {/* DATE SELECTION WITH ENHANCED PRESETS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-zinc-700" /> TIMEFRAME INTERVALS
                  </h4>
                  {isOutOfSync ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-white font-bold animate-pulse">
                      PENDING RECOMPUTE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-500">
                      SYNCED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-mono uppercase">Start Epoch</label>
                    <input
                      type="date"
                      value={startDate}
                      min="1999-01-01"
                      max="2026-12-31"
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 font-mono uppercase">End Epoch</label>
                    <input
                      type="date"
                      value={endDate}
                      min="2000-01-01"
                      max="2026-12-31"
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden font-mono text-center"
                    />
                  </div>
                </div>

                {/* VISUAL QUICK PRESETS */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest block">Quick Pick Timeframes:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("2000-01-01", "2026-05-28")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Max Time (2000-2026)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("2010-01-01", "2025-12-31")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Decade+ (2010-2025)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("2015-01-01", "2025-12-31")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Mid range (2015-2025)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("2020-01-01", "2026-05-28")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Modern (2020-2026)
                    </button>
                  </div>
                </div>
              </div>

              {/* WEIGHT ADJUSTMENT STRATEGY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Percent className="w-3.5 h-3.5 text-zinc-700" /> WEIGHT MODEL
                  </h4>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setWeightingStrategy("premium")}
                    className={`w-full text-left p-3.5 rounded-sm border transition-all text-xs group relative overflow-hidden ${
                      weightingStrategy === "premium"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white hover:border-zinc-350 text-zinc-650"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-bold font-mono flex items-center gap-1.5 uppercase tracking-wide">
                          Quality Factor Model
                        </div>
                        <p className={`text-[10px] leading-normal ${weightingStrategy === "premium" ? "text-zinc-300" : "text-zinc-500"}`}>
                          Primary compounders (<strong>CSU.TO</strong> &amp; <strong>LIFCO-B.ST</strong>) loaded with 10% premium weight each. Residual split equally.
                        </p>
                      </div>
                      <div className={`mt-0.5 h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                        weightingStrategy === "premium" ? "border-zinc-500 bg-zinc-900" : "border-zinc-300"
                      }`}>
                        {weightingStrategy === "premium" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setWeightingStrategy("equal")}
                    className={`w-full text-left p-3.5 rounded-sm border transition-all text-xs ${
                      weightingStrategy === "equal"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white hover:border-zinc-350 text-zinc-650"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-bold font-mono uppercase tracking-wide">Equal Weighted Matrix</div>
                        <p className={`text-[10px] leading-normal ${weightingStrategy === "equal" ? "text-zinc-300" : "text-zinc-500"}`}>
                          Each individual constituent company assigned exact uniform portions across the entire epoch series.
                        </p>
                      </div>
                      <div className={`mt-0.5 h-3 w-3 rounded-full border flex items-center justify-center shrink-0 ${
                        weightingStrategy === "equal" ? "border-zinc-500 bg-zinc-900" : "border-zinc-300"
                      }`}>
                        {weightingStrategy === "equal" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
                            {/* CONSTITUENTS TEXTAREA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    Constituents ({tickersInput.split(",").filter(t => t.trim()).length} companies)
                  </label>
                  <button
                    onClick={handleResetTickers}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-zinc-400" /> Reset Default
                  </button>
                </div>

                <textarea
                  value={tickersInput}
                  onChange={(e) => setTickersInput(e.target.value)}
                  rows={5}
                  className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden resize-y leading-relaxed"
                  placeholder="Ticker list separated by commas"
                />
              </div>

              {/* EXECUTION CONTROL TRIGGER */}
              <button
                onClick={() => triggerBacktest(false)}
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-sm font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border ${
                  loading
                    ? "bg-zinc-100 text-zinc-405 border-zinc-200 cursor-not-allowed"
                    : "bg-zinc-900 text-white hover:bg-black border-zinc-900 font-heavy cursor-pointer"
                }`}
                id="backtest-trigger-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-450" />
                    <span>Processing Portfolio...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span>COMPUTE ACTIVE MODEL FACTSHEET</span>
                  </>
                )}
              </button>
            </div>

            {/* ERROR CARD */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 rounded p-4 flex items-start space-x-3 text-xs"
              >
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold uppercase tracking-widest font-mono text-red-700">Calculation Error</h5>
                  <p className="text-red-955 select-all font-mono leading-relaxed">{error}</p>
                </div>
              </motion.div>
            )}

            {/* STRATEGY STATS ACCENT */}
            <div className="bg-zinc-50 p-5 rounded-sm border border-zinc-200 text-zinc-650 space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Award className="w-4 h-4 text-zinc-800" /> Index Theory &amp; Setup
              </h4>
              <p className="text-xs text-zinc-650 leading-relaxed">
                Applying a premium base allocation to <span className="font-semibold text-zinc-900">Constellation Software (CSU.TO)</span> and 
                <span className="font-semibold text-zinc-900"> Lifco AB (LIFCO-B.ST)</span> biases weight allocation toward extreme ROIC return drivers. The residual index is spread across all secondary acquirers to offer optimized thematic exposure.
              </p>
              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-[9px] font-mono">
                <span className="text-zinc-500">BASE BENCHMARKS:</span>
                <span className="px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">S&P 500, BRK, GOOGL, AAPL</span>
              </div>
            </div>
          </div>

          {/* MAIN RESULTS CONTAINER (COL 8) */}
          <div className="col-span-1 lg:col-span-8 space-y-8" id="backcalculation-live-report">
            {loading ? (
              <div className="bg-white rounded-sm border border-zinc-200 p-16 flex flex-col items-center justify-center space-y-4 min-h-[500px]" id="loading-spinner-placeholder">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border border-zinc-300 border-t-zinc-900 animate-spin"></div>
                </div>
                <div className="text-center space-y-1 pt-2">
                  <h4 className="text-zinc-900 font-bold text-xs font-mono uppercase tracking-widest">COMPUTING_THEMATIC_INDEX_EXPONENT</h4>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wide leading-relaxed">
                    Aggregating price action, setting factor loads, and standardizing historical dates...
                  </p>
                </div>
              </div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
                id="backtest-factsheet-visuals"
              >
                {/* METRICS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="index-key-metrics-grid">
                  
                  {/* METRIC 1: COMPRESSED STRATEGY RETURN */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Index Total Return</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-900 font-mono tracking-tight">
                        {fmtPct(results.metrics.indexTotalReturn)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">CAGR:</span>
                      <span className="font-bold text-zinc-900">{fmtPct(results.metrics.indexCAGR)}</span>
                    </div>
                  </div>

                  {/* METRIC 2: S&P 500 COMPARATIVE Performance */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm" id="sp500-bench-stats">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">S&P 500 Return</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-800 font-mono tracking-tight">
                        {fmtPct(results.metrics.spTotalReturn)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">CAGR:</span>
                      <span className="font-bold text-zinc-700">{fmtPct(results.metrics.spCAGR)}</span>
                    </div>
                  </div>

                  {/* METRIC 3: MAXIMUM DRAWDOWN (P-to-T) */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm" id="max-risk-stats">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Max Peak-To-Trough</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-805 font-mono tracking-tight">
                        {fmtPct(results.metrics.maxDrawdown)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1 font-mono">
                      <span className="text-zinc-400">MAX_DRAWDOWN</span>
                    </div>
                  </div>

                  {/* METRIC 4: RISK ADJUSTMENTS (SHARPE RATIO) */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm" id="sharpe-efficiency-stats">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Sharpe Ratio</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-900 font-mono tracking-tight">
                        {fmtMtr(results.metrics.sharpe)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">Vol:</span>
                      <span className="font-bold text-zinc-700">{fmtPct(results.metrics.volatility)}</span>
                    </div>
                  </div>
                </div>

                {/* CHART 1: CUMULATIVE OUTPERFORMANCE GRAPH */}
                <div className="bg-white rounded-sm border border-zinc-200 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-zinc-800" />
                        <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider font-mono">Cumulative Growth Performance</h4>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Comparing historical compounding of <strong>$100.00</strong> original asset allocation relative to benchmarks (Epoch: {results.startDateActual} to {results.endDateActual}).
                      </p>
                    </div>

                    <div className="flex items-center bg-zinc-100 border border-zinc-200 p-1 rounded-sm text-[10px] font-mono font-semibold shrink-0" id="scale-type-toggles">
                      <button
                        onClick={() => setScaleType("log")}
                        className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                          scaleType === "log"
                            ? "bg-zinc-900 text-white font-heavy"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        LOGARITHMIC
                      </button>
                      <button
                        onClick={() => setScaleType("linear")}
                        className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                          scaleType === "linear"
                            ? "bg-zinc-900 text-white font-heavy"
                            : "text-zinc-500 hover:text-zinc-900"
                        }`}
                      >
                        LINEAR
                      </button>
                    </div>
                  </div>

                  <div className="h-[400px]" id="cumulative_performance_recharts_container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={results.performanceSeries}
                        margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                        <XAxis
                          dataKey="date"
                          stroke="#71717A"
                          fontSize={10}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#71717A"
                          scale={scaleType === "log" ? "log" : "auto"}
                          domain={scaleType === "log" ? [80, "auto"] : [0, "auto"]}
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(v) => `$${Math.round(v)}`}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "1px",
                            border: "1px solid #D4D4D8",
                            color: "#18181B",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                          }}
                          labelFormatter={(v) => `Date: ${v}`}
                          formatter={(value: any, name: any) => [`$${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "15px", fontFamily: "var(--font-mono)" }} />
                        <Line
                          type="monotone"
                          dataKey="Serial Acquirers"
                          stroke="#18181B"
                          strokeWidth={2.5}
                          dot={false}
                          name="Serial Acquirer Index"
                        />
                        <Line
                          type="monotone"
                          dataKey="S&P 500"
                          stroke="#71717A"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                          name="S&P 500 Index"
                        />
                        <Line
                          type="monotone"
                          dataKey="Berkshire Hathaway"
                          stroke="#0284C7"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          dot={false}
                          name="Berkshire Hathaway"
                        />
                        <Line
                          type="monotone"
                          dataKey="Google"
                          stroke="#EA4335"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          dot={false}
                          name="Google (Alphabet)"
                        />
                        <Line
                          type="monotone"
                          dataKey="Apple"
                          stroke="#16A34A"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          dot={false}
                          name="Apple"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* GRAPH SECTION ROW: ANNUAL RETURNS */}
                <div className="w-full" id="subcharts-double-row">
                  
                  {/* CHART 2: CALENDAR YEAR RETURN */}
                  <div className="bg-white rounded-sm border border-zinc-200 p-6 space-y-4 shadow-sm">
                    <div className="pb-3 border-b border-zinc-100">
                      <h4 className="font-bold text-zinc-900 text-xs flex items-center space-x-2 font-mono uppercase tracking-wider">
                        <TrendingUp className="w-4 h-4 text-zinc-800" />
                        <span>Calendar Year Performance</span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Comparing relative year-by-year performance metrics.
                      </p>
                    </div>

                    <div className="h-[300px]" id="calendar_returns_recharts_container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                           data={results.annualReturns}
                           margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                           <XAxis dataKey="year" fontSize={10} stroke="#71717A" tickLine={false} />
                          <YAxis fontSize={10} stroke="#71717A" tickLine={false} tickFormatter={(v) => `${v}%`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "1px",
                              border: "1px solid #D4D4D8",
                              color: "#18181B",
                              fontSize: "11px",
                              fontFamily: "var(--font-mono)"
                            }}
                            formatter={(value: any, name: any) => [`${parseFloat(value).toFixed(2)}%`, name]}
                          />
                          <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-mono)" }} />
                          <Bar dataKey="indexReturn" name="Serial Acquirers" fill="#18181B" radius={[1, 1, 0, 0]} />
                          <Bar dataKey="spReturn" name="S&P 500" fill="#71717A" radius={[1, 1, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* CHART 4: GEOGRAPHIC CLUSTERING BLOCK */}
                <div className="bg-white rounded-sm border border-zinc-200 p-6 shadow-sm" id="geography-sector">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                          <Globe className="w-4 h-4 text-zinc-800" />
                          <span>Index Geographic Breakdown</span>
                        </h4>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Allocation clustering mapping localized serial acquisition nodes across regions.
                        </p>
                      </div>

                      <div className="space-y-2 font-mono">
                        {results.geoBreakdownData.map((item, index) => {
                          const percentValue = ((item.value / results.assetReports.length) * 100).toFixed(0);
                          return (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-xs opacity-85"
                                  style={{ backgroundColor: COLORS_DONUT[index % COLORS_DONUT.length] }}
                                />
                                <span className="font-medium text-zinc-700">{item.name}</span>
                              </div>
                              <span className="text-zinc-900 text-[10px] bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-xs">
                                {item.value} ({percentValue}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PIE CHART VIZ IN MD ROW COL 8 */}
                    <div className="md:col-span-8 flex justify-center" id="donut_chart_recharts_container">
                      <div className="w-full max-w-[450px] h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={results.geoBreakdownData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={95}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {results.geoBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_DONUT[index % COLORS_DONUT.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "1px",
                                border: "1px solid #D4D4D8",
                                color: "#18181B",
                                fontSize: "11px",
                                fontFamily: "var(--font-mono)"
                              }}
                              formatter={(value: any, name: any) => [`${value} Tickers`, name]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THEMATIC ASSET TABLE REPORT */}
                <div className="bg-white rounded-sm border border-zinc-200 overflow-hidden shadow-sm" id="analytics_table_sector">
                  
                  {!tableUnlocked ? (
                    <div className="p-8 sm:p-16 text-center text-zinc-650 flex flex-col items-center justify-center space-y-6" id="analytics_table_sector_locked">
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm shadow-inner">
                        <TrendingUp className="w-8 h-8 text-zinc-800" />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h4 className="text-zinc-950 font-bold text-xs font-mono tracking-widest uppercase">CONSTITUENT ANALYZER</h4>
                        <p className="text-[11px] text-zinc-550 font-mono leading-relaxed">
                          Individual security asset allocations, country groups, and historic performance weights are secured under structural privacy parameters. Please input password wall access code to decrypt.
                        </p>
                      </div>
                      <form 
                        onSubmit={(e) => {
                           e.preventDefault();
                           if (tablePasswordInput.trim() === "realworldisreal") {
                             setTableUnlocked(true);
                             setTablePasswordError(false);
                           } else {
                             setTablePasswordError(true);
                           }
                        }}
                        className="w-full max-w-xs space-y-3 mx-auto"
                      >
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            placeholder="ENTER PASSWORD WALL..."
                            value={tablePasswordInput}
                            onChange={(e) => {
                              setTablePasswordInput(e.target.value);
                              if (tablePasswordError) setTablePasswordError(false);
                            }}
                            className="flex-1 text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold font-mono tracking-wider border border-zinc-900 hover:bg-black transition-colors uppercase rounded-sm cursor-pointer"
                          >
                            VERIFY
                          </button>
                        </div>
                        {tablePasswordError && (
                          <p className="text-[10px] text-red-600 font-bold font-mono text-center">• INCORRECT ENCRYPTION KEY CODE</p>
                        )}
                      </form>
                    </div>
                  ) : (
                    <>
                      {/* SEARCH AND FILTERS TOOLBAR */}
                      <div className="p-6 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider font-mono">Constituent Performance &amp; Weight Analyzer</h4>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            Tracking allocated asset weight loadings and point-to-point percentage changes.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Search bar */}
                          <div className="relative">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search symbol or cluster..."
                              value={assetSearch}
                              onChange={(e) => setAssetSearch(e.target.value)}
                              className="pl-9 pr-4 py-2 text-xs rounded-sm border border-zinc-200 bg-white text-zinc-950 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden min-w-[180px] font-mono"
                            />
                          </div>

                          {/* Filter selection buttons */}
                          <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-sm p-1 text-xs font-mono font-semibold">
                            <button
                              onClick={() => setAssetFilter("all")}
                              className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                                assetFilter === "all" ? "bg-zinc-900 text-white font-heavy" : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              ALL ({results.assetReports.length})
                            </button>
                            <button
                              onClick={() => setAssetFilter("premium")}
                              className={`px-3 py-1.5 rounded-xs transition-all flex items-center gap-1 cursor-pointer ${
                                assetFilter === "premium" ? "bg-zinc-800 text-white font-heavy" : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              <Award className="w-3.5 h-3.5" /> PREMIUM ({results.assetReports.filter(a => a.isPremium).length})
                            </button>
                            <button
                              onClick={() => setAssetFilter("Nordic")}
                              className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                                assetFilter === "Nordic" ? "bg-zinc-900 text-white font-heavy" : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              NORDICS
                            </button>
                            <button
                              onClick={() => setAssetFilter("US_CAN")}
                              className={`px-3 py-1.5 rounded-xs transition-all cursor-pointer ${
                                assetFilter === "US_CAN" ? "bg-zinc-900 text-white font-heavy" : "text-zinc-500 hover:text-zinc-900"
                              }`}
                            >
                              US/CAN
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* LAYER 2 LOCK HEADER BAR */}
                      <div className="px-6 py-4 bg-zinc-100 border-b border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-600">
                        <div className="flex items-center space-x-2">
                           <span className={`w-2 h-2 rounded-full ${namesUnlocked ? "bg-zinc-900 animate-pulse" : "bg-zinc-300"}`} />
                          <span>
                            {namesUnlocked ? "LEVEL 2 DECRYPTED: All underlying corporate issuer names unlocked." : "LEVEL 2 SECURITIES PROTOCOL: Individual human asset names redacted."}
                          </span>
                        </div>
                        
                        {!namesUnlocked ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (namesPasswordInput.trim() === "itounite") {
                                setNamesUnlocked(true);
                                setNamesPasswordError(false);
                              } else {
                                setNamesPasswordError(true);
                              }
                            }}
                            className="flex items-center space-x-2 w-full md:w-auto"
                          >
                            <div className="relative flex-1 md:flex-initial">
                              <input
                                type="password"
                                placeholder="DECRYPT PASSWORD..."
                                value={namesPasswordInput}
                                onChange={(e) => {
                                  setNamesPasswordInput(e.target.value);
                                  if (namesPasswordError) setNamesPasswordError(false);
                                }}
                                className="w-full md:w-48 text-[11px] bg-white border border-zinc-200 px-3 py-1.5 text-zinc-900 placeholder-zinc-400 rounded-sm focus:outline-hidden focus:border-zinc-500 font-mono text-center"
                              />
                              {namesPasswordError && (
                                <span className="absolute right-2 top-1.5 text-[9px] text-red-650 font-bold uppercase">ERR</span>
                              )}
                            </div>
                            <button
                              type="submit"
                              className="bg-zinc-900 text-white text-[11px] font-bold tracking-wider hover:bg-black px-3 py-1.5 border border-zinc-900 transition-colors rounded-sm uppercase font-mono cursor-pointer shrink-0"
                            >
                              DECRYPT_NAMES
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span className="text-[10px] text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded-xs">CLEARANCE APPROVED</span>
                            <button
                              onClick={() => {
                                setNamesUnlocked(false);
                                setNamesPasswordInput("");
                              }}
                              className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                            >
                              [×] RE-LOCK REDACTION
                            </button>
                          </div>
                        )}
                      </div>

                      {/* GRID TABLE */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 font-mono">
                              <th className="py-3.5 px-6">Company &amp; Ticker</th>
                              <th className="py-3.5 px-4 text-center">Country / Cluster</th>
                              <th className="py-3.5 px-4 text-center">Quality Weight</th>
                              <th className="py-3.5 px-4 text-right font-light">Start Price</th>
                              <th className="py-3.5 px-4 text-right font-light">End Price</th>
                              <th className="py-3.5 px-6 text-right font-bold text-zinc-900">Period Performance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 text-xs font-mono">
                            {filteredAssets.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 px-6 text-center text-zinc-400 font-medium font-mono">
                                  No constituents match the select view filters.
                                </td>
                              </tr>
                            ) : (
                              filteredAssets.map((asset) => (
                                <tr key={asset.symbol} className="hover:bg-zinc-50 border-b border-zinc-100 transition-colors">
                                  <td className="py-4 px-6">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center space-x-2">
                                        <span className={`font-bold font-mono px-2 py-0.5 rounded-xs text-[11px] border ${
                                          namesUnlocked
                                            ? "bg-zinc-900 text-white border-zinc-900"
                                            : "bg-zinc-100 text-zinc-400 border-zinc-200"
                                        }`}>
                                          {namesUnlocked ? asset.symbol : "████"}
                                        </span>
                                        {asset.isPremium ? (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-zinc-900 text-white border border-zinc-900 font-mono">
                                            <Award className="w-2.5 h-2.5" />
                                            <span>10% Premium Allocate</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-zinc-100 text-zinc-500 border border-zinc-200 font-mono">
                                            Standard base equal
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-zinc-600 font-mono text-xs max-w-sm cut-text">
                                        {namesUnlocked ? (
                                          asset.name
                                        ) : (
                                          <span className="text-zinc-300 select-none tracking-wider">███████████████████</span>
                                        )}
                                      </p>
                                    </div>
                                  </td>

                                  <td className="py-4 px-4 text-center text-zinc-500 font-medium">
                                    <span className="text-[11px] font-mono">{asset.country}</span>
                                  </td>

                                  <td className="py-4 px-4 text-center font-mono text-[11px] font-bold text-zinc-900">
                                    {asset.finalWeight > 0 ? (
                                      <span>{asset.finalWeight.toFixed(2)}%</span>
                                    ) : (
                                      <span className="text-zinc-400">Inactive</span>
                                    )}
                                  </td>

                                  <td className="py-4 px-4 text-right font-mono text-[11px] text-zinc-500">
                                    {isNaN(asset.startPrice) ? "N/A" : `$${asset.startPrice.toFixed(2)}`}
                                  </td>

                                  <td className="py-4 px-4 text-right font-mono text-[11px] font-semibold text-zinc-900">
                                    {isNaN(asset.endPrice) ? "N/A" : `$${asset.endPrice.toFixed(2)}`}
                                  </td>

                                  <td className={`py-4 px-6 text-right font-mono text-xs font-bold ${
                                    isNaN(asset.totalReturn)
                                      ? "text-zinc-450"
                                      : asset.totalReturn >= 0 ? "text-zinc-900" : "text-zinc-450"
                                  }`}>
                                    <div className="space-y-0.5">
                                      <span>{asset.totalReturn >= 0 ? "▲ " : "▼ "}{fmtPct(asset.totalReturn)}</span>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-550 font-mono">
                        <p>Total filtered set: {filteredAssets.length} of {results.assetReports.length} acquirers</p>
                        <p className="font-mono text-[9px] uppercase text-zinc-400">BACKTEST_ENGINE_MONO_STABLE_v1.02</p>
                      </div>
                    </>
                  )}
                </div>

              </motion.div>
            ) : (
              <div className="bg-white rounded-sm border border-zinc-200 p-16 text-center text-zinc-600 flex flex-col items-center justify-center space-y-4 min-h-[500px]" id="empty-workspace-landing">
                <TrendingUp className="w-10 h-10 text-zinc-900 animate-pulse" />
                <div className="space-y-4">
                  <h4 className="text-zinc-900 font-bold text-xs font-mono tracking-widest uppercase">REAL WORLD INDEX STANDBY</h4>
                  <p className="text-[11px] text-zinc-500 font-mono max-w-sm mx-auto leading-relaxed">
                    Epoch models initialized. Update parameters configuration and click the execute button to construct performance sheets.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-zinc-50 text-zinc-500 mt-16 border-t border-zinc-200 py-12 font-mono" id="bottom-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 text-zinc-400 text-[11px] tracking-wider">
          <p className="leading-relaxed text-[10px] max-w-2xl mx-auto uppercase">
            INFORMATIONAL DISCLAIMER: Calculations are executed based on historical assets model proxying. Performance calculations do not constitute investment advice of any kind.
          </p>
          <div className="pt-8 border-t border-zinc-200 text-center text-xs">
            <p className="text-zinc-600 text-[10px]">
              &copy; 2026 <a href="https://threadsunite.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 underline text-zinc-550 font-bold tracking-widest transition-colors uppercase">Threads Unite</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
