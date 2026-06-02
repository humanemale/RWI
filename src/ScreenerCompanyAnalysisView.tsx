import React, { useState } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  Coins, 
  Globe, 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  Info,
  ExternalLink,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { SCREENER_STOCKS, ScreenerStock } from "./screenerData";

interface ScreenerCompanyAnalysisViewProps {
  ticker: string;
  onBack: () => void;
  namesUnlocked: boolean;
  comparisonLoading: boolean;
  comparisonError: string | null;
  comparisonData: {
    ticker: string;
    benchmark: string;
    startDate: string;
    endDate: string;
    series: {
      date: string;
      compPrice: number;
      brkPrice: number;
      compIndexed: number;
      brkIndexed: number;
    }[];
  } | null;
}

export function ScreenerCompanyAnalysisView({
  ticker,
  onBack,
  namesUnlocked,
  comparisonLoading,
  comparisonError,
  comparisonData
}: ScreenerCompanyAnalysisViewProps) {
  const stock = SCREENER_STOCKS.find(s => s.ticker === ticker);

  if (!stock) {
    return (
      <div className="bg-white border border-zinc-200 rounded-sm p-8 text-center space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <p className="text-zinc-650 font-mono text-sm uppercase">Constituent asset not found in database.</p>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono font-bold tracking-widest rounded-sm"
        >
          BACK TO SCREENER
        </button>
      </div>
    );
  }

  const [timeframe, setTimeframe] = useState<"3Y" | "5Y" | "MAX">("MAX");

  // Filter series based on selected timeframe
  const filteredSeries = comparisonData ? [...comparisonData.series].filter((point) => {
    if (timeframe === "MAX") return true;
    const date = new Date(point.date);
    const limitDate = new Date();
    // In our synth database, dates go up to late 2025.
    // Let's baseline based on the maximum date in the dataset.
    const maxDateStr = comparisonData.series[comparisonData.series.length - 1]?.date || "2025-12-31";
    const refDate = new Date(maxDateStr);
    
    if (timeframe === "3Y") {
      refDate.setFullYear(refDate.getFullYear() - 3);
    } else if (timeframe === "5Y") {
      refDate.setFullYear(refDate.getFullYear() - 5);
    }
    return date >= refDate;
  }) : [];

  // Re-index series for selected timeframe so that they start at 100
  let adjustedSeries = filteredSeries;
  if (filteredSeries.length > 0) {
    const startComp = filteredSeries[0].compPrice;
    const startBrk = filteredSeries[0].brkPrice;
    adjustedSeries = filteredSeries.map((point) => {
      const compIndexed = startComp > 0 ? (point.compPrice / startComp) * 100 : 100;
      const brkIndexed = startBrk > 0 ? (point.brkPrice / startBrk) * 100 : 100;
      return {
        ...point,
        compIndexed: parseFloat(compIndexed.toFixed(2)),
        brkIndexed: parseFloat(brkIndexed.toFixed(2))
      };
    });
  }

  // Calculate final cumulative returns for display metrics
  const compTotalReturn = adjustedSeries.length > 0
    ? adjustedSeries[adjustedSeries.length - 1].compIndexed - 100
    : 0;
  const brkTotalReturn = adjustedSeries.length > 0
    ? adjustedSeries[adjustedSeries.length - 1].brkIndexed - 100
    : 0;

  // Formatting for market Cap
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

  // Synthetic peer compare commentary based on quantitative attributes
  const generateCommentary = () => {
    const pbText = stock.pb > 4 ? "premium multiple" : "value multiple";
    const leverageText = stock.debtEquity > 1.2 ? "highly geared expansion" : "prudent/conservative capital framework";
    return `
      ${stock.name} (${stock.ticker}) follows a specialized, high-velocity acquisition roll-up strategy in ${stock.industry}. 
      Unlike Berkshire Hathaway, which targets massive, multi-billion dollar private businesses (e.g., Pilot Flying J, Geico, Precision Castparts) 
      demanding heavy administrative overhead, ${stock.ticker} focuses on decentralized, niche micro-acquisitions. This provides ${stock.ticker} 
      with a structural advantage: higher price discipline (often buying smaller peers at 4-7x EBIT) and minimal post-merger integration risk. 
      Operating at a ${stock.pe}x valuation multiple, ${stock.ticker} matches Berkshire's decentralized leadership ethos but operates with 
      substantially higher asset velocity and capital reinvestment rates. Given its ${stock.priceCagr}% historical growth 10Y CAGR, it represents 
      a agile compounder compared to Berkshire's larger consolidated scale.
    `;
  };

  // Bar chart data for side-by-side metrics
  const barChartData = [
    { name: "P/E Ratio", [stock.ticker]: stock.pe, "BRK-B": 21.5 },
    { name: "P/B Ratio", [stock.ticker]: stock.pb, "BRK-B": 1.45 },
    { name: "Div Yield %", [stock.ticker]: stock.divYield, "BRK-B": 0.0 },
    { name: "Debt/Equity", [stock.ticker]: stock.debtEquity, "BRK-B": 0.38 }
  ];

  return (
    <div className="space-y-6" id="screener-company-analysis-view">
      {/* Back Header Nav */}
      <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-sm shadow-xs font-mono">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 font-bold text-xs uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO SCREENER MATRIX
        </button>
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
          EQUITY_ANALYST_PEER_VAL_ENGINE_v1.07
        </span>
      </div>

      {/* Hero Overview Header */}
      <div className="bg-white border border-zinc-200 rounded-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-zinc-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-sm">
              {stock.ticker}
            </span>
            <span className="text-[10px] font-bold font-mono border border-zinc-200 bg-zinc-50 text-zinc-650 px-2 py-0.5 rounded-sm uppercase flex items-center gap-1">
              <Globe className="w-3 h-3" /> {stock.country}
            </span>
            <span className="text-[10px] font-bold font-mono border border-zinc-200 bg-zinc-50 text-zinc-650 px-2 py-0.5 rounded-sm uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {stock.industry}
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-900 tracking-tight">
              {stock.name}
            </h2>
            <p className="text-xs text-zinc-500 font-mono italic mt-1">{stock.sector}</p>
          </div>
        </div>

        {/* Quick Metrics Badge Sheet */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl w-full border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-8">
          <div className="font-mono">
            <span className="text-[10px] text-zinc-450 uppercase block">Market Capital</span>
            <span className="text-sm font-bold text-zinc-950 block">{formattedCap}</span>
          </div>
          <div className="font-mono">
            <span className="text-[10px] text-zinc-450 uppercase block">Share Price</span>
            <span className="text-sm font-bold text-zinc-950 block">{unit}{stock.price.toFixed(2)}</span>
          </div>
          <div className="font-mono">
            <span className="text-[10px] text-zinc-450 uppercase block">10Y Price CAGR</span>
            <span className="text-sm font-semibold text-emerald-700 block">▲ {stock.priceCagr.toFixed(1)}%</span>
          </div>
          <div className="font-mono">
            <span className="text-[10px] text-zinc-450 uppercase block">P/E Valuation</span>
            <span className="text-sm font-bold text-zinc-950 block">{stock.pe}x</span>
          </div>
        </div>
      </div>

      {/* Dual Comparative Visual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Cumulative Performance Chart Panel */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 pb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-900" />
                CUMULATIVE ALIGNED CHART vs BRK-B
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                Relative performance comparison of total index value initialized at $100.
              </p>
            </div>

            {/* Selector buttons */}
            <div className="flex items-center space-x-1.5 p-1 bg-zinc-50 border border-zinc-200 rounded-sm font-mono text-[9px]">
              {(["3Y", "5Y", "MAX"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase transition-all rounded-[1px] cursor-pointer ${
                    timeframe === t
                      ? "bg-zinc-900 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Loader or Error */}
          {comparisonLoading ? (
            <div className="h-[360px] flex items-center justify-center font-mono text-zinc-450 uppercase text-xs animate-pulse">
              Generating comparative mathematical models from backend index...
            </div>
          ) : comparisonError ? (
            <div className="h-[360px] flex flex-col items-center justify-center p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <p className="font-mono text-zinc-600 text-xs uppercase">{comparisonError}</p>
            </div>
          ) : adjustedSeries.length === 0 ? (
            <div className="h-[360px] flex items-center justify-center font-mono text-zinc-400 text-xs uppercase">
              No historical trading points returned in this range.
            </div>
          ) : (
            <>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={adjustedSeries}
                    margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                    <XAxis
                      dataKey="date"
                      stroke="#71717A"
                      fontSize={9}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#71717A"
                      scale="linear"
                      domain={["auto", "auto"]}
                      fontSize={9}
                      tickLine={false}
                      dx={-10}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "1px",
                        border: "1px solid #D4D4D8",
                        color: "#18181B",
                        fontSize: "10px",
                        fontFamily: "var(--font-mono)",
                      }}
                      labelFormatter={(v) => `Date: ${v}`}
                      formatter={(value: any, name: any) => [`${parseFloat(value).toFixed(2)}%`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "15px", fontFamily: "var(--font-mono)" }} />
                    <Line
                      type="monotone"
                      dataKey="compIndexed"
                      stroke="#18181B"
                      strokeWidth={2.5}
                      dot={false}
                      name={`${stock.ticker} Cumulative`}
                    />
                    <Line
                      type="monotone"
                      dataKey="brkIndexed"
                      stroke="#CA8A04"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Berkshire Hathaway (BRK-B)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stat sheet metrics on Return */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 pt-4 text-xs font-mono">
                <div className="p-3 bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-450 uppercase block">
                    {stock.ticker} RET. IN TIMEFRAME
                  </span>
                  <span className={`text-sm font-bold block ${compTotalReturn >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {compTotalReturn >= 0 ? "▲ " : "▼ "}{compTotalReturn.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] text-zinc-450 uppercase block">
                    BRK-B RET. IN TIMEFRAME
                  </span>
                  <span className={`text-sm font-bold block ${brkTotalReturn >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {brkTotalReturn >= 0 ? "▲ " : "▼ "}{brkTotalReturn.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Structural Valuation Compare bar chart + Peer Commentary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bar Chart comparing fundamental variables */}
          <div className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
            <h3 className="font-bold text-zinc-900 font-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Coins className="w-4 h-4 text-zinc-950" />
              PEER VALUATION GRID
            </h3>
            
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 5, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis dataKey="name" fontSize={9} stroke="#71717A" tickLine={false} />
                  <YAxis fontSize={9} stroke="#71717A" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "1px",
                      border: "1px solid #D4D4D8",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "9px", fontFamily: "var(--font-mono)" }} />
                  <Bar dataKey={stock.ticker} fill="#18181B" radius={[1, 1, 0, 0]} />
                  <Bar dataKey="BRK-B" fill="#CA8A04" radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend indicators */}
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-zinc-100 pt-3">
              <span className="text-zinc-500">
                ⭐ {stock.ticker} P/E: <strong>{stock.pe}x</strong>
              </span>
              <span className="text-zinc-500">
                🏆 BRK-B P/E: <strong>21.5x</strong>
              </span>
              <span className="text-zinc-500">
                ⭐ {stock.ticker} D/E: <strong>{stock.debtEquity}x</strong>
              </span>
              <span className="text-zinc-500">
                🏆 BRK-B D/E: <strong>0.38x</strong>
              </span>
            </div>
          </div>

          {/* Model Commentary Box */}
          <div className="bg-zinc-900 border border-zinc-850 text-white rounded-sm p-5 space-y-3 relative">
            <div className="absolute top-4 right-4 text-amber-500 opacity-20">
              <Award className="w-12 h-12" />
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider">
                COMPARE ETHOS BRIEFING
              </h4>
            </div>
            <p className="text-[11px] font-sans/mono leading-relaxed text-zinc-350">
              {generateCommentary()}
            </p>
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[9px] font-mono text-zinc-500">
              <span>BUFFETT_ETHOS: RESPECTED</span>
              <span>SCALE: MICRO_ACQUISITIONS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
