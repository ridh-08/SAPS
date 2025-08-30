import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CountryStats } from '../types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from '../data/CountryList';

interface StatsDisplayProps {
  currentStats: CountryStats;
  historicalStats: CountryStats[];
  selectedCountry: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  currentStats,
  historicalStats,
  selectedCountry
}) => {
  // Declare hooks and variables only once, unconditionally
  const lineChartRef = useRef<SVGSVGElement>(null);
  const barChartRef = useRef<SVGSVGElement>(null);
  const scorecardRef = useRef<HTMLDivElement>(null);
  const countryColor = SOUTH_ASIAN_COUNTRIES.find(c => c.name === selectedCountry)?.color || '#3B82F6';


  // Move chart functions above useEffect to avoid dependency warning
  const drawLineChart = () => {
    if (!lineChartRef.current) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.bottom - margin.top;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(historicalStats, d => d.year) as [number, number])
      .range([0, width]);

    const indicators = [
      { key: 'gdp_growth', name: 'GDP Growth (%)', color: '#10B981' },
      { key: 'literacy_rate', name: 'Literacy Rate (%)', color: '#3B82F6' },
      { key: 'life_expectancy', name: 'Life Expectancy', color: '#8B5CF6' },
      { key: 'unemployment', name: 'Unemployment (%)', color: '#F59E0B' }
    ];

    indicators.forEach((indicator) => {
      const yScale = d3.scaleLinear()
        .domain(d3.extent(historicalStats, d => d[indicator.key as keyof CountryStats] as number) as [number, number])
        .nice()
        .range([height, 0]);

      const line = d3.line<CountryStats>()
        .x(d => xScale(d.year))
        .y(d => yScale(d[indicator.key as keyof CountryStats] as number))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(historicalStats)
        .attr('fill', 'none')
        .attr('stroke', indicator.color)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add dots for each data point
      g.selectAll(`.dot-${indicator.key}`)
        .data(historicalStats)
        .enter().append('circle')
        .attr('class', `dot-${indicator.key}`)
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d[indicator.key as keyof CountryStats] as number))
        .attr('r', 4)
        .attr('fill', indicator.color);
    });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

    g.append('g')
      .call(d3.axisLeft(d3.scaleLinear().domain([0, 100]).range([height, 0])));

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 20)`);

    indicators.forEach((indicator, index) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${index * 20})`);

      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', indicator.color);

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(indicator.name);
    });
  };

  const drawBarChart = () => {
    if (!barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = [
      { name: 'Education', value: currentStats.education_spending },
      { name: 'Health', value: currentStats.health_expenditure },
      { name: 'Infrastructure', value: currentStats.infrastructure_investment }
    ];

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .nice()
      .range([height, 0]);

    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value))
      .attr('fill', countryColor)
      .attr('opacity', 0.8);

    // Add value labels on bars
    g.selectAll('.label')
      .data(data)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.name) as number) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.value.toFixed(1) + '%');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Government Spending (% of GDP)');
  };

  useEffect(() => {
    if (historicalStats.length > 1) {
      drawLineChart();
    }
  }, [historicalStats, selectedCountry]);

  useEffect(() => {
    drawBarChart();
    updateScorecard();
  }, [currentStats, selectedCountry]);

  // If stats are missing or all zero, show loading spinner
  const isLoading = !currentStats || !currentStats.country || 
    (currentStats.gdp_growth === 0 && currentStats.unemployment === 0 && currentStats.literacy_rate === 0);
    
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading statistics for {selectedCountry}...</div>
        </div>
      </div>
    );
  }




  const updateScorecard = () => {
    if (!scorecardRef.current) return;
    // Scorecard is handled by React rendering below
  };

  const formatNumber = (value: number, decimals = 1): string => {
    return value.toFixed(decimals);
  };

  const getIndicatorTrend = (indicator: keyof CountryStats): 'up' | 'down' | 'stable' => {
    if (historicalStats.length < 2) return 'stable';
    const current = currentStats[indicator] as number;
    const previous = historicalStats[historicalStats.length - 2][indicator] as number;
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Statistics Dashboard - {selectedCountry}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Country Scorecard */}
        <div ref={scorecardRef} className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Indicators</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">GDP Growth</div>
              <div className="text-xl font-bold text-green-600">
                {formatNumber(currentStats.gdp_growth)}% {getTrendIcon(getIndicatorTrend('gdp_growth'))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Unemployment</div>
              <div className="text-xl font-bold text-orange-600">
                {formatNumber(currentStats.unemployment)}% {getTrendIcon(getIndicatorTrend('unemployment'))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Literacy Rate</div>
              <div className="text-xl font-bold text-blue-600">
                {formatNumber(currentStats.literacy_rate)}% {getTrendIcon(getIndicatorTrend('literacy_rate'))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Life Expectancy</div>
              <div className="text-xl font-bold text-purple-600">
                {formatNumber(currentStats.life_expectancy)} years {getTrendIcon(getIndicatorTrend('life_expectancy'))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">Poverty Rate</div>
              <div className="text-xl font-bold text-red-600">
                {formatNumber(currentStats.poverty_rate)}% {getTrendIcon(getIndicatorTrend('poverty_rate'))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-sm text-gray-600">CO₂ Emissions</div>
              <div className="text-xl font-bold text-gray-600">
                {formatNumber(currentStats.co2_emissions, 2)} tons/capita {getTrendIcon(getIndicatorTrend('co2_emissions'))}
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div>
          <svg ref={barChartRef}></svg>
        </div>
      </div>

      {/* Line Chart */}
      {historicalStats.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Trends</h3>
          <div className="overflow-x-auto">
            <svg ref={lineChartRef}></svg>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">Population</h4>
          <p className="text-2xl font-bold text-blue-600">
            {(currentStats.population / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">Infant Mortality</h4>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(currentStats.infant_mortality)} per 1000
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">Year</h4>
          <p className="text-2xl font-bold text-purple-600">
            {currentStats.year}
          </p>
        </div>
      </div>
    </div>
  );
};