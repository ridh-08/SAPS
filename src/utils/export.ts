import { CountryStats } from '../types/GameTypes';

export const exportToCsv = (historicalStats: CountryStats[], playerCountry: string) => {
  if (!historicalStats || historicalStats.length === 0) {
    console.error("No historical data to export.");
    return;
  }

  const headers = [
    'Year', 'Country', 'GDP_Growth', 'Unemployment', 'Literacy_Rate', 
    'Life_Expectancy', 'Poverty_Rate', 'CO2_Emissions', 'Tariff_Revenue', 'Consumer_Welfare'
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
    (stats.tariffRevenue || 0).toFixed(2),
    (stats.consumerWelfare || 0).toFixed(2)
  ].join(','));

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `policy_simulation_results_${playerCountry}_${new Date().getFullYear()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

