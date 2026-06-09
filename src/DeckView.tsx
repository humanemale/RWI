import React, { useState, useEffect, useRef } from "react";
import { 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Grid, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  Download, 
  Mail, 
  Database, 
  MapPin, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Search, 
  Eye, 
  LockKeyhole,
  CheckCircle2,
  BookMarked,
  Layers
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

// Slide 10 Chart Data: Serial Acquirers vs VC/PE/Berkshire/S&P
const slide10Data = [
  { year: "1999", "S&P 500": 100, "Berkshire Hathaway": 100, "Serial Acquirers": 100, "US Venture Capital": 100, "Constellation Software": 100 },
  { year: "2001", "S&P 500": 82, "Berkshire Hathaway": 95, "Serial Acquirers": 115, "US Venture Capital": 85, "Constellation Software": 120 },
  { year: "2003", "S&P 500": 85, "Berkshire Hathaway": 108, "Serial Acquirers": 135, "US Venture Capital": 78, "Constellation Software": 210 },
  { year: "2005", "S&P 500": 102, "Berkshire Hathaway": 118, "Serial Acquirers": 182, "US Venture Capital": 92, "Constellation Software": 340 },
  { year: "2007", "S&P 500": 118, "Berkshire Hathaway": 142, "Serial Acquirers": 240, "US Venture Capital": 104, "Constellation Software": 550 },
  { year: "2009", "S&P 500": 88, "Berkshire Hathaway": 122, "Serial Acquirers": 265, "US Venture Capital": 94, "Constellation Software": 810 },
  { year: "2011", "S&P 500": 112, "Berkshire Hathaway": 146, "Serial Acquirers": 420, "US Venture Capital": 126, "Constellation Software": 1200 },
  { year: "2013", "S&P 500": 144, "Berkshire Hathaway": 184, "Serial Acquirers": 680, "US Venture Capital": 158, "Constellation Software": 2100 },
  { year: "2015", "S&P 500": 172, "Berkshire Hathaway": 212, "Serial Acquirers": 1050, "US Venture Capital": 215, "Constellation Software": 3500 },
  { year: "2017", "S&P 500": 214, "Berkshire Hathaway": 274, "Serial Acquirers": 1580, "US Venture Capital": 290, "Constellation Software": 5200 },
  { year: "2019", "S&P 500": 264, "Berkshire Hathaway": 310, "Serial Acquirers": 2340, "US Venture Capital": 380, "Constellation Software": 7850 },
  { year: "2021", "S&P 500": 340, "Berkshire Hathaway": 412, "Serial Acquirers": 3540, "US Venture Capital": 560, "Constellation Software": 11800 },
  { year: "2023", "S&P 500": 395, "Berkshire Hathaway": 464, "Serial Acquirers": 4180, "US Venture Capital": 630, "Constellation Software": 14800 },
  { year: "2024", "S&P 500": 425, "Berkshire Hathaway": 485, "Serial Acquirers": 4820, "US Venture Capital": 680, "Constellation Software": 18200 }
];

// Slide 12 Donut Data: SMEs in Europe
const slide12Data = [
  { name: "Italy", value: 3.7, color: "#1E3A8A" },
  { name: "France", value: 2.9, color: "#2563EB" },
  { name: "Spain", value: 2.5, color: "#3B82F6" },
  { name: "Germany", value: 2.4, color: "#60A5FA" },
  { name: "Others", value: 4.9, color: "#93C5FD" },
  { name: "UK", value: 1.9, color: "#BFDBFE" },
  { name: "Poland", value: 1.6, color: "#DBEAFE" },
  { name: "Sc Scandinavia", value: 1.5, color: "#EFF6FF" },
  { name: "Netherlands", value: 1.1, color: "#1E293B" },
  { name: "Czech Republic", value: 1.0, color: "#475569" }
];

// Slide 16 Nordic Performance (2004-2023)
const slide16Data = [
  { year: "2004", "Acquisition-driven compounders (Nordic)": 100, "Berkshire Hathaway": 100, "OMX Allshare Sweden": 100, "MSCI World": 100 },
  { year: "2006", "Acquisition-driven compounders (Nordic)": 150, "Berkshire Hathaway": 118, "OMX Allshare Sweden": 134, "MSCI World": 120 },
  { year: "2008", "Acquisition-driven compounders (Nordic)": 130, "Berkshire Hathaway": 115, "OMX Allshare Sweden": 85, "MSCI World": 82 },
  { year: "2010", "Acquisition-driven compounders (Nordic)": 280, "Berkshire Hathaway": 140, "OMX Allshare Sweden": 138, "MSCI World": 112 },
  { year: "2012", "Acquisition-driven compounders (Nordic)": 395, "Berkshire Hathaway": 156, "OMX Allshare Sweden": 152, "MSCI World": 128 },
  { year: "2014", "Acquisition-driven compounders (Nordic)": 640, "Berkshire Hathaway": 210, "OMX Allshare Sweden": 204, "MSCI World": 164 },
  { year: "2016", "Acquisition-driven compounders (Nordic)": 890, "Berkshire Hathaway": 224, "OMX Allshare Sweden": 238, "MSCI World": 182 },
  { year: "2018", "Acquisition-driven compounders (Nordic)": 1280, "Berkshire Hathaway": 294, "OMX Allshare Sweden": 285, "MSCI World": 218 },
  { year: "2020", "Acquisition-driven compounders (Nordic)": 1950, "Berkshire Hathaway": 315, "OMX Allshare Sweden": 332, "MSCI World": 254 },
  { year: "2022", "Acquisition-driven compounders (Nordic)": 3120, "Berkshire Hathaway": 480, "OMX Allshare Sweden": 412, "MSCI World": 286 },
  { year: "2023", "Acquisition-driven compounders (Nordic)": 3400, "Berkshire Hathaway": 640, "OMX Allshare Sweden": 430, "MSCI World": 300 }
];

// Slide 17 Global Performance (2004-2023)
const slide17Data = [
  { year: "2004", "Acquisition-driven compounders (Global)": 100, "Berkshire Hathaway": 100, "S&P 500": 100, "MSCI World": 100 },
  { year: "2006", "Acquisition-driven compounders (Global)": 142, "Berkshire Hathaway": 118, "S&P 500": 122, "MSCI World": 120 },
  { year: "2008", "Acquisition-driven compounders (Global)": 128, "Berkshire Hathaway": 115, "S&P 500": 98, "MSCI World": 82 },
  { year: "2010", "Acquisition-driven compounders (Global)": 210, "Berkshire Hathaway": 140, "S&P 500": 132, "MSCI World": 112 },
  { year: "2012", "Acquisition-driven compounders (Global)": 310, "Berkshire Hathaway": 156, "S&P 500": 154, "MSCI World": 128 },
  { year: "2014", "Acquisition-driven compounders (Global)": 520, "Berkshire Hathaway": 210, "S&P 500": 202, "MSCI World": 164 },
  { year: "2016", "Acquisition-driven compounders (Global)": 730, "Berkshire Hathaway": 224, "S&P 500": 225, "MSCI World": 182 },
  { year: "2018", "Acquisition-driven compounders (Global)": 1050, "Berkshire Hathaway": 294, "S&P 500": 268, "MSCI World": 218 },
  { year: "2020", "Acquisition-driven compounders (Global)": 1540, "Berkshire Hathaway": 315, "S&P 500": 342, "MSCI World": 254 },
  { year: "2022", "Acquisition-driven compounders (Global)": 2180, "Berkshire Hathaway": 480, "S&P 500": 384, "MSCI World": 286 },
  { year: "2023", "Acquisition-driven compounders (Global)": 2400, "Berkshire Hathaway": 640, "S&P 500": 410, "MSCI World": 300 }
];

// Slide 18 Constellation TSR (TSR CAGR since 2006 IPO)
const slide18Data = [
  { name: "Constellation", value: 38 },
  { name: "Netflix", value: 34 },
  { name: "Amazon", value: 33 },
  { name: "Apple", value: 32 },
  { name: "NVIDIA", value: 31 }
];

export const DeckView: React.FC = () => {
  // Lock/Password State
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("deck_unlocked") === "true";
    }
    return false;
  });
  const [pwError, setPwError] = useState(false);

  // Slideshow States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto handle password submit
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "threadsisreal") {
      setIsUnlocked(true);
      localStorage.setItem("deck_unlocked", "true");
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isUnlocked) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, 32));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUnlocked, isFullscreen]);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="bg-white rounded-sm border border-zinc-200 shadow-sm overflow-hidden p-8 sm:p-20 text-center text-zinc-650 flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto my-12 animate-fade-in select-none" id="deck-lock-screen">
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-sm shadow-inner">
          <LockKeyhole className="w-10 h-10 text-zinc-900" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-zinc-950 font-bold text-sm font-mono tracking-widest uppercase mb-1">THREADS SOLO ACCESS</h2>
          <p className="text-[11px] text-zinc-550 font-mono leading-relaxed">
            This interactive slideshow contains copyrighted property, deal architectures, and proprietary serial acquirer thesis models. Authorized recipients only. Enter clearance key to unlock.
          </p>
        </div>
        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3 mx-auto">
          <div className="flex space-x-2">
            <input 
              type="password"
              placeholder="ENTER DECK ACCESS CODE..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (pwError) setPwError(false);
              }}
              className="flex-1 text-xs font-mono rounded-sm border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:focus:border-zinc-500 focus:outline-hidden"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold font-mono tracking-wider border border-zinc-900 hover:bg-black transition-colors uppercase rounded-sm cursor-pointer"
            >
              VERIFY
            </button>
          </div>

          {pwError && (
            <p className="text-[10px] text-red-650 font-bold font-mono text-center">• INCORRECT CLEARANCE DECRYPT PASSKEY</p>
          )}
        </form>
        <div className="text-center pt-2">
          <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">
            &copy; 100-YEAR COMPOUNDING PLATFORM ARCHITECTURE • THREADS糸
          </p>
        </div>
      </div>
    );
  }

  // Slide content render functions
  const renderSlideContent = (index: number) => {
    switch (index) {
      case 0: // Slide 1: Disclaimer
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-6 font-sans animate-fade-in select-none">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 text-center mb-8 tracking-tight">
              Disclaimer
            </h2>
            <div className="space-y-6 text-zinc-600 text-sm sm:text-base leading-relaxed text-center font-medium">
              <p className="italic">
                This document is for general information only. It is not an offer to buy or sell any security, nor is it investment advice.
              </p>
              <p className="italic">
                All information is provided &ldquo;as-is&rdquo; without warranty of accuracy or completeness. Each recipient must perform independent due diligence and consult professional advisers before acting.
              </p>
              <p className="italic">
                The document is confidential and may not be reproduced or distributed without prior written consent. It is not intended for distribution to, or use by, any person in any jurisdiction where such distribution or use would be contrary to law or regulation.
              </p>
            </div>
          </div>
        );

      case 1: // Slide 2: Title Slide
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4 py-8 animate-fade-in select-none">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[0.25em] text-zinc-900 uppercase">
              Threads Solo
            </h1>
            <p className="text-base sm:text-xl text-zinc-650 font-medium italic tracking-wide max-w-xl">
              Compound Impact for Eternity
            </p>
            <div className="pt-6">
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                s@firstfollowers.co
              </span>
            </div>
          </div>
        );

      case 2: // Slide 3: Focus Statement
        return (
          <div className="flex flex-col justify-center items-center h-full max-w-3xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl text-zinc-505 font-mono uppercase font-normal tracking-wide">
              Strategic Mission
            </h2>
            <p className="text-3xl sm:text-4.5xl font-extrabold text-[#002855] leading-tight tracking-tight">
              Incubate &amp; Invest <span className="font-normal text-[#1E3A8A] text-2xl sm:text-3.5xl block mt-2">in</span>
              <span className="bg-blue-50 text-[#002855] px-4 py-1.5 rounded-sm inline-block my-3 border border-blue-100">
                Serial Acquirers (SAs)
              </span>
              <span className="block mt-2 text-2xl sm:text-3.5xl font-medium text-[#1E3A8A]">
                with outstanding capital allocators
              </span>
            </p>
          </div>
        );

      case 3: // Slide 4: Definition SAs
        return (
          <div className="flex flex-col justify-center items-center h-full max-w-3.5xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002855] tracking-tight">
              Serial Acquirers (SAs)
            </h2>
            <div className="h-0.5 w-16 bg-blue-600 rounded-full" />
            <p className="text-2xl sm:text-3.5xl font-medium text-[#1E3A8A] leading-relaxed max-w-3xl">
              are permanent holding companies that use serial acquisition as a lever to compound
            </p>
          </div>
        );

      case 4: // Slide 5: Core Values
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-6 space-y-8">
            <h3 className="text-center font-mono uppercase text-zinc-500 tracking-widest text-xs">Core Philosophies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm space-y-3">
                <span className="text-lg font-mono text-[#002855] block">01</span>
                <p className="text-lg font-bold text-[#002855]">Don&apos;t follow short-term trends</p>
                <p className="text-sm font-mono text-[#1E3A8A]">&ldquo;cathedral thinking&rdquo;</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm space-y-3">
                <span className="text-lg font-mono text-[#002855] block">02</span>
                <p className="text-lg font-bold text-[#002855]">Invest in what I know</p>
                <p className="text-sm font-mono text-[#1E3A8A]">&ldquo;circle of competence&rdquo;</p>
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm space-y-3">
                <span className="text-lg font-mono text-[#002855] block">03</span>
                <p className="text-lg font-bold text-[#002855]">Don&apos;t do spray &amp; pray</p>
                <p className="text-sm font-mono text-[#1E3A8A]">&ldquo;conviction&rdquo;</p>
              </div>
            </div>
          </div>
        );

      case 5: // Slide 6: SME Platforms
        return (
          <div className="flex flex-col justify-center h-full max-w-4.5xl mx-auto px-6 space-y-6">
            <h2 className="text-2.5xl sm:text-3.5xl font-extrabold text-[#002855] text-center leading-snug">
              Incubate &amp; Invest in serial acquirers platforms, <br className="hidden sm:inline" />
              that are <span className="underline decoration-blue-500">serial acquirers of SMEs</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-sm">
              <div className="p-5 border border-zinc-150 rounded-sm bg-blue-50/30">
                <div className="font-bold text-zinc-900 mb-2 font-mono text-base">(a)</div>
                <h4 className="font-extrabold text-[#002855] text-lg mb-2">Compound Free Cash Flow</h4>
                <p className="text-zinc-650 leading-relaxed text-xs">
                  Reinvest FCF continuously to acquire more cash-generating enterprises at strong returns.
                </p>
              </div>
              <div className="p-5 border border-zinc-150 rounded-sm bg-blue-50/30">
                <div className="font-bold text-zinc-900 mb-2 font-mono text-base">(b)</div>
                <h4 className="font-extrabold text-[#002855] text-lg mb-2">Buy SMEs at low EBITDA</h4>
                <p className="text-zinc-650 leading-relaxed text-xs">
                  Arb multiples — acquire small private enterprises at 3-5x EBITDA and roll into a public premium.
                </p>
              </div>
              <div className="p-5 border border-zinc-150 rounded-sm bg-blue-50/30">
                <div className="font-bold text-zinc-900 mb-2 font-mono text-base">(c)</div>
                <h4 className="font-extrabold text-[#002855] text-lg mb-2">Reduces Idiosyncratic Risk</h4>
                <p className="text-zinc-650 leading-relaxed text-xs">
                  Each decentralized bolt-on purchase dilutes operational single-points of failure across the board.
                </p>
              </div>
            </div>
          </div>
        );

      case 6: // Slide 7: Thesis Section Divider
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center max-w-4xl mx-auto px-6 gap-6 animate-fade-in select-none">
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <span className="text-[10rem] font-bold text-zinc-100 font-mono select-none leading-none tracking-tighter">01</span>
            </div>
            <div className="md:col-span-8 space-y-3 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.25em] block">SECTION ZERO ONE</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002855] uppercase tracking-tight">
                The Thesis
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed max-w-sm">
                Deconstructing why decentralized serial acquisitions of private SMEs create an exceptionally low-risk, high-compounding engine over generational horizons.
              </p>
            </div>
          </div>
        );

      case 7: // Slide 8: Serial Acquirers Edge Comparing table
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 font-sans space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Serial Acquirers Edge
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 space-y-3.5 text-xs sm:text-sm">
                <p className="leading-relaxed">
                  <strong className="text-[#002855] text-base block">Stable Returns:</strong> 
                  Long-term, cash-flow focus delivers steady gains, largely uncorrelated with VC cycles.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[#002855] text-base block">Arbitrage Boost:</strong> 
                  Buy cheap (low EBITDA), trade high (higher P/E) &rarr; rapid share-price compounding.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[#002855] text-base block">Built-In Diversification:</strong> 
                  More deals = broader sector/geo spread = lower blow-up risk.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[#002855] text-base block">Cheap Entry:</strong> 
                  Small-business multiples are low and easy to fix, so high returns need little debt.
                </p>
              </div>

              <div className="lg:col-span-6 bg-white border border-zinc-200 p-4 rounded-sm space-y-3 text-[11px]">
                <h4 className="font-bold text-center text-zinc-800 uppercase tracking-wide border-b pb-1 font-mono">
                  A Private Strategy for Public Markets
                </h4>
                <div className="grid grid-cols-3 gap-2 font-mono font-bold text-[9px] border-b pb-1">
                  <div>FEATURE</div>
                  <div className="text-blue-900">ACQ-DRIVEN COMPOUNDERS</div>
                  <div className="text-zinc-500">PRIVATE EQUITY</div>
                </div>
                {[
                  { name: "Investment horizon", acq: "Permanent home", pe: "5-7 years" },
                  { name: "Continuity of culture", acq: "No change", pe: "?" },
                  { name: "Due diligence", acq: "Internal DD", pe: "Long process" },
                  { name: "Governance", acq: "Board member", pe: "Operational inv." },
                  { name: "Post transaction", acq: "Autonomy & reporting", pe: "Change" },
                  { name: "Financing", acq: "Free cash flow", pe: "Use of debt" }
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 border-b border-zinc-100 py-1 font-sans">
                    <div className="font-semibold text-zinc-500">{row.name}</div>
                    <div className="text-[#002855] font-bold">{row.acq}</div>
                    <div className="text-zinc-600">{row.pe}</div>
                  </div>
                ))}
                <span className="block text-right text-[9px] text-zinc-400 font-mono">
                  Source: REQ Capital
                </span>
              </div>
            </div>
          </div>
        );

      case 8: // Slide 9: Focus Regions
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Focus Regions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-4">
                <div className="border-l-4 border-blue-600 pl-4 space-y-1">
                  <h4 className="font-bold text-[#002855] text-lg flex items-center gap-1.5 font-mono">
                    🇯🇵 Japan
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Faces succession challenges with profitable SMEs, creating massive consolidation opportunities.
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Examples: Next Generation Technology Group
                  </p>
                </div>

                <div className="border-l-4 border-zinc-650 pl-4 space-y-1">
                  <h4 className="font-bold text-zinc-900 text-lg flex items-center gap-1.5 font-mono">
                    🇸🇪 Nordics
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Home to successful serial acquirers like Lifco and Indutrade, with a culture of innovation and strong corporate governance.
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Examples: Röko AB, Lifco, Indutrade
                  </p>
                </div>
              </div>

              <div className="md:col-span-7 bg-[#001c55]/5 border border-blue-100 p-6 rounded-sm text-center">
                <p className="text-xl sm:text-2xl font-bold leading-relaxed text-[#002855]">
                  <strong className="text-blue-700">Nordics</strong> and <strong className="text-blue-700">Pacific Asia</strong> as the primary target regions that are rich with quality SMEs to <span className="underline">incubate serial acquirers</span>, acquiring quality SMEs.
                </p>
              </div>
            </div>
          </div>
        );

      case 9: // Slide 10: Better than VC/PE Line chart
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-1">
              Better than VC/PE
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Chart container */}
              <div className="lg:col-span-8 bg-white border border-zinc-200 p-3 rounded-sm h-[260px]">
                <span className="block text-[10px] text-zinc-405 font-mono font-bold text-center mb-1">
                  Performance Comparison: Serial Acquirers vs Berkshire vs S&amp;P 500 vs VC (2000-2024 Log)
                </span>
                <ResponsiveContainer width="100%" height="88%">
                  <LineChart data={slide10Data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis 
                      scale="log" 
                      domain={[50, 25000]} 
                      tick={{ fontSize: 9, fontFamily: "monospace" }}
                      ticks={[100, 1000, 10000]}
                    />
                    <Tooltip contentStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="Constellation Software" stroke="#C084FC" strokeWidth={2.5} dot={false} name="CSU Proxy" />
                    <Line type="monotone" dataKey="Serial Acquirers" stroke="#3B82F6" strokeWidth={2} dot={false} name="Serial Acquirers Index" />
                    <Line type="monotone" dataKey="US Venture Capital" stroke="#EAB308" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="US VC Index" />
                    <Line type="monotone" dataKey="Berkshire Hathaway" stroke="#10B981" strokeWidth={1.5} dot={false} name="Berkshire" />
                    <Line type="monotone" dataKey="S&P 500" stroke="#EF4444" strokeWidth={1.5} dot={false} name="S&P 500" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <strong className="text-[#002855] text-sm block">Outperformance:</strong>
                  <p className="text-zinc-650 font-sans">Serial acquirers beat top-quartile VC/PE funds.</p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[#002855] text-sm block">Superior Profile:</strong>
                  <p className="text-zinc-650 font-sans">Higher net returns, daily liquidity, lower risk.</p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[#002855] text-sm block">VC/PE Drag:</strong>
                  <p className="text-zinc-650 font-sans">Illiquid, fee-laden, long-dated, high-variance payouts.</p>
                </div>
                <span className="block text-[8.5px] text-zinc-400 font-mono leading-tight">
                  All CAGR values are for the 20-year period from Jan 2004 to Dec 2023, using FactSet &amp; Cambridge Associates.
                </span>
              </div>
            </div>
          </div>
        );

      case 10: // Slide 11: Impact with quotes
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Impact
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <h4 className="font-extrabold text-[#002855]">Guardians of Hidden Champions</h4>
                    <p className="text-zinc-600 text-xs">Buy, never flip; PE strips, they preserve legacy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">🧩</span>
                  <div>
                    <h4 className="font-extrabold text-[#002855]">Generational Lens</h4>
                    <p className="text-zinc-600 text-xs">Long-horizon cash flow, not quick exit.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">🌍</span>
                  <div>
                    <h4 className="font-extrabold text-[#002855]">Future-Proof Legacy</h4>
                    <p className="text-zinc-600 text-xs font-sans">Green + AI upgrades, DNA intact.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">🤝</span>
                  <div>
                    <h4 className="font-extrabold text-[#002855]">Trust via Autonomy</h4>
                    <p className="text-zinc-600 text-xs">Radical decentralization breeds loyalty and trust.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">📈</span>
                  <div>
                    <h4 className="font-extrabold text-[#002855]">Job preservation &amp; productivity growth</h4>
                    <p className="text-zinc-600 text-xs">Studies show multi-year productivity gains of 8-15% post-acquisition with minimal net job losses.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#001C55]/5 border border-dashed border-blue-200 p-6 rounded-sm space-y-3.5 text-center">
                <span className="text-xl block">🌿</span>
                <p className="text-[#1E3A8A] leading-relaxed text-xs italic font-medium">
                  &ldquo;Teledyne is like a living plant, with our companies the different branches and each putting out new branches and growing so that no one business is too significant.&rdquo;
                </p>
                <div className="text-zinc-900 font-bold font-mono tracking-wider text-[11px] uppercase">
                  Henry Singleton
                </div>
              </div>
            </div>
          </div>
        );

      case 11: // Slide 12: SMEs Market Size Donut chart
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              SMEs Market Size
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 space-y-3 text-xs">
                <p>
                  <strong className="text-[#002855] text-sm block">🎯 Compounding Machines</strong>
                  Reinvest free cash at high ROCE, bolt-on after bolt-on.
                </p>
                <p>
                  <strong className="text-[#002855] text-sm block">🌐 Endless Runway</strong>
                  Tap the global SME ocean; no sector or border limits.
                </p>
                <p>
                  <strong className="text-[#002855] text-sm block">📊 Europe&apos;s SME Goldmine</strong>
                  23.5 M SMEs, 99.8% small, 94% founder-owned.
                </p>
                <p>
                  <strong className="text-[#002855] text-sm block">🏷️ Deal Flow</strong>
                  ~15k European SMEs change hands yearly. Roughly 60% of privately held SMEs in the U.S., Europe and Australia are owned by baby-boomers who will retire inside the next decade.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white border border-zinc-200 p-3 rounded-sm text-center h-[240px] flex flex-col justify-between">
                <span className="text-[10px] font-bold font-mono text-zinc-505 block">SMEs in Europe (Units Relative)</span>
                <div className="h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={slide12Data} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={75} 
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {slide12Data.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: "9px", fontFamily: "monospace" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 text-[8.5px] font-mono leading-none">
                  {slide12Data.slice(0, 5).map((entry, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="w-2 h-2 inline-block rounded-xs" style={{ backgroundColor: entry.color }} />
                      {entry.name}: {entry.value}M
                    </span>
                  ))}
                  <span className="text-[8.5px] font-bold text-zinc-400">Source: REQ Capital</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 12: // Slide 13: Section Divider Portfolio
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center max-w-4xl mx-auto px-6 gap-6 animate-fade-in select-none">
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <span className="text-[10rem] font-bold text-zinc-100 font-mono select-none leading-none tracking-tighter">02</span>
            </div>
            <div className="md:col-span-8 space-y-3 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.25em] block">SECTION ZERO TWO</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002855] uppercase tracking-tight">
                Portfolio Architecture
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed max-w-sm">
                Analyzing our deliberate structuring, focus parameters, and risk-allocation guidelines designed to survive multiple economic cycles.
              </p>
            </div>
          </div>
        );

      case 13: // Slide 14: Portfolio Table Summary (Very rich slide)
        return (
          <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-2 space-y-3">
            <h3 className="text-lg font-extrabold text-[#002855] border-b border-zinc-200 pb-1">
              Active Portfolio Architecture &amp; Deal Flow pipelines
            </h3>
            <div className="overflow-x-auto border border-zinc-200 rounded-sm bg-white">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-800 uppercase font-mono border-b border-zinc-200 text-[9.5px]">
                    <th className="py-2.5 px-3 font-extrabold w-1/4">Opportunity</th>
                    <th className="py-2.5 px-3 font-extrabold w-1/3">Description &amp; Financials</th>
                    <th className="py-2.5 px-3 font-extrabold">Evolution &amp; Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      Waste Management Digital Brokerage
                      <span className="block font-normal text-[9.5px] text-zinc-400 font-mono mt-0.5">40-yr family-owned, EU</span>
                    </td>
                    <td className="py-2.5 px-3">
                      Tech-driven circular economy platform. Key leases, maintenance, coordination.
                      <span className="block font-semibold text-emerald-700 mt-1">€8.2M revenue (2025E) &rarr; €15.7M (2026E) | 60-80% Recurring</span>
                    </td>
                    <td className="py-2.5 px-3 leading-relaxed">
                      <strong>Evolution:</strong> Complementary waste/logistics roll up. Hold forever.
                      <span className="block text-[#002855] mt-1"><strong>Role:</strong> Board seat (10-15%). Structured path to IPO/Buyout.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      Tech-Enabled Infrastructure Services
                      <span className="block font-normal text-[9.5px] text-zinc-400 font-mono mt-0.5">Residential upgrading</span>
                    </td>
                    <td className="py-2.5 px-3">
                      Aging housing stock modernization for solar, EV, storage. 2,500+ completed.
                      <span className="block font-semibold text-emerald-700 mt-1">€11.1M revenue (2025E) &rarr; €15M (2026E)</span>
                    </td>
                    <td className="py-2.5 px-3 leading-relaxed">
                      <strong>Evolution:</strong> Serial acquisition of small electrical, sewage, and home energy.
                      <span className="block text-[#002855] mt-1"><strong>Role:</strong> Stake of 10-15%. Lead rounds to unlock capital.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      Biomanufacturing CMO &rarr; Biotech HoldCo
                      <span className="block font-normal text-[9.5px] text-zinc-400 font-mono mt-0.5">Family-owned, distressed</span>
                    </td>
                    <td className="py-2.5 px-3">
                      Licensing IPs. Distressed cheap entry. Direct sovereign wealth interest (Temasek, GIC, Malaysian Govt).
                    </td>
                    <td className="py-2.5 px-3 leading-relaxed">
                      <strong>Evolution:</strong> Purchase cheap distressed biotech assets, license IP for FCF. Permanent biotech holding.
                      <span className="block text-[#002855] mt-1"><strong>Role:</strong> 40% equity + board. Architect buy-build-license.</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-zinc-900">
                      Industrial-Tech Venture Studio
                      <span className="block font-normal text-[9.5px] text-zinc-400 font-mono mt-0.5">Backed by Enterprise Singapore</span>
                    </td>
                    <td className="py-2.5 px-3">
                      Founder sold semiconductor SME. Pivot from studio to permanent compounding model.
                    </td>
                    <td className="py-2.5 px-3 leading-relaxed">
                      <strong>Evolution:</strong> Convert pipeline and studio assets into a permanent hold company.
                      <span className="block text-[#002855] mt-1"><strong>Role:</strong> Advisor + board. &gt;10% minority stake. Shape allocation.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 14: // Slide 15: Returns case studies divider
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center max-w-4xl mx-auto px-6 gap-6 animate-fade-in select-none">
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <span className="text-[10rem] font-bold text-zinc-100 font-mono select-none leading-none tracking-tighter">03</span>
            </div>
            <div className="md:col-span-8 space-y-3 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.25em] block">SECTION ZERO THREE</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002855] uppercase tracking-tight">
                Returns &amp; Cases
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed max-w-sm">
                Empirical historical evidence demonstrating the long-term outperformance of serial compounders globally and across specific regional focus markets.
              </p>
            </div>
          </div>
        );

      case 15: // Slide 16: Nordic Performance Line Chart
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Nordic Performance
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-8 bg-white border border-zinc-200 p-3 rounded-sm h-[250px]">
                <span className="block text-[10px] text-zinc-505 font-mono text-center mb-1">
                  Compound Returns Comparison (Base 100, 2004-2023)
                </span>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={slide16Data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="Acquisition-driven compounders (Nordic)" stroke="#2563EB" strokeWidth={3} dot={false} name="Acquirers (Nordic)" />
                    <Line type="monotone" dataKey="Berkshire Hathaway" stroke="#10B981" strokeWidth={1.5} dot={false} name="Berkshire" />
                    <Line type="monotone" dataKey="OMX Allshare Sweden" stroke="#60A5FA" strokeWidth={1.5} dot={false} name="OMX Sweden" />
                    <Line type="monotone" dataKey="MSCI World" stroke="#EAB308" strokeWidth={1.5} dot={false} name="MSCI World" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-sm">
                  <span className="text-[10px] font-mono text-blue-700 tracking-wider block font-bold uppercase">NORDIC POWERHOUSE</span>
                  <p className="text-2xl sm:text-3.5xl font-extrabold text-[#002855] my-2">UP BY 34x</p>
                  <p className="text-zinc-650 text-xs font-sans leading-relaxed">
                    Nordic serial acquirers compounded at <strong className="text-blue-900 font-bold">19.4% CAGR</strong> over 20 years, while Berkshire Hathaway compounded at <strong>9.7% CAGR</strong> (up 6.4x).
                  </p>
                </div>
                <span className="block text-[8.5px] text-zinc-400 font-mono tracking-wide">
                  Source: Factset / REQ Capital. Average for companies identified as acquisition-driven compounders.
                </span>
              </div>
            </div>
          </div>
        );

      case 16: // Slide 17: Global Performance Line Chart
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Global Performance
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-8 bg-white border border-zinc-200 p-3 rounded-sm h-[250px]">
                <span className="block text-[10px] text-zinc-505 font-mono text-center mb-1">
                  Compound Returns (Base 100, 2004-2023)
                </span>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={slide17Data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                    <XAxis dataKey="year" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Tooltip contentStyle={{ fontSize: 10, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="Acquisition-driven compounders (Global)" stroke="#1D4ED8" strokeWidth={3} dot={false} name="Acquirers (Global)" />
                    <Line type="monotone" dataKey="Berkshire Hathaway" stroke="#10B981" strokeWidth={1.5} dot={false} name="Berkshire" />
                    <Line type="monotone" dataKey="S&P 500" stroke="#EF4444" strokeWidth={1.5} dot={false} name="S&P 500" />
                    <Line type="monotone" dataKey="MSCI World" stroke="#EAB308" strokeWidth={1.5} dot={false} name="MSCI World" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-sm">
                  <span className="text-[10px] font-mono text-blue-700 tracking-wider block font-bold uppercase">GLOBAL INDEX MULTIPLES</span>
                  <p className="text-2xl sm:text-3.5xl font-extrabold text-[#002855] my-2">UP BY 24x</p>
                  <p className="text-zinc-650 text-xs font-sans leading-relaxed">
                    Global serial acquirers grew 24x at <strong className="text-blue-900 font-bold">17.5% CAGR</strong> over the same 20-year cycle, vastly outperforming major indices.
                  </p>
                </div>
                <span className="block text-[8.5px] text-zinc-400 font-mono tracking-wide">
                  Source: Factset / REQ Capital. Average for companies identified as acquisition-driven compounders.
                </span>
              </div>
            </div>
          </div>
        );

      case 17: // Slide 18: Constellation Software Horizontal Bar Chart
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-1">
              Constellation Software
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-6 bg-white border border-zinc-200 p-3.5 rounded-sm h-[240px]">
                <span className="block text-[10px] text-zinc-505 font-mono text-center mb-2 font-bold uppercase">
                  TSR CAGR since Constellation&apos;s 2006 IPO
                </span>
                <ResponsiveContainer width="100%" height="82%">
                  <BarChart data={slide18Data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                    <XAxis type="number" unit="%" tick={{ fontSize: 9, fontFamily: "monospace" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontFamily: "monospace" }} width={80} />
                    <Tooltip contentStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                    <Bar dataKey="value" fill="#1E3A8A">
                      {slide18Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#110D59" : "#3B82F6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-6 space-y-3 text-xs sm:text-sm">
                <p className="leading-relaxed">
                  While the results at Constellation are truly remarkable, what&apos;s more impressive is that these returns are not unique.
                </p>
                <p className="leading-relaxed">
                  In other parts of the world, serial acquirers also deliver extraordinary returns to investors. List of approximately 30 serial acquirers whose median 3, 5, and 10-year returns are <strong className="text-blue-900 border-b border-blue-200">29% pa</strong>, <strong className="text-blue-900 border-b border-blue-200">27.5% pa</strong>, and <strong className="text-blue-900 border-b border-blue-200">28% pa</strong>, respectively.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 border border-zinc-200 rounded">
                    <span className="text-lg font-bold text-blue-900 block font-mono">29%</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Return 3Y</span>
                  </div>
                  <div className="p-2 border border-zinc-200 rounded">
                    <span className="text-lg font-bold text-blue-900 block font-mono">27.5%</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Return 5Y</span>
                  </div>
                  <div className="p-2 border border-zinc-200 rounded">
                    <span className="text-lg font-bold text-blue-900 block font-mono">28%</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Return 10Y</span>
                  </div>
                </div>
                <span className="block text-[9px] text-zinc-450 font-mono text-right pt-2">[Source: PieLAB Serial Acquirers Paper]</span>
              </div>
            </div>
          </div>
        );

      case 18: // Slide 19: Henry Singleton Financials
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-3 animate-fade-in select-none">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-1">
              Henry Singleton
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5 space-y-3 text-xs sm:text-sm">
                <p className="leading-relaxed">
                  <strong className="text-[#002855] block text-base font-extrabold text-blue-750">Sales grew from $4.5 million (1961) to $1.2 billion (1970) in 10 years - 270 times purely by acquisitions.</strong>
                </p>
                <p className="text-zinc-650 leading-relaxed font-sans text-xs">
                  By the end of 1965, Teledyne had acquired 34 companies in total. By the late 1960s, Teledyne had acquired around 124 companies in its first decade.
                </p>
                <span className="block text-[9px] text-zinc-400 font-mono italic">
                  Source: Distant force: a memoir of the Teledyne Corporation
                </span>
              </div>

              <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-sm shadow-xs p-1 overflow-x-auto max-w-full">
                <div className="px-3 py-2 font-bold text-zinc-800 border-b border-zinc-200 flex justify-between items-center text-[10px] font-mono">
                  <span>TELEDYNE ACQUISITION ENGINE METRICS</span>
                  <span className="text-zinc-400">[MILLIONS EXCEPT SHARES]</span>
                </div>
                <table className="w-full text-right border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="bg-zinc-50 font-bold border-b border-zinc-200 text-zinc-650 text-[9.5px]">
                      <th className="py-2 px-3 text-left">YEAR</th>
                      <th className="py-2 px-3">SALES</th>
                      <th className="py-2 px-3">NET INCOME</th>
                      <th className="py-2 px-3">NET INC/SH</th>
                      <th className="py-2 px-3">SHARES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2 px-3 text-left font-bold text-zinc-900 border-r border-zinc-100">1961</td>
                      <td className="py-2 px-3 font-bold text-[#002855]">$4.5</td>
                      <td className="py-2 px-3">0.06</td>
                      <td className="py-2 px-3">0.01</td>
                      <td className="py-2 px-3 text-zinc-500">2,385,826</td>
                    </tr>
                    <tr className="bg-zinc-50/40 hover:bg-zinc-50 transition-colors">
                      <td className="py-2 px-3 text-left font-bold text-zinc-900 border-r border-zinc-100">1962</td>
                      <td className="py-2 px-3">$10.4</td>
                      <td className="py-2 px-3">0.16</td>
                      <td className="py-2 px-3">0.05</td>
                      <td className="py-2 px-3 text-zinc-500">3,188,569</td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2 px-3 text-left font-bold text-zinc-900 border-r border-zinc-100">1965</td>
                      <td className="py-2 px-3 font-bold text-[#002855]">$86.5</td>
                      <td className="py-2 px-3">3.40</td>
                      <td className="py-2 px-3">0.42</td>
                      <td className="py-2 px-3 text-zinc-500">7,908,056</td>
                    </tr>
                    <tr className="bg-zinc-50/40 hover:bg-zinc-50 transition-colors">
                      <td className="py-2 px-3 text-left font-bold text-zinc-900 border-r border-zinc-100">1966</td>
                      <td className="py-2 px-3">$256.8</td>
                      <td className="py-2 px-3">12.00</td>
                      <td className="py-2 px-3">0.77</td>
                      <td className="py-2 px-3 text-zinc-500">15,718,062</td>
                    </tr>
                    <tr className="hover:bg-zinc-50 transition-colors">
                      <td className="py-2 px-3 text-left font-bold text-zinc-900 border-r border-zinc-100">1970</td>
                      <td className="py-2 px-3 font-bold text-[#002855]">$1,216.4</td>
                      <td className="py-2 px-3">62.00</td>
                      <td className="py-2 px-3">1.91</td>
                      <td className="py-2 px-3 text-zinc-500">32,496,026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 19: // Slide 20: Roko AB Sweden Case
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Röko AB (Sweden)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-sm">
                    39% IRR
                    <span className="block text-[9px] font-mono font-normal">over first 6 years</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#002855] text-lg">Röko AB: A Nordic Serial Acquirer</h4>
                    <p className="text-zinc-550 font-mono text-xs">Founded 2018 • 27 companies • $600M revenue</p>
                  </div>
                </div>
                <p className="leading-relaxed text-zinc-650 font-sans">
                  Founded in 2018 by Fredrik Karlsson, a former Lifco executive, Röko has rapidly scaled to become a significant player in the Nordic region, generating over $600 million in revenue within just six years.
                </p>

                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-sm space-y-2">
                  <h5 className="font-mono font-bold text-[11px] uppercase tracking-wider text-blue-900 border-b pb-1">Company overview Success Factors</h5>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-700">
                    <li>⭐ Asset-light company focus</li>
                    <li>⭐ Decentralized management model</li>
                    <li>⭐ 15% minimum EBIT margin requirement</li>
                    <li>⭐ 10-year put-call option for founders</li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-4 bg-blue-50/50 border border-blue-150 p-5 rounded-sm space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-[#002855] uppercase font-mono text-center pb-2 border-b">Acquisition Discipline</h4>
                <p>
                  Röko reviews approximately <strong className="text-blue-900">300-400 potential deals annually</strong>, resulting in a highly selective acquisition rate of just 6-12 companies per year.
                </p>
                <p className="font-medium text-[#1E3A8A]">
                  This discipline ensures capital is deployed only into opportunities with high conviction.
                </p>
              </div>
            </div>
          </div>
        );

      case 20: // Slide 21: NGTG Japan Case
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              NGTG, Inc. (Japan)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-blue-50 border border-blue-250 text-blue-800 font-bold rounded-sm">
                    70 Yrs
                    <span className="block text-[9px] font-mono font-normal">Median SME owner age</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#002855] text-lg">Next Generation Technology Group (NGTG)</h4>
                    <p className="text-zinc-550 font-mono text-xs">Japan&apos;s &ldquo;Danaher&rdquo; • IPO 2025 • $300M market cap</p>
                  </div>
                </div>

                <p className="leading-relaxed text-zinc-650 font-sans">
                  <strong>Market Opportunity:</strong> NGTG addresses Japan&apos;s SME succession crisis, where 56% of SMEs that went out of business in 2023 were profitable at the time of closure due to aging demographics.
                </p>

                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-sm space-y-2">
                  <h5 className="font-mono font-bold text-[11px] uppercase tracking-wider text-blue-900 border-b pb-1">Corporate Financial Performance</h5>
                  <ul className="grid grid-cols-2 gap-3 text-xs text-zinc-700">
                    <li>📈 ¥11.1B revenue (2024)</li>
                    <li>📈 ¥2.2B adjusted EBITDA</li>
                    <li>🔍 2-5x EBITDA acquisition multiples</li>
                    <li>🏦 ~1% average interest rate on debt</li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-4 bg-teal-50/50 border border-teal-150 p-5 rounded-sm space-y-2 text-xs leading-relaxed">
                <h4 className="font-bold text-teal-900 uppercase font-mono text-center pb-1 border-b">NGTG Growth Program</h4>
                <p className="text-[11px]">
                  Proprietary value creation playbook with over <strong className="text-teal-950 font-extrabold">150 different menus of support</strong>, covering sales, production, HR, digital transformation, and business management workflows.
                </p>
              </div>
            </div>
          </div>
        );

      case 21: // Slide 22: People Section Divider
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center max-w-4xl mx-auto px-6 gap-6 animate-fade-in select-none">
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <span className="text-[10rem] font-bold text-zinc-100 font-mono select-none leading-none tracking-tighter">04</span>
            </div>
            <div className="md:col-span-8 space-y-3 text-center md:text-left border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.25em] block">SECTION ZERO FOUR</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002855] uppercase tracking-tight">
                People
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-sans leading-relaxed max-w-sm">
                Introducing the founder, philosophical influences, and our core collaborative frameworks leveraging small teams augmented by machine intelligence.
              </p>
            </div>
          </div>
        );

      case 22: // Slide 23: About Sagar Tandon
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              About Sagar Tandon, Founder
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 bg-zinc-100 p-5 border border-zinc-200 rounded text-center space-y-3">
                <div className="w-24 h-24 bg-zinc-300 rounded-full mx-auto flex items-center justify-center border-2 border-white">
                  <Users className="w-12 h-12 text-zinc-500" />
                </div>
                <div>
                  <h4 className="font-extrabold text-zinc-900">Sagar Tandon</h4>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-loose">Founder, Portfolio Architect</p>
                </div>
                <div className="p-2 border border-zinc-200 bg-white rounded text-[11px] font-mono font-bold leading-normal">
                  launched 3 Impact VC Funds <br /> 30+ Investments
                </div>
              </div>

              <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-left">
                <div className="space-y-2 leading-relaxed">
                  <p>
                    <strong>Threads</strong> is building a compounding engine that generates returns &amp; impact for the next 100 years. Threads are strong yet flexible&mdash;ideal for a long-term, adaptive capital allocator.
                  </p>
                  <p className="text-zinc-650">
                    Threads derive inspiration from <strong>Warren Buffett, Charlie Munger, Eiichi Shibusawa, Dr. Seiroku Honda, Mark Leonard, Henry Singleton</strong>.
                  </p>
                </div>

                <div className="border-t border-dashed border-zinc-200 pt-3.5 grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-[#002855] block">30+ investments</span>
                    <span className="text-zinc-500 text-[11px]">in venture, impact &amp; climate</span>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-[#002855] block">Active Investor</span>
                    <span className="text-zinc-500 text-[11px]">in listed Serial Acquirers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 23: // Slide 24: Solo? Autonomy & Focus
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Solo? Autonomy &amp; Focus
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 bg-zinc-50 border p-5 rounded border-zinc-200 text-center space-y-3">
                <span className="text-4xl">🧘‍♂️</span>
                <p className="italic text-xs font-semibold leading-relaxed text-zinc-700">
                  &ldquo;Charlie swam against the tide indefinitely&mdash;a rare trait.&rdquo;
                </p>
                <span className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">— Poor Charlie&apos;s Almanack</span>
              </div>

              <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#002855] text-base">Autonomy &amp; Focus</h4>
                  <ul className="space-y-2 text-zinc-700">
                    <li>🟢 <strong>Swift Decision-Making:</strong> No partners, no politics. Just decisive action on high-conviction opportunities.</li>
                    <li>🟢 <strong>Small Fund Outperformance:</strong> Per Cambridge Associates &amp; Preqin, small, nimble funds frequently outperform larger competitors.</li>
                    <li>🟢 <strong>Focused Discipline:</strong> Dedicated attention to portfolio companies and new investment identification.</li>
                  </ul>
                </div>

                <div className="border-t pt-3.5 space-y-1.5">
                  <h4 className="font-extrabold text-[#002855] text-base">Resource Constraints + AI</h4>
                  <ul className="space-y-2 text-zinc-700">
                    <li>🟢 <strong>Break the fee model:</strong> Charge minimal survival rates (&lt;1%) and reinvest the remaining skin in the game.</li>
                    <li>🟢 <strong>AI as a precision tool:</strong> Focused solely on augmenting tactical analytical rigor and operational efficiency metrics.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 24: // Slide 25: Solo (+) AI
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Solo (+) AI?
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 p-5 bg-[#001C55]/5 border border-dashed border-blue-200 rounded text-center space-y-2">
                <span className="text-4xl block">🧠</span>
                <p className="font-extrabold text-blue-900 leading-relaxed text-xs">
                  &ldquo;The future of investing isn&apos;t big teams&mdash;it&apos;s solo capitalists armed with AI.&rdquo;
                </p>
              </div>

              <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-[#002855] text-base font-mono">1. Due Diligence Automation</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-zinc-650 text-xs">
                    <li><strong>Document Parsing:</strong> AI extracts key terms from 100s of pages (e.g. earn-out blocks, non-competes) into red-flag dashboards.</li>
                    <li><strong>Fact check:</strong> Cross-check founder claims with past exits (e.g. CEO past metrics: 2x MOIC or 0.5x).</li>
                    <li><strong>Bias Check:</strong> sentiment metrics on earnings calls to spot overpromising &ldquo;synergies&rdquo;.</li>
                  </ul>
                </div>

                <div className="border-t border-dashed border-zinc-200 pt-3.5 space-y-2">
                  <h4 className="font-extrabold text-[#002855] text-base font-mono">2. AI Research Librarian</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-zinc-650 text-xs">
                    <li><strong>Modeling &amp; Data Crunching:</strong> Advanced DCF/MOS benchmarks, ROCE/IRR stress tests over massive SME sheets.</li>
                    <li><strong>Comparative Analysis:</strong> instant queries (e.g. BuyOut multiple benchmarking vs Röko pre-IPO cycles).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 25: // Slide 26: Thought Leadership Substack
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              Thought Leadership: First Followers Substack
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-6 space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-lg text-zinc-900">First Followers Substack</h4>
                <p className="text-zinc-650">
                  I write a monthly newsletter reaching <strong>4,000+ subscribers</strong> across venture capitalists, fund managers, entrepreneurs, and venture builders.
                </p>
                <p className="text-zinc-650">
                  Delivering insights on venture studios, serial acquirers, and innovative capital structures that are reshaping today&apos;s investment landscape.
                </p>
                <div className="p-3 border border-zinc-200 bg-zinc-50 rounded italic font-semibold text-blue-900 border-l-4 border-l-blue-600">
                  &ldquo;Charlie and I are not stock-pickers; we are business-pickers.&rdquo; &mdash; Warren Buffett
                </div>
              </div>

              <div className="lg:col-span-6 bg-white border border-zinc-200 p-4 rounded-sm">
                <span className="block text-[11px] font-bold font-mono text-[#002855] uppercase tracking-wider mb-2 border-b pb-1">
                  HISTORICAL SUBSTACK READERSHIP
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold">
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">3,500+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Capital Allocation</span>
                  </div>
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">3,300+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">&ldquo;Alts of Alts&rdquo;</span>
                  </div>
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">2,700+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">&ldquo;Lone Wolf&rdquo;</span>
                  </div>
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">3,400+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Over Diversification</span>
                  </div>
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">2,900+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Trust Infrastructure</span>
                  </div>
                  <div className="p-2 border border-zinc-100 rounded">
                    <span className="text-[#002855] block font-mono text-base">3,300+</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Micro Acquisition Funds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 26: // Slide 27: Inspiration books
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4 animate-fade-in select-none">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-1.5 flex items-center justify-between">
              <span>Inspiration of Capital Compounders</span>
              <span className="text-xs font-mono text-zinc-400 font-normal uppercase tracking-wider hidden sm:inline">Literary and Tactical Roots</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Intricate CSS Book Covers */}
              <div className="md:col-span-7 bg-zinc-50/50 border border-zinc-200 p-4 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 block mb-3 uppercase">
                    📚 CORE LITERARY BLUEPRINT (6 PILLARS)
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Book 1: Hidden Champions */}
                    <div className="h-32 bg-[#001D55] text-amber-100 rounded-sm p-2 flex flex-col justify-between shadow-xs border border-blue-900 font-serif relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20" />
                      <div className="text-[8px] tracking-wide font-sans text-zinc-300 font-bold">HERMANN SIMON</div>
                      <div className="text-[9.5px] leading-tight font-extrabold">HIDDEN CHAMPIONS</div>
                      <div className="text-[7.5px] text-zinc-400">21st Century</div>
                    </div>

                    {/* Book 2: The Outsiders */}
                    <div className="h-32 bg-white text-zinc-900 rounded-sm p-2 flex flex-col justify-between shadow-xs border border-zinc-300 font-sans relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-100" />
                      <div className="text-[7px] tracking-widest text-zinc-500 font-bold uppercase">WILLIAM THORNDIKE</div>
                      <div className="text-[11px] leading-snug font-black text-zinc-900 uppercase tracking-tighter">THE OUTSIDERS</div>
                      <div className="text-[7px] text-blue-800 font-bold">8 Master Allocators</div>
                    </div>

                    {/* Book 3: Last Liberal Art */}
                    <div className="h-32 bg-[#FAF6F0] text-[#2C2114] rounded-sm p-2 flex flex-col justify-between shadow-xs border border-[#EBE3D5] font-serif relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-900/10" />
                      <div className="text-[8px] font-sans text-amber-900 font-semibold">R. G. HAGSTROM</div>
                      <div className="text-[9.5px] leading-snug font-bold">INVESTING: THE LAST LIBERAL ART</div>
                      <div className="text-[7px] text-amber-800 italic">Multidisciplinary</div>
                    </div>

                    {/* Book 4: Poor Charlie's Almanack */}
                    <div className="h-32 bg-[#4A1521] text-[#F3E5AB] rounded-sm p-2 flex flex-col justify-between shadow-xs border border-[#3A0F18] font-serif relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-600/30" />
                      <div className="text-[7px] tracking-wider text-[#D4AF37] font-bold">CHARLIE MUNGER</div>
                      <div className="text-[9.5px] leading-tight font-black uppercase tracking-tight text-white border-b border-[#D4AF37]/30 pb-1">POOR CHARLIE&apos;S ALMANACK</div>
                      <div className="text-[7px] text-zinc-300 font-sans">Mental Models</div>
                    </div>

                    {/* Book 5: The Compounders */}
                    <div className="h-32 bg-[#122A1E] text-zinc-100 rounded-sm p-2 flex flex-col justify-between shadow-xs border border-[#0A1A12] font-sans relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/30" />
                      <div className="text-[8px] text-emerald-400 font-mono">Dybvad &amp; Nyland</div>
                      <div className="text-[11px] leading-tight font-extrabold uppercase text-[#ECEEEB]">THE COMPOUNDERS</div>
                      <div className="text-[7.5px] text-zinc-400 font-sans">Serial Acquirers</div>
                    </div>

                    {/* Book 6: Distant Force */}
                    <div className="h-32 bg-[#2D3139] text-[#E56A25] rounded-sm p-2 flex flex-col justify-between shadow-xs border border-zinc-800 font-mono relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600/20" />
                      <div className="text-[7.5px] text-zinc-350">TELEDYNE MEMOIRS</div>
                      <div className="text-[10px] leading-tight font-bold text-white uppercase">DISTANT FORCE</div>
                      <div className="text-[7px] text-zinc-400">Henry Singleton</div>
                    </div>
                  </div>
                </div>
                <div className="text-[8.5px] text-zinc-400 font-mono mt-3 text-right">
                  * Readership augmented by 1st hand operational deep-dives.
                </div>
              </div>

              {/* Right Column: Key Allocators Bento Grid */}
              <div className="md:col-span-5 bg-blue-50/10 border border-zinc-200 p-4 rounded-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 block mb-3 uppercase">
                    👑 MASTER ARCHITECTS OF COMPREHENSION
                  </span>
                  
                  <div className="space-y-2">
                    <div className="p-2 border border-zinc-200/60 bg-white rounded-xs">
                      <span className="font-extrabold text-[#002855] text-xs font-mono block">Eiichi Shibusawa</span>
                      <span className="text-[9.5px] text-zinc-550 leading-relaxed block">Father of Japanese industrial capitalism. Blended Confucian ethics with dynamic joint-stock compounding.</span>
                    </div>

                    <div className="p-2 border border-zinc-200/60 bg-white rounded-xs">
                      <span className="font-extrabold text-[#002855] text-xs font-mono block">Charlie Munger &amp; W. Buffett</span>
                      <span className="text-[9.5px] text-zinc-550 leading-relaxed block">Pioneered float allocation, operational decentralization, and high ethical standards.</span>
                    </div>

                    <div className="p-2 border border-zinc-200/60 bg-white rounded-xs">
                      <span className="font-extrabold text-[#002855] text-xs font-mono block">Henry Singleton</span>
                      <span className="text-[9.5px] text-zinc-550 leading-relaxed block">Teledyne legendary conglomerate architect. Master of aggressive stock buybacks &amp; precision SME acquisition.</span>
                    </div>

                    <div className="p-2 border border-zinc-200/60 bg-white rounded-xs">
                      <span className="font-extrabold text-[#002855] text-xs font-mono block">Mark Leonard</span>
                      <span className="text-[9.5px] text-zinc-550 leading-relaxed block">Founded Constellation Software. Standardized the perpetual decentralized SME software acquisition model.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 27: // Slide 28: Raising Capital focus
        return (
          <div className="flex flex-col justify-center items-center h-full max-w-3.5xl mx-auto px-6 text-center space-y-6">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-[0.2em] font-extrabold leading-loose">CAPITAL CAMPAIGN PLACEMENT</span>
            <div className="h-0.5 w-16 bg-blue-600 rounded-full" />
            <p className="text-3xl sm:text-5xl font-extrabold text-[#002855] leading-tight tracking-tight">
              Threads Solo is raising <br />
              <span className="bg-blue-900 text-white px-5 py-2 rounded shadow-lg font-mono inline-block my-4">
                20 Million Euros
              </span> <br />
              <span className="text-2xl sm:text-3.5xl font-medium text-[#1E3A8A]">
                to incubate and invest in 5 serial acquirers (SAs)
              </span>
            </p>
          </div>
        );

      case 28: // Slide 29: Suggested readings
        return (
          <div className="flex flex-col justify-center h-full max-w-4.5xl mx-auto px-6 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2 text-center">
              Suggested Readings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(a)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">Capital Allocation Platforms</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Written by me)</p>
              </div>

              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(b)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">Acquisition-driven compounders</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Sourced by REQ Capital)</p>
              </div>

              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(c)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">The Succession Opportunity</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Written by me)</p>
              </div>

              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(d)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">Capital Allocation</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Written by me)</p>
              </div>

              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(e)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">The Compound Kings</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Sourced by PieLAB Capital)</p>
              </div>

              <div className="p-4 border border-zinc-200 rounded hover:bg-zinc-50/50 space-y-1">
                <span className="font-mono text-blue-800 text-[10px] font-bold">(f)</span>
                <p className="font-bold text-zinc-900 text-[#002855]">The Swedish legacy of decentralization</p>
                <p className="text-[11px] text-zinc-500 font-mono">(Sourced by REQ Capital)</p>
              </div>
            </div>
          </div>
        );

      case 29: // Slide 30: The 100 Year
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2">
              The 100 Year (T100Y)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-4 bg-zinc-900 text-white p-6 rounded shadow-lg text-center space-y-4">
                <span className="text-4xl block">⏳</span>
                <h4 className="text-xl font-bold font-mono tracking-widest text-amber-400">T100Y</h4>
                <p className="text-[11px] font-mono leading-relaxed text-zinc-400">
                  Compounding returns &amp; impact over centuries, hence, The 100 Year.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-4.5 text-xs sm:text-sm text-left leading-relaxed text-zinc-700 font-sans">
                <p>
                  I am a Pacific Asia and Nordic Optimist, interested in compounding returns &amp; impact over centuries, hence, <strong>The 100 Year</strong>. I am a cathedral thinker because people are rational in the long term, as there is no instant gratification, but they are irrational in the short term.
                </p>
                <p>
                  Whether it is impact or returns, we need to think long-term to achieve desirable outcomes.
                </p>
                <p className="font-semibold text-blue-900 text-base">
                  Are you a cathedral thinker, too?
                </p>
                <div className="pt-2 border-t border-dashed border-zinc-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-zinc-500 font-mono">LEARN MORE:</span>
                  <a href="https://the100year.substack.com/about" target="_blank" rel="noopener noreferrer" className="text-blue-650 hover:underline hover:text-blue-900 font-mono font-bold">
                    https://the100year.substack.com/about
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case 30: // Slide 31: Closing Slide
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-16 h-16 text-blue-900 opacity-80" viewBox="0 0 24 24">
              <svg className="w-full h-full text-zinc-900" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
                <path d="M20 20 L80 80 M80 20 L20 80" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#002855] font-mono tracking-tight">
              THREADS 糸
            </h1>
            <p className="text-sm sm:text-base text-[#1E3A8A] font-medium leading-relaxed max-w-md italic">
              Compound Impact for Eternity
            </p>
            <div className="pt-4 text-xs font-mono text-zinc-500">
              <p>s@firstfollowers.co</p>
            </div>
          </div>
        );

      case 31: // Slide 32: Seven Spirits of Investing Group (Illustrations representation)
        return (
          <div className="flex flex-col justify-center h-full max-w-5xl mx-auto px-4 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#002855] border-b border-zinc-200 pb-2 text-center">
              The Seven Spirits of Investing
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2 text-center">
              {[
                { icon: "🦈", title: "The Shark", detail: "Aggressive capital allocator" },
                { icon: "🐘", title: "The Elephant", detail: "Wise, long memory, large scale" },
                { icon: "🐢", title: "The Turtle", detail: "Slow & steady compounding longevity" },
                { icon: "🐻", title: "The Bear", detail: "Opportunistic value buffer" },
                { icon: "🐷", title: "The Piggy", detail: "Reinvestment & float compounding" },
                { icon: "🐙", title: "The Octopus", detail: "Diverse serial operations executor" },
                { icon: "🏛️", title: "The Cathedral", detail: "Centuries-long architectural thinker" }
              ].map((item, i) => (
                <div key={i} className="bg-zinc-50 border border-zinc-200 p-3 rounded-sm space-y-2 flex flex-col justify-between hover:border-blue-500 transition-colors">
                  <span className="text-3xl block">{item.icon}</span>
                  <div>
                    <h4 className="font-bold text-[#002855] text-xs leading-tight">{item.title}</h4>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-1 font-sans">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 32: // Slide 33: Closed Disclaimer/Credits
        return (
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto px-6 font-sans">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002855] text-center mb-8 tracking-tight">
              Disclaimer (Continued)
            </h2>
            <div className="space-y-5 text-[#1E3A8A] text-xs sm:text-sm leading-relaxed text-center font-medium">
              <p>
                This document is for general information only. It is not an offer to buy or sell any security, nor is it investment advice. The entity described is a privately held holding company (not currently in operation or even registered), not a fund or collective investment scheme.
              </p>
              <p>
                All information is provided &ldquo;as-is&rdquo; without warranty of accuracy or completeness. Each recipient must perform independent due diligence and consult professional advisers before acting.
              </p>
              <p>
                The document is confidential and may not be reproduced or distributed without prior written consent. It is not intended for distribution to, or use by, any person in any jurisdiction where such distribution or use would be contrary to law or regulation.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="slideshow-panel">
      <style>{`
        .slideshow-aspect-ratio {
          aspect-ratio: 16 / 9;
        }
        @media (max-width: 768px) {
          .slideshow-aspect-ratio {
            aspect-ratio: auto;
            min-height: 400px;
          }
        }
        /* Minimalist Neutral Overrides for a clean grey/charcoal look */
        .text-\[\#002855\] {
          color: #18181b !important;
        }
        .text-\[\#1E3A8A\] {
          color: #52525b !important;
        }
        .bg-\[\#002855\] {
          background-color: #18181b !important;
        }
        .bg-\[\#1E3A8A\] {
          background-color: #52525b !important;
        }
        .border-\[\#002855\] {
          border-color: #e4e4e7 !important;
        }
        .text-blue-900 {
          color: #18181b !important;
        }
        .text-blue-800 {
          color: #3f3f46 !important;
        }
        .text-blue-700 {
          color: #3f3f46 !important;
        }
        .text-blue-650 {
          color: #3f3f46 !important;
        }
        .text-blue-750 {
          color: #18181b !important;
        }
        .bg-blue-900 {
          background-color: #18181b !important;
        }
        .bg-blue-50 {
          background-color: #f4f4f5 !important;
        }
        .bg-blue-50\/20, .bg-blue-50\/30, .bg-blue-50\/10, .bg-blue-50\/50 {
          background-color: rgba(244, 244, 245, 0.4) !important;
        }
        .bg-\[\#001C55\]\/5, .bg-\[\#001c55\]\/5, .bg-\[\#001D55\] {
          background-color: #1c1917 !important; /* warm dark stone-900 */
        }
        .border-blue-100, .border-blue-150, .border-blue-200, .border-blue-250, .border-blue-900 {
          border-color: #e4e4e7 !important;
        }
        .decoration-blue-500 {
          text-decoration-color: #71717a !important;
        }
      `}</style>

      {/* Slide Navigation panel / Fullscreen wrapping frame */}
      <div 
        ref={containerRef}
        className={`w-full bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-md transition-all flex flex-col justify-between ${
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none p-6 bg-white" : "p-4 sm:p-6"
        }`}
        id="pitch-slides-container"
      >
        
        {/* Top bar of presentation panel */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 select-none">
          <div className="flex items-center space-x-3">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block animate-pulse" />
            <h3 className="font-mono font-bold text-[10px] sm:text-[11px] tracking-widest text-[#18181B] uppercase">
              Threads Solo ({currentSlide + 1} / 33)
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowThumbs(prev => !prev)}
              className={`p-1.5 rounded bg-zinc-50 border border-zinc-250 hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer flex items-center gap-1 text-[10px] font-mono ${showThumbs ? "ring-1 ring-zinc-405" : ""}`}
              title="Toggle Thumbnails Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OVERVIEW</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded bg-zinc-50 border border-zinc-250 hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer flex items-center gap-1 text-[10px] font-mono"
              title="Fullscreen Mode (ESC to close)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "EXIT" : "FULLSCREEN"}</span>
            </button>
          </div>
        </div>

        {/* THUMBNAILS GRID (TOGGLEABLE) */}
        {showThumbs && (
          <div className="bg-zinc-50 border border-zinc-200 p-3 mb-4 rounded max-h-[160px] overflow-y-auto select-none">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5 text-center">
              {Array.from({ length: 33 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSlide(i);
                    setShowThumbs(false);
                  }}
                  className={`py-2 text-[10px] font-mono font-bold border transition-colors rounded cursor-pointer ${
                    currentSlide === i 
                      ? "bg-zinc-900 border-zinc-950 text-white" 
                      : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-650"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN PRESENTATION SCREEN */}
        <div className="relative flex-1 flex flex-col justify-between py-6 min-h-[380px] sm:min-h-[460px] bg-[#FAFAFA]/50 border border-zinc-100 rounded">
          
          {/* Slides background element */}
          <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 select-none text-[10px] text-zinc-400 font-mono">
            <div className="flex gap-4">
              <span className="border border-zinc-200 px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-widest text-[#002855]">
                Confidential
              </span>
              <span className="border border-zinc-200 px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-widest">
                Copyright &copy;
              </span>
            </div>
            <span>THREADS 糸</span>
          </div>

          <div className="absolute top-4 left-6 select-none text-zinc-450 border-b-2 border-zinc-300 pb-0.5 font-mono text-xs font-bold font-mono">
            {currentSlide + 1}
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              {renderSlideContent(currentSlide)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation bottom toolbar */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 mt-4 select-none">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-zinc-900 text-white disabled:bg-zinc-100 disabled:text-zinc-400 border border-zinc-950 rounded-sm text-xs font-mono font-bold hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> PREV
          </button>

          <div className="text-center font-mono text-xs font-bold text-zinc-650">
            Slide {currentSlide + 1} of 33
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, 32))}
            disabled={currentSlide === 32}
            className="px-4 py-2 bg-zinc-900 text-white disabled:bg-zinc-100 disabled:text-zinc-400 border border-zinc-950 rounded-sm text-xs font-mono font-bold hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Helpful presentation controls explanation card */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-normal font-sans">
          <strong>Tip for Navigation:</strong> You can also use the <strong>Left &amp; Right Arrow Keys</strong> on your keyboard to slide back and forth through slides. Use the <strong>OVERVIEW</strong> button to quickly see the directory index list and jump to a specific slide (from Slide 1 up to Slide 33).
        </div>
      </div>
    </div>
  );
};
