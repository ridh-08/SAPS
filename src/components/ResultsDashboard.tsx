import React from 'react';
import { CountryStats } from '../types/GameTypes';
import { ArrowUp, ArrowDown, Minus, HelpCircle } from 'lucide-react';

interface ResultsDashboardProps {
  currentStats: CountryStats;
  initialStats: CountryStats;
}

const KPICard: React.FC<{ title: string; value: string; change: number; tooltip: string; isPositive: boolean }> = ({ title, value, change, tooltip, isPositive }) => {
  const changeColor = change === 0 ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';
  const ChangeIcon = change === 0 ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm relative group">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-700">{title}</h4>
        <HelpCircle className="w-4 h-4 text-gray-400" />
      </div>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      <div className={`flex items-center text-sm mt-1 ${changeColor}`}>
        <ChangeIcon className="w-4 h-4 mr-1" />
        <span>{change.toFixed(2)}% since start</span>
      </div>
      <div className="absolute bottom-full mb-2 w-64 p-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {tooltip}
      </div>
    </div>
  );
};

const ComparisonRow: React.FC<{ label: string; initial: number; current: number; unit: string; higherIsBetter: boolean }> = ({ label, initial, current, unit, higherIsBetter }) => {
  const change = current - initial;
  const isPositive = higherIsBetter ? change >= 0 : change < 0;
  const changeColor = change === 0 ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';
  const ChangeIcon = change === 0 ? Minus : isPositive ? ArrowUp : ArrowDown;

  return (
    <tr className="border-b border-gray-200">
      <td className="py-3 px-4 font-medium text-gray-700">{label}</td>
      <td className="py-3 px-4 text-gray-600">{initial.toFixed(2)}{unit}</td>
      <td className="py-3 px-4 text-gray-800 font-semibold">{current.toFixed(2)}{unit}</td>
      <td className={`py-3 px-4 font-semibold flex items-center ${changeColor}`}>
        <ChangeIcon className="w-4 h-4 mr-1" />
        {change.toFixed(2)}{unit}
      </td>
    </tr>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ currentStats, initialStats }) => {
  if (!currentStats || !initialStats) {
    return <div>Loading results...</div>;
  }

  const calculateChange = (current: number, initial: number) => {
    if (initial === 0) return current > 0 ? 100 : 0;
    return ((current - initial) / Math.abs(initial)) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Results & KPIs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="GDP Growth"
          value={`${currentStats.gdp_growth.toFixed(2)}%`}
          change={calculateChange(currentStats.gdp_growth, initialStats.gdp_growth)}
          isPositive={currentStats.gdp_growth >= initialStats.gdp_growth}
          tooltip="Measures economic growth. Affected by all policies, especially Connectivity and Trade."
        />
        <KPICard
          title="Tariff Revenue"
          value={`$${(currentStats.tariffRevenue || 0).toFixed(2)}B`}
          change={calculateChange(currentStats.tariffRevenue || 0, initialStats.tariffRevenue || 0)}
          isPositive={(currentStats.tariffRevenue || 0) >= (initialStats.tariffRevenue || 0)}
          tooltip="Government income from taxes on imports. Increases with higher tariffs but may decrease if trade volume falls too much."
        />
        <KPICard
          title="Consumer Welfare"
          value={`${(currentStats.consumerWelfare || 0).toFixed(2)}`}
          change={calculateChange(currentStats.consumerWelfare || 0, initialStats.consumerWelfare || 0)}
          isPositive={(currentStats.consumerWelfare || 0) >= (initialStats.consumerWelfare || 0)}
          tooltip="Proxy for consumer well-being. Rises with lower tariffs and fewer NTBs, which lower prices."
        />
        <KPICard
          title="Poverty Rate"
          value={`${currentStats.poverty_rate.toFixed(2)}%`}
          change={calculateChange(currentStats.poverty_rate, initialStats.poverty_rate)}
          isPositive={currentStats.poverty_rate <= initialStats.poverty_rate}
          tooltip="Percentage of population below the poverty line. Affected by economic growth and social spending."
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Comparison (Baseline vs. Current)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4">Baseline ({initialStats.year})</th>
                <th className="py-3 px-4">Current ({currentStats.year})</th>
                <th className="py-3 px-4">Change</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow label="GDP Growth" initial={initialStats.gdp_growth} current={currentStats.gdp_growth} unit="%" higherIsBetter={true} />
              <ComparisonRow label="Unemployment" initial={initialStats.unemployment} current={currentStats.unemployment} unit="%" higherIsBetter={false} />
              <ComparisonRow label="Poverty Rate" initial={initialStats.poverty_rate} current={currentStats.poverty_rate} unit="%" higherIsBetter={false} />
              <ComparisonRow label="Life Expectancy" initial={initialStats.life_expectancy} current={currentStats.life_expectancy} unit=" yrs" higherIsBetter={true} />
              <ComparisonRow label="Tariff Revenue" initial={initialStats.tariffRevenue || 0} current={currentStats.tariffRevenue || 0} unit="B" higherIsBetter={true} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

