/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { SCREENER_STOCKS } from "./screenerData";
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
  "BRAV.ST, GREEN.ST, ERF.PA, DHR, HLMA.L, INDT.ST, LIFCO-B.ST, BRK-B, ADDT-B.ST, LAGR-B.ST, " +
  "SDIP-B.ST, BERG-B.ST, BEIA-B.ST, CHG.DE, 319A.T, 3697.T, AUROORA.HE, TOI.V, LMN.V, MMGR-B.ST"
);

interface BacktestMetrics {
  indexTotalReturn: number;
  spTotalReturn: number;
  brkTotalReturn: number;
  indexCAGR: number;
  spCAGR: number;
  brkCAGR: number;
  maxDrawdown: number;
  sharpe: number;
  volatility: number;
}

interface PerformancePoint {
  date: string;
  "Serial Acquirers": number;
  "S&P 500": number;
  "Berkshire Hathaway": number;
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

function mapYahooTickerToTradingView(ticker: string): string {
  const clean = ticker.trim().toUpperCase();
  if (clean === "BRK-B") {
    return "NYSE:BRK.B";
  }
  if (clean.endsWith(".TO")) {
    return "TSX:" + clean.replace(".TO", "");
  }
  if (clean.endsWith(".V")) {
    return "TSXV:" + clean.replace(".V", "");
  }
  if (clean.endsWith(".ST")) {
    const symbolWithoutSuffix = clean.replace(".ST", "");
    const formattedSymbol = symbolWithoutSuffix.replace("-", "_");
    return "OMXSTO:" + formattedSymbol;
  }
  if (clean.endsWith(".HE")) {
    return "NASDAQHEX:" + clean.replace(".HE", "");
  }
  if (clean.endsWith(".DE")) {
    return "XETR:" + clean.replace(".DE", "");
  }
  if (clean.endsWith(".T")) {
    return "TSE:" + clean.replace(".T", "");
  }
  if (clean.endsWith(".AS")) {
    return "EURONEXT:" + clean.replace(".AS", "");
  }
  if (clean.endsWith(".MI")) {
    return "MIL:" + clean.replace(".MI", "");
  }
  if (clean.endsWith(".L")) {
    return "LSE:" + clean.replace(".L", "");
  }
  if (clean.endsWith(".PA")) {
    return "EURONEXT:" + clean.replace(".PA", "");
  }
  return clean;
}

interface TradingViewWidgetProps {
  symbol: string;
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = "tradingview-widget-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initWidget = () => {
      if (container.current && (window as any).TradingView) {
        container.current.innerHTML = "";
        const widgetContainer = document.createElement("div");
        widgetContainer.id = "tradingview_chart_widget_active";
        widgetContainer.style.height = "100%";
        container.current.appendChild(widgetContainer);

        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart_widget_active",
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      if ((window as any).TradingView) {
        initWidget();
      } else {
        script.addEventListener("load", initWidget);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener("load", initWidget);
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" style={{ height: "600px" }}>
      <div ref={container} className="h-full w-full" />
    </div>
  );
}

export default function App() {
  // Config state
  const [tickersInput, setTickersInput] = useState(DEFAULT_ALPERA_TICKERS);
  const [selectedAnalysisTicker, setSelectedAnalysisTicker] = useState("CSU.TO");
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

  // Layer 1 Lock state: constituent analyzer wall (secured via server validation)
  const [tableUnlocked, setTableUnlocked] = useState(false);
  const [tablePasswordInput, setTablePasswordInput] = useState("");
  const [tablePasswordError, setTablePasswordError] = useState(false);

  // Layer 2 Lock state: company names redacted (secured via server validation)
  const [namesUnlocked, setNamesUnlocked] = useState(false);
  const [namesPasswordInput, setNamesPasswordInput] = useState("");
  const [namesPasswordError, setNamesPasswordError] = useState(false);

  // Layer 3 Lock state: Individual stock analysis wall (secured via server validation)
  const [analysisUnlocked, setAnalysisUnlocked] = useState(false);
  const [analysisPasswordInput, setAnalysisPasswordInput] = useState("");
  const [analysisPasswordError, setAnalysisPasswordError] = useState(false);

  // Active navigation tab ("dashboard" | "screener")
  const [activeTab, setActiveTab] = useState<"dashboard" | "screener">("dashboard");

  // Screener authentication wall (secured via server validation)
  const [screenerUnlocked, setScreenerUnlocked] = useState(false);
  const [screenerPasswordInput, setScreenerPasswordInput] = useState("");
  const [screenerPasswordError, setScreenerPasswordError] = useState(false);

  // Screener Filters
  const [filterPe, setFilterPe] = useState<number | "">("");
  const [filterPb, setFilterPb] = useState<number | "">("");
  const [filterDivYield, setFilterDivYield] = useState<number | "">("");
  const [filterDebtEquity, setFilterDebtEquity] = useState<number | "">("");
  const [filterMinCap, setFilterMinCap] = useState<number | "">("");
  const [filterMaxCap, setFilterMaxCap] = useState<number | "">("");
  const [screenerSearchText, setScreenerSearchText] = useState("");
  const [screenerCountryFilter, setScreenerCountryFilter] = useState("all");
  const [screenerIndustryFilter, setScreenerIndustryFilter] = useState("all");
  const [filterMinCagr, setFilterMinCagr] = useState<number | "">("");

  // Helper for secure server-side verification of clearance keys (passwords)
  const verifyPasswordOnServer = async (type: string, val: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, password: val })
      });
      if (response.ok) {
        const data = await response.json();
        return !!data.success;
      }
    } catch (e) {
      console.error("Secure key verification failed:", e);
    }
    return false;
  };

  // Filtered screener stocks list
  const filteredStocks = SCREENER_STOCKS.filter((stock) => {
    if (screenerSearchText) {
      const q = screenerSearchText.toLowerCase().trim();
      if (!stock.ticker.toLowerCase().includes(q) && !stock.name.toLowerCase().includes(q)) return false;
    }
    if (screenerCountryFilter !== "all" && stock.country !== screenerCountryFilter) return false;
    if (screenerIndustryFilter !== "all" && stock.industry !== screenerIndustryFilter) return false;
    if (filterPe !== "" && stock.pe > filterPe) return false;
    if (filterPb !== "" && stock.pb > filterPb) return false;
    if (filterDivYield !== "" && stock.divYield < filterDivYield) return false;
    if (filterDebtEquity !== "" && stock.debtEquity > filterDebtEquity) return false;
    if (filterMinCap !== "" && stock.marketCap < filterMinCap) return false;
    if (filterMaxCap !== "" && stock.marketCap > filterMaxCap) return false;
    if (filterMinCagr !== "" && stock.priceCagr < filterMinCagr) return false;
    return true;
  });

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
          
          <div className="flex items-center space-x-4 text-xs font-mono">
            <nav className="flex space-x-1.5 p-1 bg-zinc-100 border border-zinc-200 rounded-sm">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all rounded-[1px] cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                DASHBOARD
              </button>
              <button
                onClick={() => setActiveTab("screener")}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all rounded-[1px] cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "screener"
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                SCREENER
                {!screenerUnlocked && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                )}
              </button>
            </nav>

            <div className="hidden md:flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200 text-zinc-800 px-2.5 py-1.5 rounded-sm">
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
        {activeTab === "screener" ? (
          !screenerUnlocked ? (
            <div className="bg-white rounded-sm border border-zinc-200 shadow-sm overflow-hidden p-8 sm:p-20 text-center text-zinc-650 flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto my-12 animate-fade-in" id="screener_locked_card">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm shadow-inner">
                <ListFilter className="w-10 h-10 text-zinc-900" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-zinc-950 font-bold text-sm font-mono tracking-widest uppercase mb-1">SERIAL ACQUIRER SCREENER ACCESS</h4>
                <p className="text-[11px] text-zinc-550 font-mono leading-relaxed">
                  The active equity screening universe of global serial acquirers is locked behind clearance passwords. Enter key code to proceed.
                </p>
              </div>
              <form 
                onSubmit={async (e) => {
                   e.preventDefault();
                   const ok = await verifyPasswordOnServer("screener", screenerPasswordInput);
                   if (ok) {
                     setScreenerUnlocked(true);
                     setScreenerPasswordError(false);
                   } else {
                     setScreenerPasswordError(true);
                   }
                }}
                className="w-full max-w-xs space-y-3 mx-auto"
              >
                <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="ENTER SCREEN ACCESS PASSWORD..."
                    value={screenerPasswordInput}
                    onChange={(e) => {
                      setScreenerPasswordInput(e.target.value);
                      if (screenerPasswordError) setScreenerPasswordError(false);
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
                {screenerPasswordError && (
                  <p className="text-[10px] text-red-650 font-bold font-mono text-center">• INCORRECT CLEARANCE KEY</p>
                )}
              </form>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in" id="screener-workspace">
              {/* Screener Intro Banner */}
              <div className="bg-white border border-zinc-200 rounded-sm p-6 sm:p-8 text-zinc-900 overflow-hidden">
                <div className="max-w-4xl space-y-2">
                  <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-zinc-900" />
                    Global Serial Acquirer Equity Screener
                  </h2>
                  <p className="text-zinc-550 text-xs font-mono leading-relaxed">
                    Perform precise params-based screening over the active universal database of 90+ global serial acquirers across various currencies and stock markets.
                  </p>
                </div>
              </div>

              {/* Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Sidebar Filters */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white border border-zinc-200 rounded-sm p-5 space-y-6 shadow-xs">
                    <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-zinc-955 uppercase tracking-widest">SCREENER FILTERS</span>
                      <button
                        onClick={() => {
                          setFilterPe("");
                          setFilterPb("");
                          setFilterDivYield("");
                          setFilterDebtEquity("");
                          setFilterMinCap("");
                          setFilterMaxCap("");
                          setScreenerSearchText("");
                          setScreenerCountryFilter("all");
                          setScreenerIndustryFilter("all");
                          setFilterMinCagr("");
                        }}
                        className="text-[9px] font-mono uppercase bg-zinc-50 hover:bg-zinc-100 px-2 py-1 rounded-sm border border-zinc-200 text-zinc-650 transition-colors shrink-0 cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Search bar */}
                    <div className="space-y-1.5 font-mono">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase">SEARCH TICKER/NAME</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="e.g. CSU, Lifco..."
                          value={screenerSearchText}
                          onChange={(e) => setScreenerSearchText(e.target.value)}
                          className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white pl-8 pr-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Country List filter */}
                    <div className="space-y-1.5 font-mono">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase">COUNTRY LISTING</label>
                      <select
                        value={screenerCountryFilter}
                        onChange={(e) => setScreenerCountryFilter(e.target.value)}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="all">ALL COUNTRIES</option>
                        {Array.from(new Set(SCREENER_STOCKS.map(s => s.country))).sort().map(country => (
                          <option key={country} value={country}>
                            {country.toUpperCase()} ({SCREENER_STOCKS.filter(s => s.country === country).length})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Industry List filter */}
                    <div className="space-y-1.5 font-mono">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase">INDUSTRY SECTOR</label>
                      <select
                        value={screenerIndustryFilter}
                        onChange={(e) => setScreenerIndustryFilter(e.target.value)}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="all">ALL INDUSTRIES</option>
                        {Array.from(new Set(SCREENER_STOCKS.map(s => s.industry))).sort().map(ind => (
                          <option key={ind} value={ind}>
                            {ind.toUpperCase()} ({SCREENER_STOCKS.filter(s => s.industry === ind).length})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Price CAGR filter */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase">MIN PRICE CAGR</label>
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-bold">
                          {filterMinCagr !== "" ? `${filterMinCagr}%` : "0%"}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 15.0"
                        value={filterMinCagr}
                        onChange={(e) => setFilterMinCagr(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-zinc-950 focus:border-zinc-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Max PE */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase">MAX P/E RATIO</label>
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-bold">
                          {filterPe !== "" ? `${filterPe}x` : "∞"}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={filterPe}
                        onChange={(e) => setFilterPe(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-zinc-950 focus:border-zinc-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Max PB */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase">MAX P/B RATIO</label>
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-bold">
                          {filterPb !== "" ? `${filterPb}x` : "∞"}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 6"
                        value={filterPb}
                        onChange={(e) => setFilterPb(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-zinc-950 focus:border-zinc-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Min Div Yield */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase">MIN DIVIDEND YIELD</label>
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-bold">
                          {filterDivYield !== "" ? `${filterDivYield}%` : "0%"}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.0"
                        value={filterDivYield}
                        onChange={(e) => setFilterDivYield(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-zinc-950 focus:border-zinc-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Max Debt/Equity */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase block">MAX DEBT/EQUITY</label>
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1 py-0.2 rounded font-bold">
                          {filterDebtEquity !== "" ? `${filterDebtEquity}x` : "∞"}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.5"
                        value={filterDebtEquity}
                        onChange={(e) => setFilterDebtEquity(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-1.5 text-zinc-955 focus:border-zinc-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Market Cap Bounds */}
                    <div className="space-y-3 font-mono">
                      <label className="text-[10px] text-zinc-550 font-bold uppercase block border-b border-zinc-100 pb-1">MARKET CAP LIMITS ($M)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400">MIN ($M)</span>
                          <input
                            type="number"
                            placeholder="Min Cap"
                            value={filterMinCap}
                            onChange={(e) => setFilterMinCap(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-2 py-1 text-zinc-955 focus:border-zinc-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400">MAX ($M)</span>
                          <input
                            type="number"
                            placeholder="Max Cap"
                            value={filterMaxCap}
                            onChange={(e) => setFilterMaxCap(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-2 py-1 text-zinc-955 focus:border-zinc-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Table Panel with Symbol, Company Name, Sector, Price, Country Listing, and Market Cap */}
                <div className="lg:col-span-9 space-y-4">
                  <div className="bg-white border border-zinc-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="p-4 bg-zinc-50/50 border-b border-zinc-200 flex items-center justify-between font-mono">
                      <span className="text-xs font-bold text-zinc-955 uppercase">
                        SCREENED ACTIVE CONSTITUENTS
                      </span>
                      <span className="text-[10px] font-bold bg-zinc-950 text-white px-2.5 py-0.5 rounded-sm">
                        {filteredStocks.length} RESULT(S)
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 font-mono">
                            <th className="py-3 px-4">Ticker</th>
                            <th className="py-3 px-4">Company Name</th>
                            <th className="py-3 px-4">Sector</th>
                            <th className="py-3 px-4">Industry</th>
                            <th className="py-3 px-4 text-right">Price (Currency)</th>
                            <th className="py-3 px-4 text-right">10Y Price CAGR</th>
                            <th className="py-3 px-4 text-center">Country Listing</th>
                            <th className="py-3 px-4 text-right font-bold text-zinc-900">Market Cap</th>
                            <th className="py-3 px-2 text-center text-[9px]">P/E</th>
                            <th className="py-3 px-2 text-center text-[9px]">P/B</th>
                            <th className="py-3 px-2 text-center text-[9px]">Div Yield</th>
                            <th className="py-3 px-2 text-center text-[9px]">Debt/Eq</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 text-[11px] font-mono">
                          {filteredStocks.length === 0 ? (
                            <tr>
                              <td colSpan={12} className="py-12 text-center text-zinc-400 font-bold uppercase text-xs font-mono">
                                No serial acquirers match the specified filter matrix.
                              </td>
                            </tr>
                          ) : (
                            filteredStocks.map((stock) => {
                              const currencySymbolMap: Record<string, string> = {
                                USD: "$",
                                CAD: "C$",
                                EUR: "€",
                                GBP: "£",
                                AUD: "A$",
                                CHF: "CHF ",
                                NOK: "kr ",
                                SEK: "kr ",
                                DKK: "kr ",
                                PLN: "zł ",
                                JPY: "¥"
                              };
                              const unit = currencySymbolMap[stock.currency] || "";
                              const formattedCap = stock.marketCap >= 1000 
                                ? `${unit}${(stock.marketCap / 1000).toFixed(1)}B`
                                : `${unit}${stock.marketCap}M`;

                              return (
                                <tr key={stock.ticker} className="hover:bg-zinc-50 transition-colors">
                                  <td className="py-3 px-4 font-bold text-zinc-950">
                                    <span className="bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded-sm text-[10px]">
                                      {stock.ticker}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 whitespace-nowrap text-zinc-900 font-semibold">{stock.name}</td>
                                  <td className="py-3 px-4 text-zinc-500 italic text-[10px] whitespace-nowrap">{stock.sector}</td>
                                  <td className="py-3 px-4 text-zinc-500 text-[10px] whitespace-nowrap">{stock.industry || "N/A"}</td>
                                  <td className="py-3 px-4 text-right font-bold text-zinc-950 whitespace-nowrap">
                                    {unit}{stock.price.toFixed(2)} <span className="text-[9px] text-zinc-400 font-normal">({stock.currency})</span>
                                  </td>
                                  <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${stock.priceCagr >= 20 ? 'text-emerald-700 bg-emerald-50/25' : stock.priceCagr >= 15 ? 'text-blue-700 bg-blue-55/25' : 'text-zinc-800'}`}>
                                    {stock.priceCagr.toFixed(1)}%
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-xs text-[10px] text-zinc-650">
                                      {stock.country}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right font-bold text-zinc-950 whitespace-nowrap">
                                    {formattedCap}
                                  </td>
                                  <td className="py-3 px-2 text-center text-zinc-800">{stock.pe}x</td>
                                  <td className="py-3 px-2 text-center text-zinc-800">{stock.pb}x</td>
                                  <td className="py-3 px-2 text-center text-green-700 font-bold">{stock.divYield}%</td>
                                  <td className="py-3 px-2 text-center text-zinc-800">{stock.debtEquity}x</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="bg-white border border-zinc-200 rounded-sm p-6 sm:p-8 text-zinc-900 relative overflow-hidden animate-fade-in" id="dashboard-intro">
          <div className="max-w-4xl relative z-10 space-y-4">

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-mono text-zinc-900">
              REAL WORLD INDEX
            </h2>
            <div className="text-zinc-650 leading-relaxed text-xs sm:text-sm space-y-3 font-sans">
              <p>
                The <strong>Real World Index</strong> is a benchmark index designed to capture the superior returns of the &ldquo;Serial Acquirer&rdquo; business model. By investing in a curated basket of listed serial acquirers, it provides investors with diversified, liquid exposure to the high-yield private SME (Small and Medium Enterprise) market without the illiquidity or high fees of traditional PE.
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
                      max="2025-12-31"
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
                      max="2025-12-31"
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
                      onClick={() => handleApplyPreset("2000-01-01", "2025-12-31")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Max Time (2000-2025)
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
                      onClick={() => handleApplyPreset("2020-01-01", "2025-12-31")}
                      className="py-1 px-2 text-[10px] font-mono rounded bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-colors text-zinc-500 text-left"
                    >
                      • Modern (2020-2025)
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
                          Primary compounders (<strong>CSU.TO</strong>, <strong>BRK-B</strong> &amp; <strong>LIFCO-B.ST</strong>) loaded with 7% premium weight each. Residual split equally.
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
                  {namesUnlocked && (
                    <button
                      onClick={handleResetTickers}
                      className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3 text-zinc-400" /> Reset Default
                    </button>
                  )}
                </div>

                {!namesUnlocked ? (
                  <div className="border border-zinc-200 bg-zinc-50/50 rounded-sm p-4 text-center font-mono space-y-3">
                    <div className="flex items-center justify-center space-x-1.5 text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                      <span className="text-[9px] uppercase font-bold tracking-wider">LEVEL 2 SECURITY ENCRYPTED</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Enter the decryption password to review or customize the 50 underlying constituents.
                    </p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const ok = await verifyPasswordOnServer("names", namesPasswordInput);
                        if (ok) {
                          setNamesUnlocked(true);
                          setNamesPasswordError(false);
                        } else {
                          setNamesPasswordError(true);
                        }
                      }}
                      className="space-y-1.5"
                    >
                      <div className="flex space-x-1.5">
                        <input
                          type="password"
                          placeholder="DECRYPT PASSWORD..."
                          value={namesPasswordInput}
                          onChange={(e) => {
                            setNamesPasswordInput(e.target.value);
                            if (namesPasswordError) setNamesPasswordError(false);
                          }}
                          className="flex-1 text-[10px] bg-white border border-zinc-200 px-2 py-1.5 text-zinc-900 placeholder-zinc-400 rounded-sm focus:outline-hidden focus:border-zinc-500 font-mono text-center"
                        />
                        <button
                          type="submit"
                          className="bg-zinc-900 text-white text-[10px] font-bold tracking-wider hover:bg-black px-3 py-1.5 border border-zinc-900 transition-colors rounded-sm uppercase font-mono cursor-pointer shrink-0"
                        >
                          DECRYPT
                        </button>
                      </div>
                      {namesPasswordError && (
                        <p className="text-[9px] text-red-650 font-bold uppercase tracking-wider">INVALID CODE</p>
                      )}
                    </form>
                  </div>
                ) : (
                  <textarea
                    value={tickersInput}
                    onChange={(e) => setTickersInput(e.target.value)}
                    rows={5}
                    className="w-full text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:border-zinc-500 focus:outline-hidden resize-y leading-relaxed"
                    placeholder="Ticker list separated by commas"
                  />
                )}
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
                Applying a premium base allocation to <span className="font-semibold text-zinc-900">Constellation Software (CSU.TO)</span>, <span className="font-semibold text-zinc-900">Berkshire Hathaway (BRK-B)</span> and <span className="font-semibold text-zinc-900">Lifco AB (LIFCO-B.ST)</span> biases weight allocation toward core high-ROIC quality compounders (with a premium of 7% each in the quality factor model). The residual index is spread across all secondary acquirers to offer optimized thematic exposure.
              </p>
              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-[9px] font-mono">
                <span className="text-zinc-500">BASE BENCHMARKS:</span>
                <span className="px-2 py-0.5 rounded bg-white text-zinc-900 font-bold border border-zinc-200">S&P 500, BRK</span>
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
                      <span className="text-xl font-bold text-zinc-850 font-mono tracking-tight">
                        {fmtPct(results.metrics.spTotalReturn)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">CAGR:</span>
                      <span className="font-bold text-zinc-700">{fmtPct(results.metrics.spCAGR)}</span>
                    </div>
                  </div>

                  {/* METRIC 3: BERKSHIRE HATHAWAY Performance */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm" id="brk-bench-stats">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Berkshire Hathaway</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-800 font-mono tracking-tight">
                        {fmtPct(results.metrics.brkTotalReturn)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">CAGR:</span>
                      <span className="font-bold text-zinc-700">{fmtPct(results.metrics.brkCAGR)}</span>
                    </div>
                  </div>

                  {/* METRIC 4: RISK & EFFICIENCY STATS */}
                  <div className="bg-white p-5 rounded-sm border border-zinc-200 hover:border-zinc-400 transition-colors duration-200 shadow-sm" id="max-risk-stats">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Risk Profile</p>
                    <div className="mt-1 flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-zinc-900 font-mono tracking-tight text-red-650">
                        {fmtPct(results.metrics.maxDrawdown)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-[10px] flex items-center space-x-1.5 font-mono">
                      <span className="text-zinc-400">Sharpe:</span>
                      <span className="font-bold text-zinc-700">{fmtMtr(results.metrics.sharpe)}</span>
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
                          stroke="#2563EB"
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
                          stroke="#18181B"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          dot={false}
                          name="Berkshire Hathaway"
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
                          <Bar dataKey="indexReturn" name="Serial Acquirers" fill="#2563EB" radius={[1, 1, 0, 0]} />
                          <Bar dataKey="spReturn" name="S&P 500" fill="#71717A" radius={[1, 1, 0, 0]} />
                          <Bar dataKey="brkReturn" name="Berkshire Hathaway" fill="#18181B" radius={[1, 1, 0, 0]} />
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
                        onSubmit={async (e) => {
                           e.preventDefault();
                           const ok = await verifyPasswordOnServer("table", tablePasswordInput);
                           if (ok) {
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
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const ok = await verifyPasswordOnServer("names", namesPasswordInput);
                              if (ok) {
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
                                        {asset.isPremium && results.weightingModelConfig === "premium" ? (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-zinc-900 text-white border border-zinc-900 font-mono">
                                            <Award className="w-2.5 h-2.5" />
                                            <span>7% Premium Allocate</span>
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

        {/* INDIVIDUAL STOCK ANALYSIS */}
        <div className="bg-white rounded-sm border border-zinc-200 shadow-xs overflow-hidden" id="stock-analysis-section">
          {!analysisUnlocked ? (
            <div className="p-8 sm:p-16 text-center text-zinc-650 flex flex-col items-center justify-center space-y-6" id="stock_analysis_locked">
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm shadow-inner">
                <TrendingUp className="w-8 h-8 text-zinc-800" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-zinc-950 font-bold text-xs font-mono tracking-widest uppercase">INDIVIDUAL ISSUER ANALYTICS</h4>
                <p className="text-[11px] text-zinc-550 font-mono leading-relaxed">
                  Real-time price chart, financials, and technical indicators are locked behind structural security parameters. Please enter the verification key to unlock.
                </p>
              </div>
              <form 
                onSubmit={async (e) => {
                   e.preventDefault();
                   const ok = await verifyPasswordOnServer("analysis", analysisPasswordInput);
                   if (ok) {
                     setAnalysisUnlocked(true);
                     setAnalysisPasswordError(false);
                   } else {
                     setAnalysisPasswordError(true);
                   }
                }}
                className="w-full max-w-xs space-y-3 mx-auto"
              >
                <div className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="ENTER PASSWORD WALL..."
                    value={analysisPasswordInput}
                    onChange={(e) => {
                      setAnalysisPasswordInput(e.target.value);
                      if (analysisPasswordError) setAnalysisPasswordError(false);
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
                {analysisPasswordError && (
                  <p className="text-[10px] text-red-600 font-bold font-mono text-center">• INCORRECT ENCRYPTION KEY CODE</p>
                )}
              </form>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-900 text-xs sm:text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-zinc-900" />
                      Individual Issuer Analytics &amp; Live Charts
                    </h3>
                    <p className="text-[11px] text-zinc-550 font-mono">
                      Select a portfolio constituent to review real-time price action, financials waves, and technical indicators.
                    </p>
                  </div>
                  
                  {/* Select Dropdown */}
                  <div className="flex items-center space-x-2">
                    <label htmlFor="ticker-select" className="text-[10px] font-bold text-zinc-550 uppercase font-mono whitespace-nowrap">
                      SELECT ISSUER:
                    </label>
                    <select
                      id="ticker-select"
                      value={selectedAnalysisTicker}
                      onChange={(e) => setSelectedAnalysisTicker(e.target.value)}
                      className="rounded-sm border border-zinc-200 bg-white shadow-xs px-3 py-2 text-xs font-bold font-mono text-zinc-900 focus:border-zinc-500 focus:outline-hidden cursor-pointer min-w-[180px] hover:border-zinc-400 transition-colors"
                    >
                      {(results?.assetReports.map(a => a.symbol) || 
                        tickersInput.split(",").map(t => t.trim()).filter(t => t.length > 0)
                      ).map((sym) => {
                        const assetReport = results?.assetReports.find(a => a.symbol === sym);
                        const displayName = assetReport && namesUnlocked 
                          ? `${sym} - ${assetReport.name}`
                          : sym;
                        return (
                          <option key={sym} value={sym}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* TradingView Widget Container */}
              <div className="p-2.5 bg-zinc-50">
                <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden" style={{ minHeight: "600px" }}>
                  <TradingViewWidget symbol={mapYahooTickerToTradingView(selectedAnalysisTicker)} />
                </div>
              </div>
            </>
          )}
        </div>
          </>
        )}
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
