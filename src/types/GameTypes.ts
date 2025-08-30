export interface Country {
  name: string;
  code: string;
  color: string;
  flag: string;
}

export interface CountryStats {
  country: string;
  year: number;
  gdp_growth: number;
  unemployment: number;
  literacy_rate: number;
  life_expectancy: number;
  poverty_rate: number;
  co2_emissions: number;
  population: number;
  infant_mortality: number;
  health_expenditure: number;
  education_spending: number;
  infrastructure_investment: number;
  agriculture_spending?: number;
  manufacturing_spending?: number;
  services_spending?: number;
  energy_spending?: number;
  technology_spending?: number;
  tourism_spending?: number;
  environment_spending?: number;
  trade_liberalization?: number;
  tariff_rate?: number;
  agriculture_gdp_percent?: number;
  manufacturing_gdp_percent?: number;
  services_gdp_percent?: number;
}

export interface PolicyDecision {
  id: string;
  name: string;
  description: string;
  category: 'education' | 'health' | 'infrastructure' | 'environment' | 'economic' | 
           'agriculture' | 'manufacturing' | 'services' | 'energy' | 'technology' | 
           'tourism' | 'fiscal' | 'investment' | 'social' | 'labor';
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface GameState {
  selectedCountry: string;
  currentYear: number;
  startYear: number;
  endYear: number;
  stats: CountryStats[];
  decisions: PolicyDecision[];
  gameActive: boolean;
  finalScore?: number;
}

export interface RegionalEvent {
  id: string;
  name: string;
  description: string;
  year: number;
  effects: {
    [key: string]: number;
  };
}

export interface TradeRelationship {
  from: string;
  to: string;
  tradeVolume: number; // Bilateral trade as % of GDP
  tariffRate: number; // Average tariff rate
  cooperation: number; // 0-100 cooperation index
}

export interface RegionalMatrix {
  countries: string[];
  tradeMatrix: TradeRelationship[];
  regionalEvents: RegionalEvent[];
  cooperationIndex: number; // Overall regional cooperation
}

export interface PolicySpillover {
  sourceCountry: string;
  targetCountry: string;
  policyType: string;
  effect: number;
  description: string;
  magnitude: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short-term' | 'long-term';
  sector?: string;
}

export interface MultiCountryGameState {
  countries: { [key: string]: CountryStats };
  playerCountry: string;
  regionalMatrix: RegionalMatrix;
  spilloverEffects: PolicySpillover[];
  detailedSpillovers: DetailedSpilloverEffect[];
  year: number;
  gameActive: boolean;
}

export interface DetailedSpilloverEffect {
  id: string;
  sourceCountry: string;
  targetCountry: string;
  policyCategory: string;
  effectType: 'trade' | 'investment' | 'migration' | 'technology' | 'environment' | 'security';
  magnitude: number;
  description: string;
  tradeProducts?: string[];
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  confidence: number; // 0-1 confidence in the effect
}

export interface IndustryStats {
  agriculture_gdp: number;
  manufacturing_gdp: number;
  services_gdp: number;
  energy_production: number;
  technology_exports: number;
  tourism_revenue: number;
  fdi_inflows: number;
  trade_balance: number;
}

export interface BilateralTradeData {
  reporter: string;
  partner: string;
  year: number;
  exports_usd: number;
  imports_usd: number;
  trade_balance: number;
  main_export_products: string[];
  main_import_products: string[];
  tariff_rate: number;
  trade_agreement: boolean;
}