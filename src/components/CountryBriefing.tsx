import React from 'react';
import { CountryStats } from '../types/GameTypes';
import { MapPin, TrendingUp, Users, BookOpen } from 'lucide-react';

interface CountryBriefingProps {
  initialStats: CountryStats;
}

const getDominantSector = (stats: CountryStats): string => {
  const sectors = {
    'Agriculture': stats.agriculture_gdp_percent || 0,
    'Manufacturing': stats.manufacturing_gdp_percent || 0,
    'Services': stats.services_gdp_percent || 0,
  };
  const dominantSector = Object.keys(sectors).reduce((a, b) => sectors[a] > sectors[b] ? a : b);
  return `${dominantSector} (contributing ${sectors[dominantSector].toFixed(1)}% to GDP)`;
};

const getEconomicOutlook = (gdp: number): string => {
  if (gdp > 5) return "a robust growth trajectory";
  if (gdp > 2.5) return "a moderate but steady economic expansion";
  return "facing significant economic headwinds";
};

const getSocialChallenge = (poverty: number, literacy: number): string => {
  if (poverty > 20 && literacy < 80) {
    return `high poverty (${poverty.toFixed(1)}%) and improving literacy (${literacy.toFixed(1)}%) are major social hurdles.`;
  }
  if (poverty > 20) {
    return `a high poverty rate of ${poverty.toFixed(1)}% is a primary concern.`;
  }
  if (literacy < 80) {
    return `improving the literacy rate of ${literacy.toFixed(1)}% is a key development goal.`;
  }
  return `the nation has made strides in social development, but challenges remain.`;
};

export const CountryBriefing: React.FC<CountryBriefingProps> = ({ initialStats }) => {
  if (!initialStats) {
    return <div>Loading briefing...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-7 h-7 mr-3 text-blue-700" />
        Country Briefing: {initialStats.country}
      </h2>
      <p className="text-gray-600 mb-6">This is your starting brief for the year {initialStats.year}. Use this information to guide your initial policy decisions.</p>
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-600" />Economic Overview</h3>
          <p className="text-gray-700">As the leader of {initialStats.country}, you begin your term facing {getEconomicOutlook(initialStats.gdp_growth)}. The economy is primarily driven by its <strong>{getDominantSector(initialStats)}</strong>. Your initial unemployment rate stands at <strong>{initialStats.unemployment.toFixed(1)}%</strong>, presenting a key challenge for job creation.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><Users className="w-5 h-5 mr-2 text-purple-600" />Social Landscape</h3>
          <p className="text-gray-700">On the social front, {getSocialChallenge(initialStats.poverty_rate, initialStats.literacy_rate)} The average life expectancy is <strong>{initialStats.life_expectancy.toFixed(1)} years</strong>, reflecting the current state of public health and living standards.</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center"><BookOpen className="w-5 h-5 mr-2 text-yellow-600" />Policy Starting Point</h3>
          <p className="text-gray-700">Your administration inherits a set of policies including an average tariff rate of <strong>{initialStats.tariff_rate?.toFixed(1) || 15.0}%</strong> on imports. Your decisions on trade and cooperation will define your relationships with your South Asian neighbors.</p>
        </div>
      </div>
    </div>
  );
};

