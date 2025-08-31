  // Load trade products data on mount
  
import React, { useState, useEffect } from 'react';
import { CountrySelector } from './components/CountrySelector';
import { PolicyDashboard } from './components/PolicyDashboard';
import { StatsDisplay } from './components/StatsDisplay';
import { RegionalDashboard } from './components/RegionalDashboard';
import { DetailedSpilloverDashboard } from './components/DetailedSpilloverDashboard';
import { ResultsDashboard } from './components/ResultsDashboard.tsx';
import { CountryBriefing } from './components/CountryBriefing.tsx';
import { EventModal } from './components/EventModal.tsx';
import { GameLoop } from './components/GameLoop';
import { FinalReport } from './components/FinalReport';
import { CountryStats, PolicyDecision, RegionalEvent, MultiCountryGameState } from './types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from './data/CountryList';
import { 
  loadAllExcelIndicators, 
  getIndicatorValue, 
  getLatestIndicatorValue,
  getCountryStats,
  AllIndicators 
} from './data/ExcelDataLoader';
import { loadTradeProductsData, getBilateralTradeProducts } from './data/TradeProductsLoader';
import { exportToCsv } from './utils/export.ts';
import { INITIAL_REGIONAL_MATRIX, RegionalEconomySimulator } from './data/RegionalMatrix';
import { createDefaultPolicyDecisions } from './data/PolicyDecisions';
import { PolicySimulator } from './utils/PolicyModels';
import { Globe, BarChart3, Settings, MapPin, CheckSquare } from 'lucide-react';

function App() {
  // Game state
  const [gameState, setGameState] = useState<MultiCountryGameState>({
    countries: {},
    playerCountry: '',
    regionalMatrix: INITIAL_REGIONAL_MATRIX,
    spilloverEffects: [],
    detailedSpillovers: [],
    year: 2023,
    gameActive: false
  });
  const [allIndicators, setAllIndicators] = useState<AllIndicators | null>(null);
  const [tradeDataLoaded, setTradeDataLoaded] = useState(false);
  const [newEvents, setNewEvents] = useState<RegionalEvent[]>([]);

  const [decisions, setDecisions] = useState<PolicyDecision[]>(createDefaultPolicyDecisions());
  const [historicalStats, setHistoricalStats] = useState<CountryStats[]>([]);
  const [gamePhase, setGamePhase] = useState<'select' | 'play' | 'report'>('select');
  const [finalScore, setFinalScore] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'briefing' | 'stats' | 'policies' | 'results' | 'regional' | 'spillovers'>('briefing');
  const [allCountriesDecisions, setAllCountriesDecisions] = useState<{ [key: string]: PolicyDecision[] }>({});

  const startYear = 2023;
  const endYear = 2043;
  const isLastYear = gameState.year >= endYear;

  // Initialize AI countries with default policies
  useEffect(() => {
    if (gameState.playerCountry) {
      const aiDecisions: { [key: string]: PolicyDecision[] } = {};
      
      SOUTH_ASIAN_COUNTRIES.forEach(country => {
        if (country.name !== gameState.playerCountry) {
          // Create varied AI policies based on country characteristics
          const baseDecisions = createDefaultPolicyDecisions();
          const countryVariations = getCountryPolicyVariations(country.name);
          
          aiDecisions[country.name] = baseDecisions.map(decision => ({
            ...decision,
            value: decision.value + (countryVariations[decision.id] || 0)
          }));
        }
      });
      
      aiDecisions[gameState.playerCountry] = decisions;
      setAllCountriesDecisions(aiDecisions);
    }
  }, [gameState.playerCountry, decisions]);

  const getCountryPolicyVariations = (countryName: string): { [key: string]: number } => {
    // Add realistic policy variations for each country
    const variations: { [key: string]: { [key: string]: number } } = {
      'India': { education: 1.0, infrastructure: 2.0, trade: 10, cooperation: 5 },
      'Pakistan': { health: 0.5, infrastructure: -1.0, tariff: 5, cooperation: -10 },
      'Bangladesh': { education: -0.5, infrastructure: 3.0, trade: 15, environment: -0.5 },
      'Sri Lanka': { health: 1.0, education: 0.5, tariff: -3, cooperation: 10 },
      'Nepal': { infrastructure: -2.0, environment: 1.0, cooperation: 15 },
      'Bhutan': { environment: 3.0, health: 2.0, cooperation: 20 },
      'Maldives': { environment: 2.0, trade: 20, infrastructure: -1.0 },
      'Afghanistan': { health: -1.0, education: -2.0, cooperation: -20, tariff: 10 }
    };
    
    return variations[countryName] || {};
  };

  // Load all Excel data on mount
  useEffect(() => {
    Promise.all([
      loadAllExcelIndicators().then(setAllIndicators),
      loadTradeProductsData().then(() => setTradeDataLoaded(true))
    ]);
  }, []);

  // Block UI until Excel data is loaded
  if (!allIndicators || !tradeDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Regional Data...</h2>
          <p className="text-gray-500">Fetching economic indicators and trade data. Please wait.</p>
        </div>
      </div>
    );
  }

  const buildInitialStats = (country: string, year: number): CountryStats => {
    // Use Excel data with proper mapping and fallbacks
    const gdpValue = getIndicatorValue(allIndicators, 'GDP', country, year) || 
                     getLatestIndicatorValue(allIndicators, 'GDP', country).value || 3.5;
    const unemploymentValue = getIndicatorValue(allIndicators, 'Unemployment', country, year) || 
                              getLatestIndicatorValue(allIndicators, 'Unemployment', country).value || 5.0;
    const literacyValue = getIndicatorValue(allIndicators, 'Literacy', country, year) || 
                          getLatestIndicatorValue(allIndicators, 'Literacy', country).value || 70.0;
    const healthValue = getIndicatorValue(allIndicators, 'Health', country, year) || 
                        getLatestIndicatorValue(allIndicators, 'Health', country).value || 65.0;
    const povertyValue = getIndicatorValue(allIndicators, 'Poverty', country, year) || 
                         getLatestIndicatorValue(allIndicators, 'Poverty', country).value || 20.0;
    const co2Value = getIndicatorValue(allIndicators, 'CO2_Emissions', country, year) || 
                     getLatestIndicatorValue(allIndicators, 'CO2_Emissions', country).value || 2.0;
    const populationValue = getIndicatorValue(allIndicators, 'Population', country, year) || 
                            getLatestIndicatorValue(allIndicators, 'Population', country).value || 50000000;
    const mortalityValue = getIndicatorValue(allIndicators, 'MortalityRate', country, year) || 
                           getLatestIndicatorValue(allIndicators, 'MortalityRate', country).value || 30.0;
    const educationValue = getIndicatorValue(allIndicators, 'Education', country, year) || 
                           getLatestIndicatorValue(allIndicators, 'Education', country).value || 4.0;
    const infrastructureValue = getIndicatorValue(allIndicators, 'Infrastructure', country, year) || 
                                getLatestIndicatorValue(allIndicators, 'Infrastructure', country).value || 5.0;

    // Load new sector contribution indicators
    const agricultureGdpPercent = getIndicatorValue(allIndicators, 'Agriculture', country, year) ||
                                  getLatestIndicatorValue(allIndicators, 'Agriculture', country).value || 15.0; // Default 15%
    const manufacturingGdpPercent = getIndicatorValue(allIndicators, 'Manufacturing', country, year) ||
                                    getLatestIndicatorValue(allIndicators, 'Manufacturing', country).value || 20.0; // Default 20%
    const servicesGdpPercent = getIndicatorValue(allIndicators, 'Services', country, year) ||
                               getLatestIndicatorValue(allIndicators, 'Services', country).value || 50.0; // Default 50%

    // Get default policy values for spending categories not in Excel
    const defaultPolicies = createDefaultPolicyDecisions();
    const getPolicyValue = (id: string) => defaultPolicies.find(p => p.id === id)?.value || 0;

    return {
      country,
      year,
      gdp_growth: gdpValue,
      unemployment: unemploymentValue,
      literacy_rate: literacyValue,
      life_expectancy: healthValue,
      poverty_rate: povertyValue,
      co2_emissions: co2Value,
      population: populationValue,
      infant_mortality: mortalityValue,
      health_expenditure: healthValue * 0.8, // Derive from health indicator
      education_spending: educationValue,
      infrastructure_investment: infrastructureValue,
      // Add new spending fields to track policy changes for spillovers
      agriculture_spending: getPolicyValue('agriculture'),
      manufacturing_spending: getPolicyValue('manufacturing'),
      services_spending: getPolicyValue('services'),
      energy_spending: getPolicyValue('energy'),
      technology_spending: getPolicyValue('technology'),
      tourism_spending: getPolicyValue('tourism'),
      environment_spending: getPolicyValue('environment'),
      trade_liberalization: getPolicyValue('trade'),
      tariff_rate: getPolicyValue('tariff'),
      // Add new GDP contribution fields
      agriculture_gdp_percent: agricultureGdpPercent,
      manufacturing_gdp_percent: manufacturingGdpPercent,
      services_gdp_percent: servicesGdpPercent,
    };
  };

  const handleCountrySelect = (country: string) => {
    const initialStats = buildInitialStats(country, startYear);
    const countries: { [key: string]: CountryStats } = {};
    SOUTH_ASIAN_COUNTRIES.forEach(c => {
      countries[c.name] = buildInitialStats(c.name, startYear);
    });
    setGameState({
      countries,
      playerCountry: country,
      regionalMatrix: INITIAL_REGIONAL_MATRIX,
      spilloverEffects: [],
      detailedSpillovers: [],
      year: startYear,
      gameActive: true
    });
    setHistoricalStats([initialStats]);
    setGamePhase('play');
    setActiveTab('briefing');
  };

  const handleDecisionChange = (id: string, value: number) => {
    setDecisions(prev => prev.map(d => 
      d.id === id ? { ...d, value } : d
    ));
  };

  const simulateAIDecisions = () => {
    const newAIDecisions: { [key: string]: PolicyDecision[] } = {};
    
    SOUTH_ASIAN_COUNTRIES.forEach(country => {
      if (country.name !== gameState.playerCountry) {
        const currentDecisions = allCountriesDecisions[country.name] || createDefaultPolicyDecisions();
        const countryStats = gameState.countries[country.name];
        
        // AI makes small adjustments based on current performance
        const adjustedDecisions = currentDecisions.map(decision => {
          let adjustment = 0;
          
          // Simple AI logic - adjust policies based on performance
          if (countryStats.gdp_growth < 2) {
            if (decision.id === 'infrastructure') adjustment = 0.5;
            if (decision.id === 'trade') adjustment = 5;
          }
          
          if (countryStats.unemployment > 8) {
            if (decision.id === 'education') adjustment = 0.3;
            if (decision.id === 'infrastructure') adjustment = 0.8;
          }
          
          if (countryStats.poverty_rate > 25) {
            if (decision.id === 'health') adjustment = 0.4;
            if (decision.id === 'education') adjustment = 0.6;
          }
          
          // Add some randomness
          adjustment += (Math.random() - 0.5) * 0.2;
          
          const newValue = Math.max(decision.min, Math.min(decision.max, decision.value + adjustment));
          
          return { ...decision, value: newValue };
        });
        
        newAIDecisions[country.name] = adjustedDecisions;
      } else {
        newAIDecisions[country.name] = decisions;
      }
    });
    
    setAllCountriesDecisions(newAIDecisions);
    return newAIDecisions;
  };

  const handleNextYear = () => {
    if (!gameState.gameActive) return;

    // Simulate AI decisions for all countries
    const updatedDecisions = simulateAIDecisions();
    
    // Calculate spillover effects
    const spilloversByCountry = PolicySimulator.simulateRegionalEffects(
      gameState.countries,
      updatedDecisions,
      gameState.regionalMatrix.tradeMatrix
    );

    // Calculate detailed spillovers with real trade data
    const playerDecisionsArr = updatedDecisions[gameState.playerCountry] || [];
    const playerDecisionsObj = Array.isArray(playerDecisionsArr)
      ? playerDecisionsArr.reduce((acc, d) => { acc[d.id] = d.value; return acc; }, {} as { [key: string]: number })
      : playerDecisionsArr;
    const detailedSpillovers = RegionalEconomySimulator.calculateDetailedSpillovers(
      gameState.playerCountry,
      playerDecisionsObj,
      gameState.regionalMatrix.tradeMatrix,
      gameState.countries[gameState.playerCountry] // Pass the source country's current (pre-update) stats
    );

    // Update all countries
    const newCountries: { [key: string]: CountryStats } = {};
    
    Object.keys(gameState.countries).forEach(countryName => {
      const currentStats = gameState.countries[countryName];
      const countryDecisions = updatedDecisions[countryName] || [];
      const spillovers = spilloversByCountry[countryName] || [];

      // Aggregate effects from events targeting this country
      const countryEventEffects: Record<string, number> = {};
      regionalEvents.forEach(event => {
        if (event.targetCountries?.includes(countryName)) {
          Object.keys(event.effects).forEach(key => {
            countryEventEffects[key] = (countryEventEffects[key] || 0) + event.effects[key];
          });
        }
      });

      // Apply policy effects with spillovers and events
      const newStats = PolicySimulator.applyPolicyEffects(
        currentStats,
        countryDecisions,
        spillovers,
        countryEventEffects
      );
      
      newStats.year = gameState.year + 1;
      newCountries[countryName] = newStats;
    });

    // Update trade matrix based on policies
    const policyChanges: { [key: string]: { [key: string]: number } } = {};
    Object.entries(updatedDecisions).forEach(([country, decisions]) => {
      policyChanges[country] = {};
      decisions.forEach(decision => {
        switch (decision.id) {
          case 'trade':
            policyChanges[country].trade_openness = decision.value;
            break;
          case 'infrastructure':
            policyChanges[country].infrastructure_investment = decision.value;
            break;
          case 'cooperation':
            policyChanges[country].cooperation_policy = decision.value - 50;
            break;
        }
      });
    });

    const updatedTradeMatrix = RegionalEconomySimulator.updateTradeMatrix(
      gameState.regionalMatrix.tradeMatrix,
      policyChanges
    );

    // Set new events to be displayed in the modal
    setNewEvents(regionalEvents);

    setGameState(prev => ({
      ...prev,
      countries: newCountries,
      year: prev.year + 1,
      spilloverEffects: Object.values(spilloversByCountry).flat(),
      detailedSpillovers: detailedSpillovers,
      regionalMatrix: {
        ...prev.regionalMatrix,
        tradeMatrix: updatedTradeMatrix,
        cooperationIndex: avgCooperation,
        regionalEvents: [...prev.regionalMatrix.regionalEvents, ...regionalEvents]
      }
    }));

    // Update historical stats for player country
    if (gameState.playerCountry && newCountries[gameState.playerCountry]) {
      setHistoricalStats(prev => [...prev, newCountries[gameState.playerCountry]]);
    }
  };

  const handleFinishGame = () => {
    if (!gameState.playerCountry) return;
    
    const finalStats = gameState.countries[gameState.playerCountry];
    // Use ExcelDataLoader to get initialStats for the selected country
    const initialStats = buildInitialStats(gameState.playerCountry, startYear);
    const score = PolicySimulator.calculateScore(finalStats, initialStats);
    exportToCsv(historicalStats, gameState.playerCountry);
    
    setFinalScore(score);
    setGamePhase('report');
  };

  const handleRestart = () => {
    // Rebuild countries object for restart
    const countries: { [key: string]: CountryStats } = {};
    SOUTH_ASIAN_COUNTRIES.forEach(c => {
      countries[c.name] = buildInitialStats(c.name, startYear);
    });
    setGameState({
      countries,
      playerCountry: '',
      regionalMatrix: INITIAL_REGIONAL_MATRIX,
      spilloverEffects: [],
      detailedSpillovers: [],
      year: 2023,
      gameActive: false
    });
    setDecisions(createDefaultPolicyDecisions());
    setHistoricalStats([]);
    setGamePhase('select');
    setFinalScore(0);    
    setActiveTab('briefing');
    setAllCountriesDecisions({});
  };

  if (gamePhase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              South Asia Policy Simulation Game
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Lead a South Asian nation through 20 years of policy decisions. Your choices will 
              affect not only your country but the entire region through trade, cooperation, and spillover effects.
            </p>
          </div>
          <div className="mb-12 bg-white/60 p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">How to Play</h2>
            <ol className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 shadow">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Understand Your Goal</h3>
                  <p>Your objective is to analyze regional trade dynamics. Use the simulation to test different policy approaches (e.g., multilateralism vs. bilateralism) and use the data to support your final essay.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 shadow">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Use the Policy Levers</h3>
                  <p>In the "Policy Dashboard", you'll find sliders that represent real-world trade barriers. Experiment with them to see their impact on your country and the region.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 shadow">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Analyze the Results</h3>
                  <p>After clicking "Next Year", check the "Results & KPIs" and "Spillover Analysis" tabs. Pay attention to not just your own country's stats, but the ripple effects your decisions have on your neighbors.</p>
                </div>
              </li>
            </ol>
          </div>
          <CountrySelector
            selectedCountry={gameState.playerCountry}
            onSelectCountry={handleCountrySelect}
          />
        </div>
      </div>
    );
  }

  if (gamePhase === 'report') {
    return (
      <FinalReport
        allFinalStats={gameState.countries}
        finalStats={gameState.countries[gameState.playerCountry]}
        initialStats={buildInitialStats(gameState.playerCountry, startYear)}
        selectedCountry={gameState.playerCountry}
        finalScore={finalScore}
        allIndicators={allIndicators}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      {/* Event Modal */}
      <EventModal events={newEvents} onClose={() => setNewEvents([])} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            South Asia Policy Simulation
          </h1>
          <p className="text-gray-600">
            Leading {gameState.playerCountry} • Year {gameState.year} • Regional Cooperation: {gameState.regionalMatrix.cooperationIndex.toFixed(0)}/100
          </p>
        </div>

        {/* Game Controls */}
        <div className="mb-8">
          <GameLoop
            year={gameState.year}
            startYear={startYear}
            endYear={endYear}
            gameActive={gameState.gameActive}
            onNextYear={handleNextYear}
            onRestart={handleRestart}
            onFinish={handleFinishGame}
            isLastYear={isLastYear}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('briefing')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'briefing'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Country Briefing
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Country Stats
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'policies'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Policy Dashboard
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Results & KPIs
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'regional'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Regional Matrix
            </button>
            <button
              onClick={() => setActiveTab('spillovers')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === 'spillovers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Spillover Analysis
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'briefing' && <CountryBriefing initialStats={historicalStats[0]} />}
          {activeTab === 'stats' && (
            <StatsDisplay
              currentStats={gameState.countries[gameState.playerCountry]}
              historicalStats={historicalStats}
              selectedCountry={gameState.playerCountry}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyDashboard
              decisions={decisions}
              onDecisionChange={handleDecisionChange}
              year={gameState.year}
              country={gameState.playerCountry}
            />
          )}

          {activeTab === 'results' && (
            <ResultsDashboard
              currentStats={gameState.countries[gameState.playerCountry]}
              initialStats={historicalStats[0]}
            />
          )}

          {activeTab === 'regional' && (
            <RegionalDashboard
              allCountries={gameState.countries}
              playerCountry={gameState.playerCountry}
              tradeMatrix={gameState.regionalMatrix.tradeMatrix}
              spilloverEffects={gameState.spilloverEffects}
              cooperationIndex={gameState.regionalMatrix.cooperationIndex}
            />
          )}

          {activeTab === 'spillovers' && (
            <DetailedSpilloverDashboard
              spilloverEffects={gameState.detailedSpillovers || []}
              playerCountry={gameState.playerCountry}
              currentYear={gameState.year}
            />
          )}
        </div>

        {/* Spillover Effects Alert */}
        {gameState.spilloverEffects.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              🌊 Regional Spillover Effects Active
            </h4>
            <p className="text-sm text-yellow-700 mb-2">
              Your policies are creating {gameState.spilloverEffects.length} spillover effects across the region:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gameState.spilloverEffects.slice(0, 4).map((effect, idx) => (
                <div key={idx} className="text-xs text-yellow-600">
                  • {effect.description} ({effect.effect > 0 ? '+' : ''}{effect.effect.toFixed(2)})
                </div>
              ))}
            </div>
            {gameState.spilloverEffects.length > 4 && (
              <p className="text-xs text-yellow-600 mt-1">
                +{gameState.spilloverEffects.length - 4} more effects...
              </p>
            )}
          </div>
        )}

        {/* Recent Regional Events */}
        {gameState.regionalMatrix.regionalEvents.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              📰 Recent Regional Events
            </h4>
            <div className="space-y-2">
              {gameState.regionalMatrix.regionalEvents.slice(-3).map((event, idx) => (
                <div key={idx} className="text-sm text-blue-700">
                  <strong>{event.name}</strong> ({event.year}): {event.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;