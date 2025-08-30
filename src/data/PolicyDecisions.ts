import { PolicyDecision } from '../types/GameTypes';

export const createDefaultPolicyDecisions = (): PolicyDecision[] => [
  // Core Economic Policies
  {
    id: 'education',
    name: 'Education Spending',
    description: 'Invest in schools, universities, and literacy programs',
    category: 'education',
    value: 4.0,
    min: 1.0,
    max: 15.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'health',
    name: 'Healthcare Investment',
    description: 'Fund hospitals, medical infrastructure, and public health',
    category: 'health',
    value: 3.0,
    min: 1.0,
    max: 12.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Development',
    description: 'Build roads, bridges, power plants, and telecommunications',
    category: 'infrastructure',
    value: 5.0,
    min: 2.0,
    max: 20.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'environment',
    name: 'Environmental Policy',
    description: 'Implement green technologies and emission reduction measures',
    category: 'environment',
    value: 2.0,
    min: 0.0,
    max: 8.0,
    step: 0.5,
    unit: '% GDP'
  },

  // Trade & Regional Policies
  {
    id: 'trade',
    name: 'Trade Liberalization',
    description: 'Open markets, reduce barriers, and promote international trade',
    category: 'economic',
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    unit: '% Open'
  },
  {
    id: 'tariff',
    name: 'Tariff Policy',
    description: 'Set import tariffs to protect domestic industries vs. free trade',
    category: 'economic',
    value: 15,
    min: 0,
    max: 40,
    step: 2,
    unit: '% Avg'
  },
  {
    id: 'cooperation',
    name: 'Regional Cooperation',
    description: 'Invest in SAARC initiatives and bilateral partnerships',
    category: 'economic',
    value: 50,
    min: 0,
    max: 100,
    step: 5,
    unit: '% Engagement'
  },

  // Industry-Specific Policies
  {
    id: 'agriculture',
    name: 'Agricultural Development',
    description: 'Subsidies, irrigation, technology, and rural development programs',
    category: 'agriculture',
    value: 3.5,
    min: 1.0,
    max: 12.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Incentives',
    description: 'Industrial parks, tax breaks, and manufacturing promotion',
    category: 'manufacturing',
    value: 2.0,
    min: 0.5,
    max: 8.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'services',
    name: 'Services Sector Development',
    description: 'IT, finance, tourism, and service industry promotion',
    category: 'services',
    value: 1.5,
    min: 0.5,
    max: 6.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'energy',
    name: 'Energy Policy',
    description: 'Power generation, renewable energy, and energy security',
    category: 'energy',
    value: 4.0,
    min: 2.0,
    max: 15.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'technology',
    name: 'Technology & Innovation',
    description: 'R&D, digital infrastructure, and innovation ecosystems',
    category: 'technology',
    value: 1.0,
    min: 0.2,
    max: 5.0,
    step: 0.2,
    unit: '% GDP'
  },
  {
    id: 'tourism',
    name: 'Tourism Development',
    description: 'Tourism infrastructure, marketing, and hospitality sector',
    category: 'tourism',
    value: 0.8,
    min: 0.1,
    max: 4.0,
    step: 0.1,
    unit: '% GDP'
  },

  // Financial & Monetary Policies
  {
    id: 'fiscal_deficit',
    name: 'Fiscal Deficit Target',
    description: 'Government budget deficit as percentage of GDP',
    category: 'fiscal',
    value: 3.5,
    min: 0.0,
    max: 10.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'foreign_investment',
    name: 'Foreign Investment Policy',
    description: 'FDI limits, investment incentives, and market access',
    category: 'investment',
    value: 60,
    min: 20,
    max: 100,
    step: 5,
    unit: '% Open'
  },

  // Social & Labor Policies
  {
    id: 'social_protection',
    name: 'Social Protection',
    description: 'Welfare programs, unemployment benefits, and social safety nets',
    category: 'social',
    value: 2.5,
    min: 0.5,
    max: 8.0,
    step: 0.5,
    unit: '% GDP'
  },
  {
    id: 'labor_market',
    name: 'Labor Market Flexibility',
    description: 'Employment laws, worker rights, and labor market regulations',
    category: 'labor',
    value: 50,
    min: 20,
    max: 80,
    step: 5,
    unit: '% Flexible'
  }
];

// Industry-specific policy effects on different sectors
export const INDUSTRY_POLICY_EFFECTS = {
  agriculture: {
    gdp_contribution: 0.3,
    employment_share: 0.4,
    export_potential: 0.2,
    food_security: 0.8,
    rural_development: 0.9
  },
  manufacturing: {
    gdp_contribution: 0.4,
    employment_share: 0.3,
    export_potential: 0.7,
    technology_transfer: 0.6,
    urbanization: 0.5
  },
  services: {
    gdp_contribution: 0.5,
    employment_share: 0.4,
    export_potential: 0.6,
    skill_development: 0.8,
    urbanization: 0.7
  },
  energy: {
    infrastructure_quality: 0.8,
    industrial_competitiveness: 0.7,
    environmental_impact: -0.4,
    energy_security: 0.9
  },
  technology: {
    productivity_growth: 0.8,
    innovation_capacity: 0.9,
    competitiveness: 0.7,
    skill_premium: 0.6
  },
  tourism: {
    foreign_exchange: 0.6,
    employment_creation: 0.5,
    regional_development: 0.4,
    cultural_preservation: 0.3
  }
};

// Country-specific industry strengths (based on real economic structures)
export const COUNTRY_INDUSTRY_PROFILES = {
  'India': {
    services: 1.2,
    technology: 1.5,
    manufacturing: 1.1,
    agriculture: 0.8
  },
  'Bangladesh': {
    manufacturing: 1.4,
    agriculture: 1.1,
    services: 0.9,
    tourism: 0.7
  },
  'Pakistan': {
    agriculture: 1.2,
    manufacturing: 1.1,
    services: 0.9,
    energy: 0.8
  },
  'Sri Lanka': {
    tourism: 1.5,
    services: 1.1,
    agriculture: 1.0,
    manufacturing: 0.9
  },
  'Nepal': {
    tourism: 1.3,
    agriculture: 1.2,
    energy: 1.4,
    services: 0.8
  },
  'Bhutan': {
    energy: 1.8,
    tourism: 1.4,
    agriculture: 1.1,
    environment: 1.6
  },
  'Maldives': {
    tourism: 2.0,
    services: 1.2,
    environment: 1.3,
    technology: 0.7
  },
  'Afghanistan': {
    agriculture: 1.3,
    energy: 1.1,
    manufacturing: 0.6,
    services: 0.5
  }
};