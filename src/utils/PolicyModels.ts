import { CountryStats, PolicyDecision } from '../types/GameTypes';
import { RegionalEconomySimulator } from '../data/RegionalMatrix';
import { getMainTradeProducts } from '../data/TradeProductsLoader';

export class PolicySimulator {
  static applyPolicyEffects(
    currentStats: CountryStats,
    decisions: PolicyDecision[],
    spilloverEffects: import('../types/GameTypes').PolicySpillover[] = [],
    eventEffects: Record<string, number> = {}
  ): CountryStats {
    const newStats = { ...currentStats };
    
    // Get new, realistic decision values
    const tariffPolicy = decisions.find(d => d.id === 'tariffs')?.value || 15;
    const ntbPolicy = decisions.find(d => d.id === 'ntbs')?.value || 60;
    const connectivityPolicy = decisions.find(d => d.id === 'connectivity')?.value || 5.0;
    const trustPolicy = decisions.find(d => d.id === 'trust')?.value || 50;

    const agricultureSpending = decisions.find(d => d.id === 'agriculture')?.value || 3.5;
    const manufacturingSpending = decisions.find(d => d.id === 'manufacturing')?.value || 2.0;
    const servicesSpending = decisions.find(d => d.id === 'services')?.value || 1.5;
    const energySpending = decisions.find(d => d.id === 'energy')?.value || 4.0;
    const technologySpending = decisions.find(d => d.id === 'technology')?.value || 1.0;

    // Education effects
    const educationChange = (currentStats.education_spending || 4.0) - 4.0; // Assuming education is now a fixed stat for simplicity
    newStats.literacy_rate += educationChange * 0.25; // Slower increase in literacy
    newStats.gdp_growth += educationChange * 0.03; // Education is a very long-term investment

    // Health effects
    const healthChange = (currentStats.health_expenditure || 3.0) - 3.0; // Assuming health is now a fixed stat
    newStats.life_expectancy += healthChange * 0.08; // Slower, more realistic increase
    newStats.infant_mortality -= healthChange * 0.3; // Drastic changes toned down
    newStats.gdp_growth += healthChange * 0.02; // Health has a slower, long-term impact on GDP

    // Infrastructure effects
    const infraChange = (connectivityPolicy - (currentStats.infrastructure_investment || 5.0));
    newStats.gdp_growth += infraChange * 0.05; // Strong but not instant effect
    newStats.unemployment -= infraChange * 0.1; // Job creation from construction/connectivity
    newStats.poverty_rate -= infraChange * 0.15; // Better infrastructure helps reduce poverty
    newStats.infrastructure_investment = connectivityPolicy;

    // Industry-specific effects
    const agricultureChange = agricultureSpending - (currentStats.agriculture_spending || 3.5);
    const agriGdpShare = (currentStats.agriculture_gdp_percent || 15.0) / 100;
    newStats.gdp_growth += agricultureChange * 0.2 * agriGdpShare; // Scaled by sector's importance
    newStats.poverty_rate -= agricultureChange * 0.5 * agriGdpShare; // Agriculture is key for rural poverty
    
    const manufacturingChange = manufacturingSpending - (currentStats.manufacturing_spending || 2.0);
    const manuGdpShare = (currentStats.manufacturing_gdp_percent || 20.0) / 100;
    newStats.gdp_growth += manufacturingChange * 0.3 * manuGdpShare; // Strong multiplier for manufacturing
    newStats.unemployment -= manufacturingChange * 0.4 * manuGdpShare;
    
    const servicesChange = servicesSpending - (currentStats.services_spending || 1.5);
    const servGdpShare = (currentStats.services_gdp_percent || 50.0) / 100;
    newStats.gdp_growth += servicesChange * 0.2 * servGdpShare;
    newStats.unemployment -= servicesChange * 0.25 * servGdpShare;
    
    const energyChange = energySpending - (currentStats.energy_spending || 4.0);
    newStats.gdp_growth += energyChange * 0.1;
    newStats.co2_emissions += energyChange * 0.05; // More energy = more emissions initially
    
    const technologyChange = technologySpending - (currentStats.technology_spending || 1.0);
    newStats.gdp_growth += technologyChange * 0.1; // High tech multiplier
    newStats.literacy_rate += technologyChange * 0.1; // Tech requires skills
    
    // --- NEW TRADE MODEL ---
    // Tariff effects (protectionism vs free trade)
    const tariffEffect = (tariffPolicy - (currentStats.tariff_rate || 15)) / 100;
    newStats.gdp_growth -= tariffEffect * 0.12; // High tariffs reduce efficiency
    newStats.unemployment += tariffEffect * 0.09; // But may protect some jobs short-term
    newStats.poverty_rate += tariffEffect * 0.18; // Higher prices from tariffs hurt the poor

    // NTB effects
    const ntbEffect = (ntbPolicy - 60) / 100; // Baseline of 60
    newStats.gdp_growth -= ntbEffect * 0.08; // NTBs are a drag on growth

    // Regional cooperation effects
    const cooperationEffect = (trustPolicy - 50) / 100; // baseline 50%
    newStats.gdp_growth += cooperationEffect * 0.06; // Cooperation boosts trade and investment
    newStats.infrastructure_investment += cooperationEffect * 0.3; // Shared projects

    // --- NEW KPI CALCULATIONS ---
    // Proxy for trade volume, affected by all trade policies
    const tradeVolumeProxy = 100 - (tariffPolicy * 0.5) - (ntbPolicy * 0.3) + (connectivityPolicy * 2) + (trustPolicy * 0.2);
    // Tariff Revenue = Rate * Base. Base is affected by trade volume.
    newStats.tariffRevenue = (tariffPolicy / 100) * (tradeVolumeProxy * 0.5);
    // Consumer Welfare is a proxy. Lower tariffs/NTBs are better for consumers.
    spilloverEffects.forEach(spillover => {
      switch (spillover.policyType) {
        case 'trade_gdp':
          newStats.gdp_growth += spillover.effect;
          break;
        case 'infrastructure':
          newStats.infrastructure_investment += spillover.effect;
          newStats.gdp_growth += spillover.effect * 0.1;
          break;
        case 'environment':
          newStats.co2_emissions += spillover.effect;
          break;
        case 'manufacturing':
          newStats.gdp_growth += spillover.effect * 0.1;
          newStats.unemployment -= spillover.effect * 0.05;
          break;
        case 'technology':
          newStats.gdp_growth += spillover.effect * 0.15;
          newStats.literacy_rate += spillover.effect * 0.3;
          break;
        case 'energy':
          newStats.gdp_growth += spillover.effect * 0.08;
          break;
      }
    });

    // Apply direct event effects
    Object.keys(eventEffects).forEach(key => {
      const statsRecord = newStats as unknown as Record<string, number>;
      if (key in statsRecord && typeof statsRecord[key] === 'number') {
        statsRecord[key] += eventEffects[key];
      }
    });

    // Add some realistic year-over-year variation
    const randomVariation = (Math.random() - 0.5) * 0.5; // ±0.25% random variation
    newStats.gdp_growth += randomVariation;
    // Apply bounds
    newStats.literacy_rate = Math.max(0, Math.min(100, newStats.literacy_rate));
    newStats.unemployment = Math.max(0.5, Math.min(50, newStats.unemployment));
    newStats.poverty_rate = Math.max(0, Math.min(90, newStats.poverty_rate));
    newStats.life_expectancy = Math.max(45, Math.min(90, newStats.life_expectancy));
    newStats.gdp_growth = Math.max(-10, Math.min(15, newStats.gdp_growth));
    newStats.co2_emissions = Math.max(0, newStats.co2_emissions);
    newStats.infant_mortality = Math.max(1, Math.min(150, newStats.infant_mortality));
    newStats.population = Math.max(100000, newStats.population); // Minimum population

    // Persist all policy decisions to stats for next year's delta calculation
    newStats.agriculture_spending = agricultureSpending;
    newStats.manufacturing_spending = manufacturingSpending;
    newStats.services_spending = servicesSpending;
    newStats.energy_spending = energySpending;
    newStats.technology_spending = technologySpending;    
    // Persist new policy decisions
    newStats.tariff_rate = tariffPolicy;
    // Not saving NTBs, Connectivity, Trust to stats as they are abstract indices, not spending %

    return newStats;
  }

  static simulateRegionalEffects(
    allCountries: { [key: string]: CountryStats },
    allDecisions: { [key: string]: PolicyDecision[] },
    tradeMatrix: import('../types/GameTypes').TradeRelationship[]
  ): { [key: string]: import('../types/GameTypes').PolicySpillover[] } {
    const spilloversByCountry: { [key: string]: import('../types/GameTypes').PolicySpillover[] } = {};

    Object.keys(allCountries).forEach(sourceCountry => {
      const decisions = allDecisions[sourceCountry] || [];
      const policyChanges: { [key: string]: number } = {};

      // Extract policy changes
      decisions.forEach(decision => {
        switch (decision.id) {
          case 'education':
            policyChanges.education = decision.value;
            break;
          case 'health':
            policyChanges.health = decision.value;
            break;
          case 'infrastructure':
            policyChanges.infrastructure = decision.value;
            break;
          case 'environment':
            policyChanges.environment = decision.value;
            break;
          case 'agriculture':
            policyChanges.agriculture = decision.value;
            break;
          case 'manufacturing':
            policyChanges.manufacturing = decision.value;
            break;
          case 'services':
            policyChanges.services = decision.value;
            break;
          case 'energy':
            policyChanges.energy = decision.value;
            break;
          case 'technology':
            policyChanges.technology = decision.value;
            break;
          case 'tourism':
            policyChanges.tourism = decision.value;
            break;
          case 'trade':
            policyChanges.trade = decision.value;
            break;
          case 'tariff':
            policyChanges.tariff = decision.value;
            break;
          case 'cooperation':
            policyChanges.cooperation = decision.value;
            break;
        }
      });

      // Calculate spillovers to other countries
      const spillovers = RegionalEconomySimulator.calculateTradeSpillovers(
        sourceCountry,
        policyChanges,
        tradeMatrix
      );

      spillovers.forEach(spillover => {
        if (!spilloversByCountry[spillover.targetCountry]) {
          spilloversByCountry[spillover.targetCountry] = [];
        }
        spilloversByCountry[spillover.targetCountry].push(spillover);
      });
    });

    return spilloversByCountry;
  }

  static calculateScore(finalStats: CountryStats, initialStats: CountryStats): number {
    // More comprehensive scoring system
    const improvements = {
      gdp: (finalStats.gdp_growth - initialStats.gdp_growth) * 15,
      literacy: (finalStats.literacy_rate - initialStats.literacy_rate) * 3,
      life_exp: (finalStats.life_expectancy - initialStats.life_expectancy) * 8,
      unemployment: (initialStats.unemployment - finalStats.unemployment) * 5,
      poverty: (initialStats.poverty_rate - finalStats.poverty_rate) * 4,
      emissions: (initialStats.co2_emissions - finalStats.co2_emissions) * 15,
      infant_mort: (initialStats.infant_mortality - finalStats.infant_mortality) * 2
    };

    // Calculate weighted score
    const totalScore = Object.values(improvements).reduce((sum, val) => sum + val, 0);
    
    // Bonus for balanced development (no single indicator declining too much)
    const balanceBonus = Object.values(improvements).every(val => val > -50) ? 100 : 0;
    
    // Penalty for extreme negative outcomes
    const extremePenalty = Object.values(improvements).some(val => val < -100) ? -200 : 0;
    
    return Math.max(0, Math.min(1000, totalScore + 400 + balanceBonus + extremePenalty)); // Base score of 400
  }
}