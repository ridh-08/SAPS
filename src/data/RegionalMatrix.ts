import { TradeRelationship, RegionalMatrix, PolicySpillover } from '../types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from './CountryList';
import { getMainTradeProducts, getTradeIntensity } from './TradeProductsLoader';


// Trade relationships based on real South Asian trade patterns
export const INITIAL_TRADE_MATRIX: TradeRelationship[] = [
  // India's trade relationships (largest economy, major trading partner)
  { from: 'India', to: 'Bangladesh', tradeVolume: 8.5, tariffRate: 8.5, cooperation: 75 },
  { from: 'India', to: 'Pakistan', tradeVolume: 2.1, tariffRate: 25.0, cooperation: 35 },
  { from: 'India', to: 'Sri Lanka', tradeVolume: 4.7, tariffRate: 12.0, cooperation: 80 },
  { from: 'India', to: 'Nepal', tradeVolume: 6.8, tariffRate: 5.0, cooperation: 85 },
  { from: 'India', to: 'Bhutan', tradeVolume: 12.5, tariffRate: 0.0, cooperation: 95 },
  { from: 'India', to: 'Maldives', tradeVolume: 4.2, tariffRate: 10.0, cooperation: 70 },
  { from: 'India', to: 'Afghanistan', tradeVolume: 1.5, tariffRate: 15.0, cooperation: 45 },

  // Bangladesh trade relationships
  { from: 'Bangladesh', to: 'India', tradeVolume: 1.2, tariffRate: 12.0, cooperation: 75 },
  { from: 'Bangladesh', to: 'Pakistan', tradeVolume: 0.2, tariffRate: 20.0, cooperation: 60 },
  { from: 'Bangladesh', to: 'Sri Lanka', tradeVolume: 0.05, tariffRate: 15.0, cooperation: 65 },
  { from: 'Bangladesh', to: 'Nepal', tradeVolume: 0.03, tariffRate: 18.0, cooperation: 70 },

  // Pakistan trade relationships
  { from: 'Pakistan', to: 'India', tradeVolume: 0.4, tariffRate: 30.0, cooperation: 35 },
  { from: 'Pakistan', to: 'Bangladesh', tradeVolume: 0.1, tariffRate: 18.0, cooperation: 60 },
  { from: 'Pakistan', to: 'Sri Lanka', tradeVolume: 0.3, tariffRate: 12.0, cooperation: 70 },
  { from: 'Pakistan', to: 'Afghanistan', tradeVolume: 1.8, tariffRate: 8.0, cooperation: 80 },

  // Other bilateral relationships
  { from: 'Sri Lanka', to: 'India', tradeVolume: 1.1, tariffRate: 10.0, cooperation: 80 },
  { from: 'Sri Lanka', to: 'Pakistan', tradeVolume: 0.2, tariffRate: 14.0, cooperation: 70 },
  { from: 'Nepal', to: 'India', tradeVolume: 0.7, tariffRate: 3.0, cooperation: 85 },
  { from: 'Bhutan', to: 'India', tradeVolume: 0.4, tariffRate: 0.0, cooperation: 95 },
  { from: 'Maldives', to: 'India', tradeVolume: 0.02, tariffRate: 8.0, cooperation: 70 },
  { from: 'Afghanistan', to: 'Pakistan', tradeVolume: 0.3, tariffRate: 10.0, cooperation: 80 },
  { from: 'Afghanistan', to: 'India', tradeVolume: 0.1, tariffRate: 18.0, cooperation: 45 }
];

export const INITIAL_REGIONAL_MATRIX: RegionalMatrix = {
  countries: SOUTH_ASIAN_COUNTRIES.map(c => c.name),
  tradeMatrix: INITIAL_TRADE_MATRIX,
  regionalEvents: [],
  cooperationIndex: 65 // Overall SAARC cooperation index
};

export class RegionalEconomySimulator {
  static calculateTradeSpillovers(
    sourceCountry: string,
    policyChanges: { [key: string]: number },
    tradeMatrix: TradeRelationship[]
  ): PolicySpillover[] {
    const spillovers: PolicySpillover[] = [];

    // Find all countries that trade with the source country
    const tradingPartners = tradeMatrix.filter(t => 
      t.from === sourceCountry || t.to === sourceCountry
    );

    tradingPartners.forEach(trade => {
      const targetCountry = trade.from === sourceCountry ? trade.to : trade.from;
      const tradeIntensity = trade.tradeVolume / 100; // Convert to decimal
      const cooperationFactor = trade.cooperation / 100;

      // GDP Growth spillovers
      if (policyChanges.gdp_growth) {
        const spilloverEffect = policyChanges.gdp_growth * tradeIntensity * cooperationFactor * 0.25;
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'trade_gdp',
          effect: spilloverEffect,
          description: `Trade spillover from ${sourceCountry}'s economic growth`,
          magnitude: spilloverEffect > 0.1 ? 'high' : spilloverEffect > 0.05 ? 'medium' : 'low',
          timeframe: 'short-term'
        });
      }

      // Infrastructure spillovers (cross-border connectivity)
      if (policyChanges.infrastructure_investment) {
        const infraSpillover = (policyChanges.infrastructure_investment - 5) * tradeIntensity * 0.12;
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'infrastructure',
          effect: infraSpillover,
          description: `Cross-border infrastructure benefits from ${sourceCountry}`,
          magnitude: Math.abs(infraSpillover) > 0.08 ? 'high' : Math.abs(infraSpillover) > 0.04 ? 'medium' : 'low',
          timeframe: 'medium-term'
        });
      }

      // Environmental spillovers (pollution, climate)
      if (policyChanges.co2_emissions) {
        const envSpillover = policyChanges.co2_emissions * 0.08; // Cross-border pollution
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'environment',
          effect: envSpillover,
          description: `Environmental impact from ${sourceCountry}'s emissions`,
          magnitude: Math.abs(envSpillover) > 0.05 ? 'high' : Math.abs(envSpillover) > 0.02 ? 'medium' : 'low',
          timeframe: 'long-term'
        });
      }

      // Industry-specific spillovers
      if (policyChanges.manufacturing_investment) {
        const manufacturingSpillover = policyChanges.manufacturing_investment * tradeIntensity * 0.1;
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'manufacturing',
          effect: manufacturingSpillover,
          description: `Manufacturing competitiveness impact from ${sourceCountry}`,
          magnitude: Math.abs(manufacturingSpillover) > 0.06 ? 'high' : Math.abs(manufacturingSpillover) > 0.03 ? 'medium' : 'low',
          timeframe: 'medium-term',
          sector: 'manufacturing'
        });
      }

      // Technology spillovers
      if (policyChanges.technology_investment) {
        const techSpillover = policyChanges.technology_investment * cooperationFactor * 0.15;
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'technology',
          effect: techSpillover,
          description: `Technology transfer and innovation spillover from ${sourceCountry}`,
          magnitude: Math.abs(techSpillover) > 0.08 ? 'high' : Math.abs(techSpillover) > 0.04 ? 'medium' : 'low',
          timeframe: 'long-term',
          sector: 'technology'
        });
      }

      // Energy spillovers (especially relevant for cross-border energy trade)
      if (policyChanges.energy_investment && this.hasEnergyTrade(sourceCountry, targetCountry)) {
        const energySpillover = policyChanges.energy_investment * 0.2;
        spillovers.push({
          sourceCountry,
          targetCountry,
          policyType: 'energy',
          effect: energySpillover,
          description: `Energy security and pricing impact from ${sourceCountry}`,
          magnitude: Math.abs(energySpillover) > 0.1 ? 'high' : Math.abs(energySpillover) > 0.05 ? 'medium' : 'low',
          timeframe: 'immediate',
          sector: 'energy'
        });
      }
    });

    return spillovers;
  }

  static generateSpilloverDescription(
    sourceCountry: string,
    targetCountry: string,
    policyCategory: string,
    product: string | undefined,
    isPositive: boolean
  ): string {
    if (product) {
      const productLower = product.toLowerCase();
      if (productLower.includes('textile') || productLower.includes('garment') || productLower.includes('apparel')) {
        return `${sourceCountry}'s manufacturing policies ${isPositive ? 'boost its textile exports' : 'reduce its competitiveness'}, affecting ${targetCountry}'s key garment industry.`;
      }
      if (productLower.includes('machinery') || productLower.includes('automobiles') || productLower.includes('motorcycles')) {
        return `A shift in ${sourceCountry}'s industrial strategy impacts its machinery trade, ${isPositive ? 'offering new technology to' : 'creating competition for'} ${targetCountry}.`;
      }
      if (productLower.includes('petroleum') || productLower.includes('energy') || productLower.includes('hydroelectric')) {
        return `${sourceCountry}'s energy policy changes affect cross-border power trade, influencing energy security in ${targetCountry}.`;
      }
      if (productLower.includes('food') || productLower.includes('rice') || productLower.includes('agriculture') || productLower.includes('fish') || productLower.includes('fruits') || productLower.includes('vegetable')) {
        return `Agricultural policies in ${sourceCountry} influence food supply chains, impacting food prices and availability in ${targetCountry}.`;
      }
      if (productLower.includes('pharmaceutical')) {
        return `Changes in ${sourceCountry}'s health and manufacturing sector affect the availability and cost of pharmaceuticals in ${targetCountry}.`;
      }
      return `${sourceCountry}'s policy on ${product} ${isPositive ? 'positively' : 'negatively'} impacts bilateral trade with ${targetCountry}.`;
    } else {
      switch (policyCategory) {
        case 'infrastructure':
          return `${sourceCountry}'s investment in infrastructure improves cross-border connectivity, ${isPositive ? 'lowering trade costs for' : 'creating bottlenecks for'} ${targetCountry}.`;
        case 'trade':
          return `Greater trade openness in ${sourceCountry} ${isPositive ? 'increases market access for' : 'intensifies competition for'} ${targetCountry}'s exporters.`;
        case 'cooperation':
          return `A shift in ${sourceCountry}'s regional cooperation stance ${isPositive ? 'strengthens' : 'weakens'} diplomatic and economic ties with ${targetCountry}.`;
        case 'environment':
          return `${sourceCountry}'s environmental regulations have cross-border effects on shared ecosystems and air quality in ${targetCountry}.`;
        case 'technology':
          return `Investment in technology in ${sourceCountry} leads to knowledge spillovers, ${isPositive ? 'boosting innovation capacity in' : 'widening the technology gap with'} ${targetCountry}.`;
        case 'health':
          return `Public health policies in ${sourceCountry} can affect cross-border disease transmission and health security for ${targetCountry}.`;
        default:
          return `${sourceCountry}'s ${policyCategory} policy has a ripple effect on ${targetCountry}'s economy.`;
      }
    }
  }

  static hasEnergyTrade(country1: string, country2: string): boolean {
    // Countries with significant energy trade relationships
    const energyTradePairs = [
      ['India', 'Bhutan'], // Hydroelectric power
      ['India', 'Nepal'], // Power trade
      ['Pakistan', 'Afghanistan'], // Energy cooperation
      ['India', 'Bangladesh'] // Power grid connectivity
    ];
    
    return energyTradePairs.some(pair => 
      (pair[0] === country1 && pair[1] === country2) ||
      (pair[0] === country2 && pair[1] === country1)
    );
  }

  static calculateDetailedSpillovers(
    sourceCountry: string,
    policyChanges: { [key: string]: number },
    tradeMatrix: TradeRelationship[],
    sourceCountryStats: import('../types/GameTypes').CountryStats
  ): any[] {
    const detailedSpillovers: any[] = [];
    
    // Get actual trading partners and trade volumes
    const tradingPartners = tradeMatrix.filter(t => 
      t.from === sourceCountry || t.to === sourceCountry
    );

    tradingPartners.forEach(trade => {
      const targetCountry = trade.from === sourceCountry ? trade.to : trade.from;
      const tradeVolume = trade.tradeVolume;
      
      // Calculate specific product-based spillovers using bilateral trade products
      const tradeProducts = getMainTradeProducts(sourceCountry, targetCountry);
      
      if (tradeProducts.total.length > 0) {
        tradeProducts.total.forEach((product: string) => {
          if (this.isPolicyRelevantToProduct(policyChanges, product)) {
            const magnitude = this.calculateProductSpillover(policyChanges, product, tradeVolume, sourceCountryStats);
            const policyCategory = this.getPolicyCategory(policyChanges, product);

            if (Math.abs(magnitude) > 0.01) { // Only include significant spillovers
              detailedSpillovers.push({
                id: `${sourceCountry}-${targetCountry}-${product}`,
                sourceCountry,
                targetCountry,
                policyCategory: policyCategory,
                effectType: this.getEffectType(product),
                magnitude: magnitude,
                description: this.generateSpilloverDescription(
                  sourceCountry,
                  targetCountry,
                  policyCategory,
                  product,
                  magnitude > 0
                ),
                tradeProducts: [product],
                timeframe: this.getSpilloverTimeframe(product),
                confidence: 0.8,
                sector: this.getProductSector(product)
              });
            }
          }
        });
      }
      
      // Add general policy spillovers
      Object.entries(policyChanges).forEach(([policyType, change]) => {
        if (Math.abs(change) > 0.1) {
          const magnitude = this.calculateGeneralSpillover(policyType, change, tradeVolume, sourceCountryStats);
          
          if (Math.abs(magnitude) > 0.01) {
            detailedSpillovers.push({
              id: `${sourceCountry}-${targetCountry}-${policyType}`,
              sourceCountry,
              targetCountry,
              policyCategory: policyType,
              effectType: this.getPolicyEffectType(policyType),
              magnitude: magnitude,
              description: this.generateSpilloverDescription(
                sourceCountry,
                targetCountry,
                policyType,
                undefined, // no product
                magnitude > 0
              ),
              timeframe: this.getPolicyTimeframe(policyType),
              confidence: 0.7
            });
          }
        }
      });
    });

    return detailedSpillovers;
  }

  static getEffectType(product: string): 'trade' | 'investment' | 'technology' | 'environment' {
    const techProducts = ['machinery', 'pharmaceuticals', 'chemicals', 'electronics'];
    const envProducts = ['petroleum', 'coal', 'natural gas', 'timber'];
    
    if (techProducts.some(tp => product.toLowerCase().includes(tp))) return 'technology';
    if (envProducts.some(ep => product.toLowerCase().includes(ep))) return 'environment';
    return 'trade';
  }

  static getProductSector(product: string): string {
    const productSectorMap: { [key: string]: string } = {
      'textiles': 'manufacturing',
      'pharmaceuticals': 'health',
      'machinery': 'manufacturing',
      'food': 'agriculture',
      'petroleum': 'energy',
      'electricity': 'energy',
      'tea': 'agriculture',
      'rice': 'agriculture',
      'cotton': 'agriculture',
      'cement': 'manufacturing',
      'chemicals': 'manufacturing',
      'fish': 'agriculture',
      'timber': 'environment',
      'gems': 'mining',
      'handicrafts': 'services'
    };
    
    const lowerProduct = product.toLowerCase();
    for (const [key, sector] of Object.entries(productSectorMap)) {
      if (lowerProduct.includes(key)) {
        return sector;
      }
    }
    return 'trade';
  }

  static calculateGeneralSpillover(
    policyType: string, 
    newValue: number, 
    tradeVolume: number,
    sourceCountryStats: import('../types/GameTypes').CountryStats
  ): number {
    const baseEffect = (tradeVolume / 100);
    let change = 0;

    // Calculate change from previous state
    switch (policyType) {
      case 'infrastructure':
        change = newValue - (sourceCountryStats.infrastructure_investment || 5.0);
        return baseEffect * change * 0.03; // Infrastructure has strong spillovers
      case 'education':
        change = newValue - (sourceCountryStats.education_spending || 4.0);
        return baseEffect * change * 0.015; // Education has medium spillovers
      case 'health':
        change = newValue - (sourceCountryStats.health_expenditure || 3.0);
        return baseEffect * change * 0.01; // Health has moderate spillovers
      case 'trade':
        change = newValue - (sourceCountryStats.trade_liberalization || 50);
        return baseEffect * (change / 100) * 0.20; // Trade policy has high spillovers
      case 'environment':
        change = newValue - (sourceCountryStats.environment_spending || 2.0);
        return baseEffect * change * 0.02; // Environmental policies have cross-border effects
      default:
        return 0; // Only calculate for specific general policies
    }
  }

  static getPolicyEffectType(policyType: string): 'trade' | 'investment' | 'technology' | 'environment' {
    switch (policyType) {
      case 'trade':
      case 'tariff':
        return 'trade';
      case 'infrastructure':
      case 'foreign_investment':
        return 'investment';
      case 'technology':
        return 'technology';
      case 'environment':
        return 'environment';
      default:
        return 'trade';
    }
  }

  static getPolicyTimeframe(policyType: string): 'immediate' | 'short-term' | 'medium-term' | 'long-term' {
    switch (policyType) {
      case 'tariff':
      case 'trade':
        return 'immediate';
      case 'infrastructure':
      case 'health':
        return 'medium-term';
      case 'education':
      case 'technology':
        return 'long-term';
      default:
        return 'short-term';
    }
  }

  static isPolicyRelevantToProduct(policyChanges: { [key: string]: number }, product: string): boolean {
    const productPolicyMap: { [key: string]: (keyof typeof policyChanges)[] } = {
      'textile': ['manufacturing', 'trade', 'services'],
      'garment': ['manufacturing', 'trade', 'services'],
      'apparel': ['manufacturing', 'trade', 'services'],
      'pharmaceuticals': ['health', 'manufacturing', 'technology'],
      'machinery': ['manufacturing', 'technology', 'infrastructure'],
      'automobiles': ['manufacturing', 'technology', 'infrastructure'],
      'food': ['agriculture', 'trade'],
      'rice': ['agriculture', 'trade'],
      'tea': ['agriculture', 'trade'],
      'cotton': ['agriculture', 'manufacturing'],
      'petroleum': ['energy', 'trade', 'environment'],
      'hydroelectric': ['energy', 'infrastructure', 'environment'],
      'electricity': ['energy', 'infrastructure', 'environment'],
      'cement': ['manufacturing', 'infrastructure'],
      'chemicals': ['manufacturing', 'health'],
      'fish': ['agriculture', 'trade'],
      'timber': ['environment', 'trade'],
      'gems': ['trade', 'services'],
      'handicrafts': ['services', 'tourism'],
      'jute': ['agriculture', 'manufacturing', 'trade'],
      'leather': ['manufacturing', 'trade'],
      'spices': ['agriculture', 'trade'],
      'rubber': ['agriculture', 'manufacturing'],
      'coconut': ['agriculture', 'trade']
    };
    
    const lowerProduct = product.toLowerCase();
    let relevantPolicies: string[] = [];
    
    for (const [key, policies] of Object.entries(productPolicyMap)) {
      if (lowerProduct.includes(key)) {
        relevantPolicies = [...relevantPolicies, ...policies];
      }
    }
    
    return relevantPolicies.some(policy => policy in policyChanges);
  }

  static getPolicyCategory(policyChanges: { [key: string]: number }, product: string): string {
    const lowerProduct = product.toLowerCase();
    const productPolicyMap: { [key: string]: string } = {
      'textiles': 'manufacturing',
      'pharmaceuticals': 'health',
      'machinery': 'manufacturing',
      'food': 'agriculture',
      'rice': 'agriculture',
      'tea': 'agriculture',
      'cotton': 'agriculture',
      'petroleum': 'energy',
      'electricity': 'energy',
      'cement': 'manufacturing',
      'chemicals': 'manufacturing',
      'fish': 'agriculture',
      'timber': 'environment',
      'gems': 'services',
      'handicrafts': 'services',
      'jute': 'agriculture',
      'leather': 'manufacturing',
      'spices': 'agriculture',
      'rubber': 'agriculture',
      'coconut': 'agriculture'
    };
    
    for (const [key, category] of Object.entries(productPolicyMap)) {
      if (lowerProduct.includes(key)) {
        return category;
      }
    }
    
    return 'trade';
  }

  static calculateProductSpillover(
    policyChanges: { [key: string]: number }, 
    product: string, 
    tradeVolume: number,
    sourceCountryStats: import('../types/GameTypes').CountryStats
  ): number {
    // Product-specific spillover calculations based on POLICY CHANGE (delta)
    const baseEffect = tradeVolume / 100;
    const lowerProduct = product.toLowerCase();

    // Calculate deltas from previous year's stats
    const manufacturingChange = (policyChanges.manufacturing || 0) - (sourceCountryStats.manufacturing_spending || 2.0);
    const servicesChange = (policyChanges.services || 0) - (sourceCountryStats.services_spending || 1.5);
    const healthChange = (policyChanges.health || 0) - (sourceCountryStats.health_expenditure || 3.0);
    const infraChange = (policyChanges.infrastructure || 0) - (sourceCountryStats.infrastructure_investment || 5.0);
    const techChange = (policyChanges.technology || 0) - (sourceCountryStats.technology_spending || 1.0);
    const agricultureChange = (policyChanges.agriculture || 0) - (sourceCountryStats.agriculture_spending || 3.5);
    const energyChange = (policyChanges.energy || 0) - (sourceCountryStats.energy_spending || 4.0);
    const tourismChange = (policyChanges.tourism || 0) - (sourceCountryStats.tourism_spending || 0.8);
    const tradeChange = (policyChanges.trade || 50) - (sourceCountryStats.trade_liberalization || 50);

    // Check for product categories and calculate spillovers using deltas
    if (lowerProduct.includes('textile') || lowerProduct.includes('cotton') || lowerProduct.includes('garment') || lowerProduct.includes('apparel')) {
      return (manufacturingChange + servicesChange) * baseEffect * 0.15; // Reduced multiplier
    }
    if (lowerProduct.includes('pharmaceutical') || lowerProduct.includes('chemical')) {
      return (healthChange + manufacturingChange) * baseEffect * 0.2;
    }
    if (lowerProduct.includes('machinery') || lowerProduct.includes('equipment') || lowerProduct.includes('automobiles') || lowerProduct.includes('steel')) {
      return (infraChange + techChange) * baseEffect * 0.18;
    }
    if (lowerProduct.includes('food') || lowerProduct.includes('rice') || lowerProduct.includes('tea') || 
        lowerProduct.includes('fish') || lowerProduct.includes('spice') || lowerProduct.includes('fruits') || lowerProduct.includes('vegetable')) {
      return agricultureChange * baseEffect * 0.25;
    }
    if (lowerProduct.includes('petroleum') || lowerProduct.includes('hydroelectric') || lowerProduct.includes('electricity') || 
        lowerProduct.includes('gas') || lowerProduct.includes('energy')) {
      return energyChange * baseEffect * 0.25; // Energy is sensitive
    }
    if (lowerProduct.includes('handicraft') || lowerProduct.includes('tourism') || lowerProduct.includes('gem')) {
      return (tourismChange + servicesChange) * baseEffect * 0.15;
    }
    if (lowerProduct.includes('cement') || lowerProduct.includes('construction')) {
      return infraChange * baseEffect * 0.2;
    }
    
    // Default trade spillover based on change in trade liberalization
    return (tradeChange / 100) * baseEffect * 0.2;
  }

  static getSpilloverTimeframe(product: string): 'immediate' | 'short-term' | 'medium-term' | 'long-term' {
    const lowerProduct = product.toLowerCase();
    const immediateProducts = ['petroleum', 'electricity', 'food', 'gas', 'energy'];
    const shortTermProducts = ['textiles', 'machinery', 'cement', 'rice', 'fish'];
    const mediumTermProducts = ['pharmaceuticals', 'chemicals', 'equipment'];
    const longTermProducts = ['technology', 'education', 'infrastructure'];
    
    if (immediateProducts.some(p => lowerProduct.includes(p))) return 'immediate';
    if (shortTermProducts.some(p => lowerProduct.includes(p))) return 'short-term';
    if (mediumTermProducts.some(p => lowerProduct.includes(p))) return 'medium-term';
    if (longTermProducts.some(p => lowerProduct.includes(p))) return 'long-term';
    return 'long-term';
  }

  static calculateTariffEffects(
    country: string,
    tariffPolicy: number, // 0-100 scale
    tradeMatrix: TradeRelationship[]
  ): { [key: string]: number } {
    const effects: { [key: string]: number } = {
      gdp_growth: 0,
      unemployment: 0,
      poverty_rate: 0
    };

    const countryTrades = tradeMatrix.filter(t => t.from === country || t.to === country);
    const avgTradeVolume = countryTrades.reduce((sum, t) => sum + t.tradeVolume, 0) / countryTrades.length;

    // High tariffs reduce trade but may protect domestic industry short-term
    if (tariffPolicy > 50) {
      effects.gdp_growth -= (tariffPolicy - 50) * 0.02 * (avgTradeVolume / 100);
      effects.unemployment += (tariffPolicy - 50) * 0.01;
    } else {
      // Low tariffs boost trade and efficiency
      effects.gdp_growth += (50 - tariffPolicy) * 0.015 * (avgTradeVolume / 100);
      effects.unemployment -= (50 - tariffPolicy) * 0.008;
    }

    return effects;
  }

  static simulateRegionalCooperation(
    cooperationLevel: number, // 0-100
    allCountries: { [key: string]: any }
  ): { [key: string]: { [key: string]: number } } {
    const cooperationEffects: { [key: string]: { [key: string]: number } } = {};

    Object.keys(allCountries).forEach(country => {
      cooperationEffects[country] = {};

      // High cooperation benefits
      if (cooperationLevel > 70) {
        cooperationEffects[country].gdp_growth = 0.3;
        cooperationEffects[country].infrastructure_investment = 0.5;
        cooperationEffects[country].trade_volume = 0.2;
      } else if (cooperationLevel < 40) {
        // Low cooperation penalties
        cooperationEffects[country].gdp_growth = -0.2;
        cooperationEffects[country].unemployment = 0.3;
      }
    });

    return cooperationEffects;
  }

  static generateRegionalEvents(year: number, cooperationIndex: number, history: any[] = []): any[] {
    // Overall chance of any event happening this year to reduce frequency
    if (Math.random() > 0.6) { // Only a 60% chance of an event check per year
      return [];
    }
    
    const eventPool = [
      // Natural Disasters
      { id: 'monsoon_floods', name: 'Severe Monsoon Floods', probability: 0.08, targets: ['Bangladesh', 'India', 'Pakistan'], description: 'Unusually heavy monsoon rains have caused widespread flooding, displacing thousands and damaging crops and infrastructure.', effects: { gdp_growth: -0.6, poverty_rate: 1.5, infrastructure_investment: -1.0 } },
      { id: 'cyclone_bay_of_bengal', name: 'Cyclone in Bay of Bengal', probability: 0.06, targets: ['Bangladesh', 'India', 'Sri Lanka'], description: 'A powerful cyclone makes landfall, devastating coastal communities and disrupting port activities.', effects: { gdp_growth: -0.8, population: -0.005, infrastructure_investment: -1.5 } },
      { id: 'drought', name: 'Severe Drought', probability: 0.05, targets: ['Pakistan', 'India', 'Afghanistan'], description: 'A prolonged drought has led to water shortages and crop failures, impacting food security.', effects: { gdp_growth: -0.5, agriculture_gdp_percent: -1.0, poverty_rate: 1.2 } },

      // Economic Events
      { id: 'global_recession', name: 'Global Economic Recession', probability: 0.07, region_wide: true, description: 'A global economic downturn reduces demand for exports and slows foreign investment across the region.', effects: { gdp_growth: -1.0, unemployment: 1.5 } },
      { id: 'oil_price_shock', name: 'Oil Price Shock', probability: 0.08, region_wide: true, description: 'A sudden surge in global oil prices increases import costs and fuels inflation.', effects: { gdp_growth: -0.4, co2_emissions: -0.1 } },
      { id: 'fdi_boom', name: 'Major Foreign Investment', probability: 0.05, targets: ['India', 'Bangladesh'], description: 'A major multinational corporation announces significant investment in the tech and manufacturing sectors, boosting employment and growth.', effects: { gdp_growth: 0.8, unemployment: -0.5, technology_spending: 0.5 }, unique: true },

      // Political/Social Events
      { id: 'regional_cooperation_summit', name: 'Successful Regional Summit', probability: 0.15, region_wide: true, description: 'A successful regional summit leads to new agreements on trade facilitation and cross-border projects.', effects: { trust: 10, connectivity: 0.5 } },
      { id: 'border_tensions', name: 'Border Tensions Flare Up', probability: 0.08, targets: ['India', 'Pakistan'], description: 'Renewed tensions along the border lead to trade disruptions and decreased political trust.', effects: { trust: -15, gdp_growth: -0.3 } },
      { id: 'health_breakthrough', name: 'Public Health Breakthrough', probability: 0.04, targets: ['India', 'Bangladesh', 'Sri Lanka'], description: 'A new vaccine program, shared between nations, dramatically reduces the incidence of a major disease.', effects: { life_expectancy: 0.5, health_expenditure: 0.2 }, unique: true },
      { id: 'himalayan_earthquake', name: 'Major Himalayan Earthquake', probability: 0.03, targets: ['Nepal', 'Bhutan', 'India'], description: 'A major earthquake has struck the Himalayan region, causing significant damage to infrastructure and requiring international aid.', effects: { gdp_growth: -1.2, infrastructure_investment: -2.5, poverty_rate: 2.0 }, unique: true },
    ];

    const occurredEventIds = new Set(history.map(e => e.id));
    const potentialEvents = eventPool.filter(event => !(event.unique && occurredEventIds.has(event.id)));

    // Shuffle potential events to make the selection random
    potentialEvents.sort(() => 0.5 - Math.random());

    for (const event of potentialEvents) {
      let eventProbability = event.probability;
      // Cooperation index can influence political events
      if (event.id === 'regional_cooperation_summit') {
        eventProbability *= (cooperationIndex / 50); // Higher cooperation makes successful summits more likely
      }
      if (event.id === 'border_tensions') {
        eventProbability *= ((100 - cooperationIndex) / 50); // Lower cooperation makes tensions more likely
      }

      if (Math.random() < eventProbability) {
        return [{ // Return immediately with the first event that triggers
          id: event.id,
          name: event.name,
          description: event.description,
          year: year,
          effects: event.effects,
          targetCountries: event.region_wide ? SOUTH_ASIAN_COUNTRIES.map(c => c.name) : event.targets,
        }];
      }
    }

    // If no specific event was triggered, there's a chance for a generic stability event
    if (year % 3 === 0) { // Every 3 years if nothing else happens
        return [{
            id: 'no_major_event',
            name: 'A Period of Stability',
            description: 'The region experiences a period of relative stability, allowing governments to focus on domestic policy.',
            year: year,
            effects: { gdp_growth: 0.1 }, // Small stability bonus
            targetCountries: SOUTH_ASIAN_COUNTRIES.map(c => c.name)
        }];
    }

    return []; // No event this year
  }

  static updateTradeMatrix(
    currentMatrix: TradeRelationship[],
    policyChanges: { [key: string]: { [key: string]: number } }
  ): TradeRelationship[] {
    return currentMatrix.map(trade => {
      const sourceChanges = policyChanges[trade.from] || {};
      const targetChanges = policyChanges[trade.to] || {};

      let newTradeVolume = trade.tradeVolume;
      let newTariffRate = trade.tariffRate;
      let newCooperation = trade.cooperation;

      // Trade policy effects
      if (sourceChanges.trade_openness) {
        const openness = sourceChanges.trade_openness / 100;
        newTradeVolume *= (1 + openness * 0.1);
        newTariffRate *= (1 - openness * 0.2);
      }

      // Infrastructure effects on trade
      if (sourceChanges.infrastructure_investment || targetChanges.infrastructure_investment) {
        const avgInfra = ((sourceChanges.infrastructure_investment || 0) + 
                         (targetChanges.infrastructure_investment || 0)) / 2;
        newTradeVolume *= (1 + (avgInfra - 5) * 0.02);
      }

      // Cooperation effects
      if (sourceChanges.cooperation_policy) {
        newCooperation = Math.max(0, Math.min(100, 
          newCooperation + sourceChanges.cooperation_policy
        ));
      }

      return {
        ...trade,
        tradeVolume: Math.max(0, newTradeVolume),
        tariffRate: Math.max(0, Math.min(50, newTariffRate)),
        cooperation: newCooperation
      };
    });
  }
}