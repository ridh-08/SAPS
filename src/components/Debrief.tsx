import React from 'react';
import { CountryStats, PolicyDecision } from '../types/GameTypes';
import { BookText, Download } from 'lucide-react';

interface DebriefProps {
  historicalStats: CountryStats[];
  // We will need the decision history here in the future
  // decisionHistory: { year: number, decisions: PolicyDecision[] }[];
}

const exportToCsv = (historicalStats: CountryStats[]) => {
  const headers = [
    'Year', 'Country', 'GDP_Growth', 'Unemployment', 'Literacy_Rate', 
    'Life_Expectancy', 'Poverty_Rate', 'CO2_Emissions', 'Tariff_Revenue'
  ];
  
  const rows = historicalStats.map(stats => [
    stats.year,
    stats.country,
    stats.gdp_growth.toFixed(2),
    stats.unemployment.toFixed(2),
    stats.literacy_rate.toFixed(2),
    stats.life_expectancy.toFixed(2),
    stats.poverty_rate.toFixed(2),
    stats.co2_emissions.toFixed(2),
    (stats.tariffRevenue || 0).toFixed(2)
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "policy_simulation_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const Debrief: React.FC<DebriefProps> = ({ historicalStats }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BookText className="w-7 h-7 mr-3 text-blue-700" />
          Debrief & Export
        </h2>
        <button
          onClick={() => exportToCsv(historicalStats)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data for Report (CSV)
        </button>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold">Guiding Questions for Your Essay/Memo</h3>
        <ul>
          <li>Based on your simulation, did a strategy of reducing tariffs and NTBs (a "SAFTA-style" approach) lead to the best outcomes for your country? What were the costs?</li>
          <li>What was the impact of focusing on "Connectivity" and "Trust & Cooperation"? Were these more or less effective than tariff reductions?</li>
          <li>Consider the perspective of a smaller economy in the region. How did India's policy choices affect your outcomes?</li>
          <li>What does your simulation run suggest is the most viable path forward for South Asian economic integration? Is it a comprehensive free trade agreement, or are targeted bilateral or sectoral agreements a better alternative?</li>
        </ul>
        <p className="text-sm text-gray-600 mt-4">Use the exported CSV data to provide quantitative evidence for your arguments. Referencing specific policy choices and their resulting KPI changes will strengthen your analysis.</p>
      </div>
    </div>
  );
};

