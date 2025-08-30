import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CountryStats } from '../types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from '../data/CountryList';
import { getRegionalAverage, AllIndicators } from '../data/ExcelDataLoader';

interface FinalReportProps {
  finalStats: CountryStats;
  initialStats: CountryStats;
  selectedCountry: string;
  finalScore: number;
  allIndicators: AllIndicators;
  onRestart: () => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({
  finalStats,
  initialStats,
  selectedCountry,
  finalScore,
  allIndicators,
  onRestart
}) => {
  const comparisonChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawRegionalComparison();
  }, [finalStats, selectedCountry]);

  const drawRegionalComparison = () => {
    if (!comparisonChartRef.current) return;

    const svg = d3.select(comparisonChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sample regional averages (in real app, would come from CSV data)
    const regionalData = [
      { country: selectedCountry, gdp_growth: finalStats.gdp_growth, isPlayer: true },
      { country: 'Regional Avg', gdp_growth: getRegionalAverage(allIndicators, 'GDP', finalStats.year), isPlayer: false }
    ].filter(d => d.country !== selectedCountry || d.isPlayer);
    
    // Add other major countries for comparison
    const majorCountries = ['India', 'Bangladesh', 'Pakistan'].filter(c => c !== selectedCountry);
    majorCountries.forEach(country => {
      const countryData = SOUTH_ASIAN_COUNTRIES.find(c => c.name === country);
      if (countryData) {
        // Use sample data for comparison (in real app, would use actual final year data)
        const sampleGDP = country === 'India' ? 5.8 : country === 'Bangladesh' ? 6.1 : 1.2;
        regionalData.push({
          country,
          gdp_growth: sampleGDP,
          isPlayer: false
        });
      }
    });

    const xScale = d3.scaleBand()
      .domain(regionalData.map(d => d.country))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(regionalData, d => d.gdp_growth) as [number, number])
      .nice()
      .range([height, 0]);

    const countryColor = SOUTH_ASIAN_COUNTRIES.find(c => c.name === selectedCountry)?.color || '#3B82F6';

    g.selectAll('.bar')
      .data(regionalData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.country) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(Math.max(0, d.gdp_growth)))
      .attr('height', d => Math.abs(yScale(d.gdp_growth) - yScale(0)))
      .attr('fill', d => d.isPlayer ? countryColor : '#94A3B8')
      .attr('stroke', d => d.isPlayer ? '#1E40AF' : 'none')
      .attr('stroke-width', d => d.isPlayer ? 3 : 0);

    // Add value labels
    g.selectAll('.label')
      .data(regionalData)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.country) as number) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.gdp_growth) + (d.gdp_growth >= 0 ? -5 : 15))
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', d => d.isPlayer ? 'bold' : 'normal')
      .text(d => d.gdp_growth.toFixed(1) + '%');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add title
    svg.append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('GDP Growth Comparison - Final Year');

    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 20)
      .attr('x', 0 - (height + margin.top + margin.bottom) / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('GDP Growth (%)');
  };

  const calculateImprovement = (final: number, initial: number): { value: number; percentage: number } => {
    const improvement = final - initial;
    const percentage = initial !== 0 ? (improvement / Math.abs(initial)) * 100 : 0;
    return { value: improvement, percentage };
  };

  const getScoreRating = (score: number): { rating: string; color: string; description: string } => {
    if (score >= 800) return { rating: 'Excellent', color: 'text-green-600', description: 'Outstanding leadership!' };
    if (score >= 600) return { rating: 'Good', color: 'text-blue-600', description: 'Strong performance!' };
    if (score >= 400) return { rating: 'Average', color: 'text-yellow-600', description: 'Room for improvement' };
    return { rating: 'Needs Work', color: 'text-red-600', description: 'Consider different strategies' };
  };

  const improvements = {
    gdp: calculateImprovement(finalStats.gdp_growth, initialStats.gdp_growth),
    literacy: calculateImprovement(finalStats.literacy_rate, initialStats.literacy_rate),
    life_expectancy: calculateImprovement(finalStats.life_expectancy, initialStats.life_expectancy),
    unemployment: calculateImprovement(initialStats.unemployment, finalStats.unemployment), // Reversed for unemployment
    poverty: calculateImprovement(initialStats.poverty_rate, finalStats.poverty_rate), // Reversed for poverty
  };

  const scoreInfo = getScoreRating(finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Final Report</h1>
          <p className="text-xl text-gray-600">
            {selectedCountry} • {initialStats.year} - {finalStats.year}
          </p>
          <div className="mt-4">
            <div className={`text-6xl font-bold ${scoreInfo.color}`}>
              {finalScore}/1000
            </div>
            <div className={`text-2xl font-semibold ${scoreInfo.color} mt-2`}>
              {scoreInfo.rating}
            </div>
            <div className="text-gray-600 mt-1">{scoreInfo.description}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Improvements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Improvements</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-800">GDP Growth</div>
                  <div className="text-sm text-green-600">
                    {initialStats.gdp_growth.toFixed(1)}% → {finalStats.gdp_growth.toFixed(1)}%
                  </div>
                </div>
                <div className={`text-2xl font-bold ${improvements.gdp.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvements.gdp.value >= 0 ? '+' : ''}{improvements.gdp.value.toFixed(1)}%
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-800">Literacy Rate</div>
                  <div className="text-sm text-blue-600">
                    {initialStats.literacy_rate.toFixed(1)}% → {finalStats.literacy_rate.toFixed(1)}%
                  </div>
                </div>
                <div className={`text-2xl font-bold ${improvements.literacy.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvements.literacy.value >= 0 ? '+' : ''}{improvements.literacy.value.toFixed(1)}%
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-800">Life Expectancy</div>
                  <div className="text-sm text-purple-600">
                    {initialStats.life_expectancy.toFixed(1)} → {finalStats.life_expectancy.toFixed(1)} years
                  </div>
                </div>
                <div className={`text-2xl font-bold ${improvements.life_expectancy.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvements.life_expectancy.value >= 0 ? '+' : ''}{improvements.life_expectancy.value.toFixed(1)}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-semibold text-orange-800">Unemployment</div>
                  <div className="text-sm text-orange-600">
                    {initialStats.unemployment.toFixed(1)}% → {finalStats.unemployment.toFixed(1)}%
                  </div>
                </div>
                <div className={`text-2xl font-bold ${improvements.unemployment.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvements.unemployment.value >= 0 ? '-' : '+'}{Math.abs(improvements.unemployment.value).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Regional Comparison Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Regional Comparison</h2>
            <svg ref={comparisonChartRef}></svg>
          </div>
        </div>

        {/* Policy Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Policy Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Education Investment</h3>
              <div className="text-3xl font-bold text-blue-600">
                {finalStats.education_spending.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-600">of GDP</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Health Investment</h3>
              <div className="text-3xl font-bold text-red-600">
                {finalStats.health_expenditure.toFixed(1)}%
              </div>
              <div className="text-sm text-red-600">of GDP</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Infrastructure Investment</h3>
              <div className="text-3xl font-bold text-gray-600">
                {finalStats.infrastructure_investment.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">of GDP</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Play Again
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};