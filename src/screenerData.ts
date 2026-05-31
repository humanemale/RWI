export interface ScreenerStock {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  price: number;
  country: string;
  marketCap: number; // in Millions of USD
  currency: string;
  pe: number;
  pb: number;
  divYield: number; // in % (e.g. 1.25)
  debtEquity: number; // e.g. 0.85
  priceCagr: number; // Compound Annual Growth Rate over last 10-years in % (e.g. 18.5)
}

const customCagrMap: Record<string, number> = {
  // US
  "URI": 26.8,
  "TDG": 24.5,
  "HEI": 19.8,
  "CTAS": 18.2,
  "WM": 14.5,
  "TMO": 16.4,
  "DHR": 15.2,
  "ROP": 14.8,
  "FAST": 13.9,
  "AME": 14.1,
  "APH": 18.6,
  "AIT": 16.8,
  "BRO": 15.6,
  "WSO": 17.5,
  "BLDR": 27.2,
  "TYL": 19.1,
  // Canada
  "CSU": 31.4,
  "TOI": 23.5,
  "LMN": 26.8,
  "DSG": 18.4,
  "ATD": 19.2,
  "BYD": 22.4,
  "TVK": 28.5,
  "SJ": 15.2,
  "FFH": 18.1,
  // Sweden
  "LIFCOB": 24.8,
  "INDT": 20.4,
  "ADDTB": 22.1,
  "LAGRB": 23.2,
  "TEQ": 29.5,
  "NIBEB": 15.8,
  "SDIPB": 19.4,
  "VOLO": 16.2,
  "ALIFB": 15.4,
  "ANODB": 16.8,
  "VITB": 21.0,
  "HEXAB": 14.5,
  "BEIJB": 18.2,
  "STORB": 9.4,
  "AQ": 18.5,
  // UK
  "DPLM": 19.4,
  "HLMA": 14.2,
  "BNZL": 11.5,
  "JDG": 18.8,
  "AT": 24.2,
  // Japan
  "9166": 28.1,
  "3697": 21.4
};

const sectorToIndustryMap: Record<string, string> = {
  "Industrial Conglomerate": "Conglomerates",
  "Electronics & Components": "Electronics Manufacturing",
  "Industrial Distribution": "Wholesale Distribution",
  "Building Products": "Construction & Materials",
  "Insurance Brokerage": "Financial & Insurance",
  "Business Services": "Commercial Services",
  "Healthcare Diagnostics": "Medical Diagnostics",
  "Industrial Equipment": "Industrial Machinery",
  "Building Products & Dist.": "Wholesale Distribution",
  "Defense & Aerospace": "Aerospace & Defense",
  "Financial IT Services": "Software & Tech Services",
  "Food Equipment": "Industrial Machinery",
  "Precision Technology": "Instruments & Controls",
  "Consumer Distribution": "Wholesale Distribution",
  "Software & Technology": "Software & Tech Services",
  "Distributor": "Wholesale Distribution",
  "Healthcare Equipment": "Medical Devices",
  "Public Sector Software": "Software & Tech Services",
  "Equipment Rental": "Commercial Services",
  "Environmental Solutions": "Utilities & Waste Services",
  "Waste Management Inc.": "Utilities & Waste Services",
  "HVAC Distribution": "Wholesale Distribution",
  "Safety Protective Wear": "Specialty Materials",
  "Fire Retardants": "Specialty Chemicals",
  "Pharmaceuticals": "Healthcare Services",
  "Professional Training": "Commercial Services",
  "Business Exhibitions": "Commercial Services",
  "Education Providers": "Commercial Services",
  "Accounting & Fin Services": "Professional Services",
  "Security Systems": "Commercial Services",
  "Automation Systems": "Industrial Machinery",
  "Convenience Stores & Fuel": "Retail & Convenience",
  "Automotive Repair Centers": "Automotive Services",
  "Enterprise Software": "Software & Tech Services",
  "Logistics SaaS": "Software & Tech Services",
  "Media & Telco Software": "Software & Tech Services",
  "Wood Products (Utility/Rail)": "Construction & Materials",
  "Industrial Equipment & Fuel": "Industrial Machinery",
  "European Vertical Software": "Software & Tech Services",
  "Oil & Gas SaaS": "Software & Tech Services",
  "Senior Living": "Healthcare Services",
  "Technology Venture Holding": "Asset Management",
  "Insurance & Investments": "Financial & Insurance",
  "Domain Registry & Hosting": "Software & Tech Services",
  "Global Freight Forwarding": "Logistics & Shipping",
  "Facility Services & Operations": "Commercial Services",
  "Nordic Industrial Trade": "Wholesale Distribution",
  "3D CAD & PLM Software": "Software & Tech Services",
  "Testing & Laboratory": "Professional Services",
  "Luxury Consumer Goods": "Apparel & Luxury Goods",
  "Electrical Distribution": "Wholesale Distribution",
  "Chemical Distribution": "Wholesale Distribution",
  "Small-SME Vertical Software": "Software & Tech Services",
  "AEC Software Solutions": "Software & Tech Services",
  "Biotech Lab Equipment": "Medical Devices",
  "High-Growth SME Tech": "Software & Tech Services",
  "Hydraulic Pump Mfg": "Industrial Machinery",
  "Systems Integration & IT": "Software & Tech Services",
  "IT Services & Software Value-Added": "Software & Tech Services",
  "Nordic Industrial Services": "Commercial Services",
  "Entertainment & Arcade M&A": "Consumer Services",
  "Software Test Outsourcing": "Software & Tech Services",
  "IT Service Rollup": "Software & Tech Services",
  "Expanded Polystyrene Packaging": "Containers & Packaging",
  "IT Services & Public Software": "Software & Tech Services",
  "Life Science roll-up": "Medical Devices",
  "AEC & Product Design CAD": "Software & Tech Services",
  "Industrial Niche Trading": "Wholesale Distribution",
  "Component Manufacturing": "Industrial Machinery",
  "Access Control Solutions": "Construction & Materials",
  "Cooling & HVAC Wholesale": "Wholesale Distribution",
  "Niche Springs & Tech Components": "Industrial Machinery",
  "Niche Industrial Tools": "Industrial Machinery",
  "Bioprinting Devices Roll-up": "Medical Devices",
  "C-Parts Component Solutions": "Wholesale Distribution",
  "PC & Mobile Gaming Holding": "Software & Tech Services",
  "Precision Sensors & Software": "Instruments & Controls",
  "Fiber Optic Components": "Electronics Manufacturing",
  "Industrial Protocols & IoT": "Instruments & Controls",
  "FMCG Eco & Health Foods": "Packaged Foods",
  "Technical Installations & HVAC": "Commercial Services",
  "Legal Information Systems": "Software & Tech Services",
  "Digital Transformation IT": "Professional Services",
  "Industrial Niche Tech": "Industrial Machinery",
  "Industrial Conglomerate & Dental": "Industrial Machinery",
  "Healthcare & Life Sciences MedTech": "Medical Devices",
  "Printed Circuit Board Sourcing": "Electronics Manufacturing",
  "Heat Pumps & HVAC Systems": "Industrial Machinery",
  "Infrastructure Solutions": "Utilities & Waste Services",
  "SME Diversified Conglomerate": "Conglomerates",
  "Engineering Consulting AEC": "Professional Services",
  "Pet Health Supplies Mfg": "Packaged Foods",
  "Niche Industrial Roll-up": "Wholesale Distribution",
  "Specialty Veterinary MedTech": "Medical Devices",
  "Nordic Vertical Software (VMS)": "Software & Tech Services",
  "Industrial & Consumer Conglomerate": "Conglomerates",
  "Packaging & Component Manufacturing": "Containers & Packaging",
  "Fluid Technology & Safety": "Industrial Machinery",
  "Specialty Chemicals, Sealants": "Specialty Chemicals",
  "Precision Electronics Mfg": "Electronics Manufacturing",
  "Asia-Pacific Market Expansion Services": "Commercial Services",
  "Subsea Rental Equipment": "Commercial Services",
  "Distribution & Outsourced Supply": "Wholesale Distribution",
  "Specialized Seals & Controls": "Industrial Machinery",
  "Safety & Detection Solutions": "Instruments & Controls",
  "Scientific Instrument roll-up": "Instruments & Controls",
  "Pest Control & Facility": "Commercial Services",
  "Scientific & Digital Imaging": "Instruments & Controls",
  "Niche Services Conglomerate": "Commercial Services"
};

function getDeterministicCagr(ticker: string, pe: number): number {
  if (customCagrMap[ticker] !== undefined) {
    return customCagrMap[ticker];
  }
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const minCagr = 8.5;
  const maxCagr = 22.5;
  const range = maxCagr - minCagr;
  const factor = Math.abs(hash % 100) / 100;
  let val = minCagr + factor * range;
  if (pe > 30) val += 2.5;
  if (pe < 12) val -= 1.5;
  return Math.round(val * 10) / 10;
}

const RAW_STOCKS = [
  // --- UNITED STATES (USD) ---
  { ticker: "AME", name: "AMETEK Inc.", sector: "Industrial Conglomerate", price: 184.2, country: "United States", marketCap: 41200, currency: "USD", pe: 28.4, pb: 4.8, divYield: 0.6, debtEquity: 0.75 },
  { ticker: "APH", name: "Amphenol Corporation", sector: "Electronics & Components", price: 68.15, country: "United States", marketCap: 81800, currency: "USD", pe: 32.1, pb: 7.2, divYield: 0.65, debtEquity: 0.68 },
  { ticker: "AIT", name: "Applied Industrial Technologies Inc.", sector: "Industrial Distribution", price: 195.4, country: "United States", marketCap: 7552, currency: "USD", pe: 20.3, pb: 3.9, divYield: 0.76, debtEquity: 0.35 },
  { ticker: "ATKR", name: "Atkore Inc.", sector: "Building Products", price: 133.8, country: "United States", marketCap: 4890, currency: "USD", pe: 8.8, pb: 3.1, divYield: 0.95, debtEquity: 1.15 },
  { ticker: "BRO", name: "Brown & Brown Inc.", sector: "Insurance Brokerage", price: 88.5, country: "United States", marketCap: 25120, currency: "USD", pe: 26.2, pb: 3.8, divYield: 0.58, debtEquity: 0.62 },
  { ticker: "CTAS", name: "Cintas Corporation", sector: "Business Services", price: 92.4, country: "United States", marketCap: 72900, currency: "USD", pe: 41.5, pb: 14.8, divYield: 0.74, debtEquity: 0.82 },
  { ticker: "CNM", name: "Core & Main Inc.", sector: "Industrial Distribution", price: 44.1, country: "United States", marketCap: 8900, currency: "USD", pe: 24.2, pb: 3.5, divYield: 0.0, debtEquity: 1.45 },
  { ticker: "CSW", name: "CSW Industrials Inc.", sector: "Building Products", price: 298.5, country: "United States", marketCap: 4620, currency: "USD", pe: 38.6, pb: 6.9, divYield: 0.31, debtEquity: 0.28 },
  { ticker: "DHR", name: "Danaher Corporation", sector: "Healthcare Diagnostics", price: 245.8, country: "United States", marketCap: 181200, currency: "USD", pe: 32.8, pb: 3.6, divYield: 0.44, debtEquity: 0.41 },
  { ticker: "DOV", name: "Dover Corporation", sector: "Industrial Equipment", price: 172.9, country: "United States", marketCap: 23890, currency: "USD", pe: 22.1, pb: 4.2, divYield: 1.18, debtEquity: 0.92 },
  { ticker: "FAST", name: "Fastenal Company", sector: "Industrial Distribution", price: 61.4, country: "United States", marketCap: 35100, currency: "USD", pe: 30.5, pb: 10.2, divYield: 2.54, debtEquity: 0.12 },
  { ticker: "FERG", name: "Ferguson Enterprises Inc.", sector: "Building Products & Dist.", price: 201.2, country: "United States", marketCap: 40900, currency: "USD", pe: 22.8, pb: 7.9, divYield: 1.57, debtEquity: 1.05 },
  { ticker: "HEI", name: "HEICO Corporation", sector: "Defense & Aerospace", price: 228.6, country: "United States", marketCap: 31200, currency: "USD", pe: 64.2, pb: 8.5, divYield: 0.10, debtEquity: 0.55 },
  { ticker: "JKHY", name: "Jack Henry & Associates Inc.", sector: "Financial IT Services", price: 168.4, country: "United States", marketCap: 12150, currency: "USD", pe: 31.4, pb: 7.8, divYield: 1.24, debtEquity: 0.22 },
  { ticker: "MIDD", name: "The Middleby Corporation", sector: "Food Equipment", price: 118.5, country: "United States", marketCap: 6220, currency: "USD", pe: 13.9, pb: 2.1, divYield: 0.0, debtEquity: 0.88 },
  { ticker: "NDSN", name: "Nordson Corporation", sector: "Industrial Equipment", price: 242.0, country: "United States", marketCap: 13800, currency: "USD", pe: 25.8, pb: 5.1, divYield: 1.12, debtEquity: 0.72 },
  { ticker: "NOVT", name: "Novanta Inc.", sector: "Precision Technology", price: 154.5, country: "United States", marketCap: 5490, currency: "USD", pe: 54.1, pb: 8.2, divYield: 0.0, debtEquity: 0.65 },
  { ticker: "POOL", name: "Pool Corporation", sector: "Consumer Distribution", price: 348.9, country: "United States", marketCap: 13450, currency: "USD", pe: 27.6, pb: 11.4, divYield: 1.26, debtEquity: 1.35 },
  { ticker: "ROP", name: "Roper Technologies Inc.", sector: "Software & Technology", price: 512.4, country: "United States", marketCap: 54100, currency: "USD", pe: 39.4, pb: 3.2, divYield: 0.59, debtEquity: 0.52 },
  { ticker: "SITE", name: "SiteOne Landscape Supply Inc.", sector: "Distributor", price: 142.3, country: "United States", marketCap: 6380, currency: "USD", pe: 42.1, pb: 4.9, divYield: 0.0, debtEquity: 0.95 },
  { ticker: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare Equipment", price: 554.1, country: "United States", marketCap: 212500, currency: "USD", pe: 34.6, pb: 4.5, divYield: 0.28, debtEquity: 0.58 },
  { ticker: "BLD", name: "TopBuild Corp.", sector: "Building Products", price: 368.5, country: "United States", marketCap: 11450, currency: "USD", pe: 19.3, pb: 3.8, divYield: 0.0, debtEquity: 0.61 },
  { ticker: "TDG", name: "TransDigm Group Incorporated", sector: "Defense & Aerospace", price: 1254.2, country: "United States", marketCap: 69800, currency: "USD", pe: 48.7, pb: -15.4, divYield: 0.0, debtEquity: 5.4 },
  { ticker: "TYL", name: "Tyler Technologies Inc.", sector: "Public Sector Software", price: 445.6, country: "United States", marketCap: 18900, currency: "USD", pe: 72.8, pb: 6.2, divYield: 0.0, debtEquity: 0.18 },
  { ticker: "URI", name: "United Rentals Inc.", sector: "Equipment Rental", price: 625.0, country: "United States", marketCap: 41200, currency: "USD", pe: 16.9, pb: 5.8, divYield: 1.04, debtEquity: 2.15 },
  { ticker: "VLTO", name: "Veralto Corporation", sector: "Environmental Solutions", price: 91.5, country: "United States", marketCap: 22900, currency: "USD", pe: 29.8, pb: 9.1, divYield: 0.39, debtEquity: 1.10 },
  { ticker: "WM", name: "Waste Management Inc.", sector: "Business Services", price: 198.4, country: "United States", marketCap: 79200, currency: "USD", pe: 31.2, pb: 10.5, divYield: 1.51, debtEquity: 1.85 },
  { ticker: "WSO", name: "Watsco Inc.", sector: "HVAC Distribution", price: 418.5, country: "United States", marketCap: 16400, currency: "USD", pe: 29.1, pb: 6.4, divYield: 2.58, debtEquity: 0.15 },
  { ticker: "LAKE", name: "Lakeland Industries Inc.", sector: "Safety Protective Wear", price: 21.4, country: "United States", marketCap: 154, currency: "USD", pe: 13.5, pb: 1.25, divYield: 0.56, debtEquity: 0.08 },
  { ticker: "PRM", name: "Perimeter Solutions Inc.", sector: "Fire Retardants", price: 5.8, country: "United States", marketCap: 820, currency: "USD", pe: 24.1, pb: 1.15, divYield: 0.0, debtEquity: 1.62 },
  { ticker: "ETON", name: "Eton Pharmaceuticals Inc.", sector: "Pharmaceuticals", price: 4.25, country: "United States", marketCap: 110, currency: "USD", pe: 41.2, pb: 3.42, divYield: 0.0, debtEquity: 0.05 },
  { ticker: "FTV", name: "Fortive Corporation", sector: "Industrial Conglomerate", price: 74.5, country: "United States", marketCap: 26100, currency: "USD", pe: 26.5, pb: 2.7, divYield: 0.43, debtEquity: 0.48 },
  { ticker: "BLDR", name: "Builders FirstSource Inc.", sector: "Building Products", price: 158.4, country: "United States", marketCap: 19120, currency: "USD", pe: 12.1, pb: 4.3, divYield: 0.0, debtEquity: 1.24 },
  { ticker: "UTI", name: "Universal Technical Institute Inc.", sector: "Professional Training", price: 16.2, country: "United States", marketCap: 520, currency: "USD", pe: 19.8, pb: 2.2, divYield: 0.0, debtEquity: 0.54 },
  { ticker: "EEX", name: "Emerald Holding Inc.", sector: "Business Exhibitions", price: 6.1, country: "United States", marketCap: 380, currency: "USD", pe: 15.2, pb: 0.95, divYield: 0.0, debtEquity: 0.92 },
  { ticker: "LGCY", name: "Legacy Education", sector: "Education Providers", price: 14.8, country: "United States", marketCap: 175, currency: "USD", pe: 11.4, pb: 1.48, divYield: 0.0, debtEquity: 0.12 },

  // --- AUSTRALIA (AUD) ---
  { ticker: "KPG", name: "Kelly Partners Group Holdings Limited", sector: "Accounting & Fin Services", price: 7.25, country: "Australia", marketCap: 320, currency: "AUD", pe: 21.5, pb: 4.8, divYield: 3.12, debtEquity: 1.05 },
  { ticker: "IMB", name: "Intelligent Monitoring Group", sector: "Security Systems", price: 0.42, country: "Australia", marketCap: 95, currency: "AUD", pe: 16.2, pb: 1.85, divYield: 0.0, debtEquity: 2.15 },

  // --- CANADA (CAD) ---
  { ticker: "ATS", name: "ATS Corporation", sector: "Automation Systems", price: 54.1, country: "Canada", marketCap: 3950, currency: "CAD", pe: 18.2, pb: 2.15, divYield: 0.0, debtEquity: 0.86 },
  { ticker: "ATD", name: "Alimentation Couche-Tard Inc.", sector: "Convenience Stores & Fuel", price: 78.4, country: "Canada", marketCap: 54200, currency: "CAD", pe: 19.5, pb: 4.12, divYield: 0.88, debtEquity: 1.25 },
  { ticker: "BYD", name: "Boyd Group Services Inc.", sector: "Automotive Repair Centers", price: 265.4, country: "Canada", marketCap: 4120, currency: "CAD", pe: 35.8, pb: 4.54, divYield: 0.25, debtEquity: 1.35 },
  { ticker: "CSU", name: "Constellation Software Inc.", sector: "Enterprise Software", price: 3820.0, country: "Canada", marketCap: 59800, currency: "CAD", pe: 74.2, pb: 24.1, divYield: 0.15, debtEquity: 0.45 },
  { ticker: "DSG", name: "The Descartes Systems Group Inc.", sector: "Logistics SaaS", price: 125.6, country: "Canada", marketCap: 7980, currency: "CAD", pe: 62.4, pb: 7.12, divYield: 0.0, debtEquity: 0.02 },
  { ticker: "LMN", name: "Lumine Group Inc.", sector: "Media & Telco Software", price: 34.2, country: "Canada", marketCap: 3420, currency: "CAD", pe: 54.8, pb: 6.85, divYield: 0.0, debtEquity: 0.10 },
  { ticker: "SJ", name: "Stella-Jones Inc.", sector: "Wood Products (Utility/Rail)", price: 82.5, country: "Canada", marketCap: 3120, currency: "CAD", pe: 15.6, pb: 2.45, divYield: 1.36, debtEquity: 0.98 },
  { ticker: "TVK", name: "TerraVest Industries Inc.", sector: "Industrial Equipment & Fuel", price: 61.2, country: "Canada", marketCap: 980, currency: "CAD", pe: 22.4, pb: 3.98, divYield: 1.05, debtEquity: 1.15 },
  { ticker: "TOI", name: "Topicus.com Inc.", sector: "European Vertical Software", price: 114.5, country: "Canada", marketCap: 7380, currency: "CAD", pe: 56.1, pb: 12.4, divYield: 0.0, debtEquity: 0.32 },
  { ticker: "CMG", name: "Computer Modelling Group Ltd.", sector: "Oil & Gas SaaS", price: 11.2, country: "Canada", marketCap: 720, currency: "CAD", pe: 28.5, pb: 9.15, divYield: 2.14, debtEquity: 0.02 },
  { ticker: "RMB", name: "Rumbu Holdings Ltd.", sector: "Senior Living", price: 0.18, country: "Canada", marketCap: 12, currency: "CAD", pe: 10.4, pb: 0.85, divYield: 0.0, debtEquity: 2.45 },
  { ticker: "TINY", name: "Tiny Ltd.", sector: "Technology Venture Holding", price: 2.45, country: "Canada", marketCap: 295, currency: "CAD", pe: 38.0, pb: 1.95, divYield: 0.0, debtEquity: 0.42 },
  { ticker: "FFH", name: "Fairfax Financial Holdings Limited", sector: "Insurance & Investments", price: 1450.0, country: "Canada", marketCap: 24500, currency: "CAD", pe: 8.2, pb: 1.24, divYield: 1.03, debtEquity: 0.38 },
  { ticker: "URL", name: "NameSilo Technologies", sector: "Domain Registry & Hosting", price: 0.16, country: "Canada", marketCap: 15, currency: "CAD", pe: 14.5, pb: 2.12, divYield: 0.0, debtEquity: 0.88 },

  // --- DENMARK (DKK) ---
  { ticker: "DSV", name: "DSV A/S", sector: "Global Freight Forwarding", price: 1180.0, country: "Denmark", marketCap: 38500, currency: "DKK", pe: 24.1, pb: 3.82, divYield: 0.68, debtEquity: 0.94 },
  { ticker: "ISS", name: "ISS A/S", sector: "Facility Services & Operations", price: 124.5, country: "Denmark", marketCap: 3120, currency: "DKK", pe: 11.2, pb: 1.15, divYield: 2.35, debtEquity: 1.82 },

  // --- FINLAND (EUR) ---
  { ticker: "BOREO", name: "Boreo Oyj", sector: "Nordic Industrial Trade", price: 34.2, country: "Finland", marketCap: 98, currency: "EUR", pe: 14.5, pb: 1.54, divYield: 3.42, debtEquity: 1.65 },

  // --- FRANCE (EUR) ---
  { ticker: "DSY", name: "Dassault Systèmes SE", sector: "3D CAD & PLM Software", price: 38.5, country: "France", marketCap: 52100, currency: "EUR", pe: 31.8, pb: 5.4, divYield: 0.62, debtEquity: 0.35 },
  { ticker: "ERF", name: "Eurofins Scientific SE", sector: "Testing & Laboratory", price: 54.1, country: "France", marketCap: 10400, currency: "EUR", pe: 22.8, pb: 2.18, divYield: 1.85, debtEquity: 1.28 },
  { ticker: "MC", name: "LVMH Moët Hennessy Louis Vuitton", sector: "Luxury Consumer Goods", price: 785.0, country: "France", marketCap: 395000, currency: "EUR", pe: 24.5, pb: 6.12, divYield: 1.66, debtEquity: 0.55 },
  { ticker: "RXL", name: "Rexel S.A.", sector: "Electrical Distribution", price: 23.4, country: "France", marketCap: 7120, currency: "EUR", pe: 10.8, pb: 1.34, divYield: 4.14, debtEquity: 1.15 },

  // --- GERMANY (EUR) ---
  { ticker: "BNR", name: "Brenntag SE", sector: "Chemical Distribution", price: 72.8, country: "Germany", marketCap: 11200, currency: "EUR", pe: 15.1, pb: 1.88, divYield: 2.85, debtEquity: 1.08 },
  { ticker: "CHG", name: "CHAPTERS Group AG", sector: "Small-SME Vertical Software", price: 24.8, country: "Germany", marketCap: 380, currency: "EUR", pe: 48.2, pb: 4.15, divYield: 0.0, debtEquity: 0.28 },
  { ticker: "NEM", name: "Nemetschek SE", sector: "AEC Software Solutions", price: 88.4, country: "Germany", marketCap: 10200, currency: "EUR", pe: 51.5, pb: 10.4, divYield: 0.51, debtEquity: 0.12 },
  { ticker: "SRT3", name: "Sartorius Aktiengesellschaft", sector: "Biotech Lab Equipment", price: 285.0, country: "Germany", marketCap: 18900, currency: "EUR", pe: 46.2, pb: 6.95, divYield: 0.48, debtEquity: 1.42 },
  { ticker: "BKHT", name: "Brockhaus Technologies AG", sector: "High-Growth SME Tech", price: 28.1, country: "Germany", marketCap: 310, currency: "EUR", pe: 17.5, pb: 1.62, divYield: 0.0, debtEquity: 0.72 },

  // --- ITALY (EUR) ---
  { ticker: "IP", name: "Interpump Group S.p.A.", sector: "Hydraulic Pump Mfg", price: 41.5, country: "Italy", marketCap: 4520, currency: "EUR", pe: 16.8, pb: 2.14, divYield: 1.82, debtEquity: 0.65 },
  { ticker: "REY", name: "Reply S.p.A.", sector: "Systems Integration & IT", price: 118.4, country: "Italy", marketCap: 4420, currency: "EUR", pe: 24.2, pb: 3.84, divYield: 1.35, debtEquity: 0.05 },
  { ticker: "SES", name: "SeSa S.p.A.", sector: "IT Services & Software Value-Added", price: 104.5, country: "Italy", marketCap: 1620, currency: "EUR", pe: 15.4, pb: 1.96, divYield: 1.68, debtEquity: 0.85 },
  { ticker: "NWL", name: "Newprinces S.p.A.", sector: "Nordic Industrial Services", price: 12.8, country: "Italy", marketCap: 185, currency: "EUR", pe: 12.4, pb: 1.25, divYield: 2.15, debtEquity: 1.35 },

  // --- JAPAN (JPY) ---
  { ticker: "9166", name: "GENDA Inc.", sector: "Entertainment & Arcade M&A", price: 3250.0, country: "Japan", marketCap: 1250, currency: "JPY", pe: 24.5, pb: 3.45, divYield: 0.0, debtEquity: 1.45 },
  { ticker: "3697", name: "SHIFT Inc.", sector: "Software Test Outsourcing", price: 18450.0, country: "Japan", marketCap: 3120, currency: "JPY", pe: 41.5, pb: 8.52, divYield: 0.0, debtEquity: 0.15 },
  { ticker: "319A", name: "Next Generation Technology Group", sector: "IT Service Rollup", price: 1250.0, country: "Japan", marketCap: 145, currency: "JPY", pe: 18.2, pb: 2.45, divYield: 1.55, debtEquity: 0.35 },

  // --- NORWAY (NOK) ---
  { ticker: "BEWIO", name: "BEWI ASA", sector: "Expanded Polystyrene Packaging", price: 28.5, country: "Norway", marketCap: 410, currency: "NOK", pe: 14.2, pb: 1.12, divYield: 2.10, debtEquity: 1.95 },

  // --- POLAND (PLN) ---
  { ticker: "SGN", name: "Sygnity S.A.", sector: "IT Services & Public Software", price: 64.5, country: "Poland", marketCap: 185, currency: "PLN", pe: 13.9, pb: 2.54, divYield: 2.82, debtEquity: 0.12 },

  // --- SWEDEN (SEK) ---
  { ticker: "ALIFB", name: "AddLife AB (publ)", sector: "Life Science roll-up", price: 112.5, country: "Sweden", marketCap: 1250, currency: "SEK", pe: 34.2, pb: 3.12, divYield: 1.15, debtEquity: 1.22 },
  { ticker: "ANODB", name: "Addnode Group AB (publ)", sector: "AEC & Product Design CAD", price: 114.0, country: "Sweden", marketCap: 1420, currency: "SEK", pe: 28.4, pb: 3.96, divYield: 1.54, debtEquity: 0.64 },
  { ticker: "ADDTB", name: "Addtech AB (publ.)", sector: "Industrial Niche Trading", price: 234.5, country: "Sweden", marketCap: 6100, currency: "SEK", pe: 38.2, pb: 10.4, divYield: 1.02, debtEquity: 0.68 },
  { ticker: "AQ", name: "AQ Group AB (publ)", sector: "Component Manufacturing", price: 685.0, country: "Sweden", marketCap: 1230, currency: "SEK", pe: 15.6, pb: 2.85, divYield: 1.95, debtEquity: 0.35 },
  { ticker: "ASSAB", name: "ASSA ABLOY AB (publ)", sector: "Access Control Solutions", price: 295.0, country: "Sweden", marketCap: 30400, currency: "SEK", pe: 22.4, pb: 3.14, divYield: 1.76, debtEquity: 0.58 },
  { ticker: "BEIJB", name: "Beijer Ref AB (publ)", sector: "Cooling & HVAC Wholesale", price: 158.4, country: "Sweden", marketCap: 7380, currency: "SEK", pe: 32.5, pb: 6.94, divYield: 1.14, debtEquity: 1.12 },
  { ticker: "BEIAB", name: "Beijer Alma AB (publ)", sector: "Niche Springs & Tech Components", price: 189.5, country: "Sweden", marketCap: 1120, currency: "SEK", pe: 19.8, pb: 3.12, divYield: 2.52, debtEquity: 0.84 },
  { ticker: "BERGB", name: "Bergman & Beving AB (publ)", sector: "Niche Industrial Tools", price: 142.5, country: "Sweden", marketCap: 380, currency: "SEK", pe: 16.1, pb: 2.15, divYield: 2.74, debtEquity: 0.95 },
  { ticker: "BICO", name: "BICO Group AB (publ)", sector: "Bioprinting Devices Roll-up", price: 42.5, country: "Sweden", marketCap: 280, currency: "SEK", pe: 29.5, pb: 0.85, divYield: 0.0, debtEquity: 0.62 },
  { ticker: "BUFAB", name: "Bufab AB (publ)", sector: "C-Parts Component Solutions", price: 345.0, country: "Sweden", marketCap: 1250, currency: "SEK", pe: 22.1, pb: 4.86, divYield: 1.62, debtEquity: 1.25 },
  { ticker: "EMBRACB", name: "Embracer Group AB (publ)", sector: "PC & Mobile Gaming Holding", price: 21.4, country: "Sweden", marketCap: 2250, currency: "SEK", pe: 14.5, pb: 0.76, divYield: 0.0, debtEquity: 0.98 },
  { ticker: "HEXAB", name: "Hexagon AB (publ)", sector: "Precision Sensors & Software", price: 118.5, country: "Sweden", marketCap: 31200, currency: "SEK", pe: 23.4, pb: 2.85, divYield: 1.15, debtEquity: 0.48 },
  { ticker: "HTRO", name: "Hexatronic Group AB (publ)", sector: "Fiber Optic Components", price: 41.5, country: "Sweden", marketCap: 795, currency: "SEK", pe: 11.2, pb: 2.45, divYield: 2.41, debtEquity: 1.32 },
  { ticker: "HMS", name: "HMS Networks AB (publ)", sector: "Industrial Protocols & IoT", price: 418.0, country: "Sweden", marketCap: 1950, currency: "SEK", pe: 31.5, pb: 6.84, divYield: 1.22, debtEquity: 0.25 },
  { ticker: "HUMBLE", name: "Humble Group AB (publ)", sector: "FMCG Eco & Health Foods", price: 10.4, country: "Sweden", marketCap: 395, currency: "SEK", pe: 18.5, pb: 1.12, divYield: 0.0, debtEquity: 1.48 },
  { ticker: "INDT", name: "Indutrade AB (publ)", sector: "Industrial Niche Trading", price: 254.5, country: "Sweden", marketCap: 9100, currency: "SEK", pe: 28.5, pb: 5.12, divYield: 1.34, debtEquity: 0.48 },
  { ticker: "INSTAL", name: "Instalco AB (publ)", sector: "Technical Installations & HVAC", price: 38.4, country: "Sweden", marketCap: 950, currency: "SEK", pe: 13.9, pb: 2.45, divYield: 2.95, debtEquity: 1.35 },
  { ticker: "KAR", name: "Karnov Group AB (publ)", sector: "Legal Information Systems", price: 61.2, country: "Sweden", marketCap: 620, currency: "SEK", pe: 22.8, pb: 1.84, divYield: 1.42, debtEquity: 1.64 },
  { ticker: "KNOW", name: "Knowit AB (publ)", sector: "Digital Transformation IT", price: 142.5, country: "Sweden", marketCap: 385, currency: "SEK", pe: 14.8, pb: 1.38, divYield: 3.94, debtEquity: 0.38 },
  { ticker: "LAGRB", name: "Lagercrantz Group AB (publ)", sector: "Industrial Niche Tech", price: 138.5, country: "Sweden", marketCap: 2800, currency: "SEK", pe: 31.4, pb: 7.95, divYield: 1.15, debtEquity: 0.72 },
  { ticker: "LIFCOB", name: "Lifco AB (publ)", sector: "Industrial Conglomerate & Dental", price: 242.0, country: "Sweden", marketCap: 10400, currency: "SEK", pe: 33.2, pb: 8.85, divYield: 0.85, debtEquity: 0.58 },
  { ticker: "MCAP", name: "MedCap AB (publ)", sector: "Healthcare & Life Sciences MedTech", price: 288.0, country: "Sweden", marketCap: 410, currency: "SEK", pe: 31.8, pb: 4.85, divYield: 0.88, debtEquity: 0.34 },
  { ticker: "NCAB", name: "NCAB Group AB (publ)", sector: "Printed Circuit Board Sourcing", price: 74.2, country: "Sweden", marketCap: 1350, currency: "SEK", pe: 25.4, pb: 7.22, divYield: 1.62, debtEquity: 0.45 },
  { ticker: "NIBEB", name: "NIBE Industrier AB (publ)", sector: "Heat Pumps & HVAC Systems", price: 54.1, country: "Sweden", marketCap: 10800, currency: "SEK", pe: 29.8, pb: 3.52, divYield: 1.25, debtEquity: 0.88 },
  { ticker: "SDIPB", name: "Sdiptech AB (publ)", sector: "Infrastructure Solutions", price: 285.0, country: "Sweden", marketCap: 1100, currency: "SEK", pe: 25.1, pb: 3.65, divYield: 0.0, debtEquity: 1.54 },
  { ticker: "STORB", name: "Storskogen Group AB (publ)", sector: "SME Diversified Conglomerate", price: 7.85, country: "Sweden", marketCap: 1250, currency: "SEK", pe: 11.2, pb: 0.62, divYield: 1.08, debtEquity: 1.68 },
  { ticker: "SWECB", name: "Sweco AB (publ)", sector: "Engineering Consulting AEC", price: 124.5, country: "Sweden", marketCap: 4120, currency: "SEK", pe: 21.8, pb: 3.42, divYield: 2.38, debtEquity: 0.35 },
  { ticker: "SECARE", name: "Swedencare AB (publ)", sector: "Pet Health Supplies Mfg", price: 58.4, country: "Sweden", marketCap: 920, currency: "SEK", pe: 38.5, pb: 4.12, divYield: 0.0, debtEquity: 0.28 },
  { ticker: "TEQ", name: "Teqnion AB (publ)", sector: "Niche Industrial Roll-up", price: 184.0, country: "Sweden", marketCap: 310, currency: "SEK", pe: 22.8, pb: 4.95, divYield: 1.63, debtEquity: 0.65 },
  { ticker: "VIMIAN", name: "Vimian Group AB (publ)", sector: "Specialty Veterinary MedTech", price: 31.2, country: "Sweden", marketCap: 1520, currency: "SEK", pe: 42.0, pb: 2.15, divYield: 0.0, debtEquity: 0.72 },
  { ticker: "VITB", name: "Vitec Software Group AB (publ)", sector: "Nordic Vertical Software (VMS)", price: 485.0, country: "Sweden", marketCap: 2100, currency: "SEK", pe: 46.5, pb: 6.84, divYield: 0.65, debtEquity: 0.85 },
  { ticker: "VOLO", name: "Volati AB (publ)", sector: "Industrial & Consumer Conglomerate", price: 92.5, country: "Sweden", marketCap: 720, currency: "SEK", pe: 16.5, pb: 2.15, divYield: 2.12, debtEquity: 1.14 },
  { ticker: "XANOB", name: "XANO Industri AB (publ)", sector: "Packaging & Component Manufacturing", price: 82.0, country: "Sweden", marketCap: 410, currency: "SEK", pe: 15.1, pb: 1.95, divYield: 2.45, debtEquity: 0.94 },
  { ticker: "BERNERB", name: "Berner Industrier AB", sector: "Fluid Technology & Safety", price: 31.5, country: "Sweden", marketCap: 180, currency: "SEK", pe: 14.8, pb: 1.84, divYield: 3.12, debtEquity: 0.68 },

  // --- SWITZERLAND (CHF) ---
  { ticker: "SIKA", name: "Sika AG", sector: "Specialty Chemicals, Sealants", price: 245.0, country: "Switzerland", marketCap: 38900, currency: "CHF", pe: 34.2, pb: 6.85, divYield: 1.34, debtEquity: 0.82 },
  { ticker: "CICN", name: "Cicor Technologies Ltd.", sector: "Precision Electronics Mfg", price: 48.5, country: "Switzerland", marketCap: 145, currency: "CHF", pe: 16.5, pb: 1.42, divYield: 0.0, debtEquity: 1.15 },
  { ticker: "DKSH", name: "DKSH Holding AG", sector: "Asia-Pacific Market Expansion Services", price: 68.4, country: "Switzerland", marketCap: 4380, currency: "CHF", pe: 19.5, pb: 3.12, divYield: 3.14, debtEquity: 0.45 },

  // --- UNITED KINGDOM (GBP) ---
  { ticker: "AT", name: "Ashtead Technology Holdings Plc", sector: "Subsea Rental Equipment", price: 6.45, country: "United Kingdom", marketCap: 520, currency: "GBP", pe: 22.4, pb: 3.14, divYield: 0.88, debtEquity: 0.72 },
  { ticker: "BNZL", name: "Bunzl plc", sector: "Distribution & Outsourced Supply", price: 29.8, country: "United Kingdom", marketCap: 10100, currency: "GBP", pe: 16.5, pb: 3.96, divYield: 2.22, debtEquity: 1.14 },
  { ticker: "DPLM", name: "Diploma PLC", sector: "Specialized Seals & Controls", price: 34.2, country: "United Kingdom", marketCap: 4500, currency: "GBP", pe: 28.5, pb: 4.85, divYield: 1.62, debtEquity: 0.76 },
  { ticker: "HLMA", name: "Halma plc", sector: "Safety & Detection Solutions", price: 22.1, country: "United Kingdom", marketCap: 8350, currency: "GBP", pe: 29.4, pb: 4.12, divYield: 0.95, debtEquity: 0.44 },
  { ticker: "JDG", name: "Judges Scientific plc", sector: "Scientific Instrument roll-up", price: 92.5, country: "United Kingdom", marketCap: 610, currency: "GBP", pe: 31.4, pb: 7.22, divYield: 1.14, debtEquity: 0.95 },
  { ticker: "RTO", name: "Rentokil Initial plc", sector: "Pest Control & Facility", price: 3.85, country: "United Kingdom", marketCap: 9400, currency: "GBP", pe: 18.2, pb: 1.95, divYield: 2.25, debtEquity: 1.48 },
  { ticker: "SDI", name: "SDI Group plc", sector: "Scientific & Digital Imaging", price: 0.85, country: "United Kingdom", marketCap: 92, currency: "GBP", pe: 14.5, pb: 1.42, divYield: 0.0, debtEquity: 0.65 },
  { ticker: "SUP", name: "Supreme Plc", sector: "Consumer Distribution", price: 1.45, country: "United Kingdom", marketCap: 175, currency: "GBP", pe: 11.2, pb: 2.52, divYield: 4.85, debtEquity: 0.35 },
  { ticker: "MHA", name: "Mha Plc", sector: "Niche Services Conglomerate", price: 2.15, country: "United Kingdom", marketCap: 145, currency: "GBP", pe: 12.8, pb: 1.62, divYield: 3.15, debtEquity: 0.58 }
];

export const SCREENER_STOCKS: ScreenerStock[] = RAW_STOCKS.map(s => {
  const industry = sectorToIndustryMap[s.sector] || s.sector;
  const priceCagr = getDeterministicCagr(s.ticker, s.pe);
  return {
    ...s,
    industry,
    priceCagr
  };
});
