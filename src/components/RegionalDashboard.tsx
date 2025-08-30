// Type definitions must be at the very top
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CountryStats, TradeRelationship, PolicySpillover } from '../types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from '../data/CountryList';
import {  TrendingUp, TrendingDown } from 'react-feather';
import { Globe2, ArrowRightLeft } from 'lucide-react';

interface RegionalDashboardProps {
  allCountries: Record<string, CountryStats>;
  playerCountry: string;
  tradeMatrix: TradeRelationship[];
  spilloverEffects: PolicySpillover[];
  cooperationIndex: number;
}

interface CountryNode {
  id: string;
  name: string;
  flag: string;
  color: string;
  isPlayer: boolean;
  gdp: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string;
  target: string;
  value: number;
  cooperation: number;
}

export const RegionalDashboard: React.FC<RegionalDashboardProps> = ({
  allCountries,
  playerCountry,
  tradeMatrix,
  spilloverEffects,
  cooperationIndex,
}) => {
  const networkChartRef = useRef<SVGSVGElement>(null);
  const comparisonChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawTradeNetwork();
    drawRegionalComparison();
  }, [allCountries, tradeMatrix, playerCountry]);

  const drawTradeNetwork = () => {
    if (!networkChartRef.current) return;

    const svg = d3.select(networkChartRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 400;

    svg.attr('width', width).attr('height', height);

    // Prepare nodes
    const countries: CountryNode[] = SOUTH_ASIAN_COUNTRIES.map((country) => ({
      id: country.name,
      name: country.name,
      flag: country.flag,
      color: country.color,
      isPlayer: country.name === playerCountry,
      gdp: allCountries[country.name]?.gdp_growth || 0,
    }));

    // Prepare links (filter tradeVolume > 0.5)
    const links: Link[] = tradeMatrix
      .filter((trade) => trade.tradeVolume > 0.5)
      .map((trade) => ({
        source: trade.from,
        target: trade.to,
        value: trade.tradeVolume,
        cooperation: trade.cooperation,
      }));

    // Create simulation
    const simulation = d3
      .forceSimulation<CountryNode>(countries)
      .force(
        'link',
        d3
          .forceLink<CountryNode, Link>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2);

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('g')
      .data(countries)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, CountryNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Country circles
    node
      .append('circle')
      .attr('r', (d) => (d.isPlayer ? 25 : 20))
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => (d.isPlayer ? '#1E40AF' : '#fff'))
      .attr('stroke-width', (d) => (d.isPlayer ? 3 : 2));

    // Country flags (emoji)
    node
      .append('text')
      .text((d) => d.flag)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '16px')
      .style('pointer-events', 'none');

    // Country names
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '35px')
      .style('font-size', '10px')
      .style('font-weight', (d) => (d.isPlayer ? 'bold' : 'normal'))
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => ((d.source as unknown) as CountryNode).x!)
        .attr('y1', (d) => ((d.source as unknown) as CountryNode).y!)
        .attr('x2', (d) => ((d.target as unknown) as CountryNode).x!)
        .attr('y2', (d) => ((d.target as unknown) as CountryNode).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  };

  const drawRegionalComparison = () => {
    if (!comparisonChartRef.current) return;

    const svg = d3.select(comparisonChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = Object.entries(allCountries).map(([country, stats]) => ({
      country,
      gdp_growth: stats.gdp_growth,
      isPlayer: country === playerCountry,
    }));

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.country))
      .range([0, width])
      .padding(0.1);

    const yExtent = d3.extent(data, (d) => d.gdp_growth) as [number, number];
    // Ensure zero is included in domain for bars
    const yDomain: [number, number] = [
      Math.min(0, yExtent[0]),
      Math.max(0, yExtent[1]),
    ];

    const yScale = d3.scaleLinear().domain(yDomain).nice().range([height, 0]);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.country)!)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => (d.gdp_growth >= 0 ? yScale(d.gdp_growth) : yScale(0)))
      .attr('height', (d) =>
        d.gdp_growth >= 0
          ? yScale(0) - yScale(d.gdp_growth)
          : yScale(d.gdp_growth) - yScale(0)
      )
      .attr('fill', (d) => {
        if (d.isPlayer) return '#3B82F6';
        return d.gdp_growth >= 0 ? '#10B981' : '#EF4444';
      })
      .attr('stroke', (d) => (d.isPlayer ? '#1E40AF' : 'none'))
      .attr('stroke-width', (d) => (d.isPlayer ? 2 : 0));

    // Value labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (xScale(d.country)! + xScale.bandwidth() / 2))
      .attr('y', (d) =>
        d.gdp_growth >= 0 ? yScale(d.gdp_growth) - 5 : yScale(d.gdp_growth) + 15
      )
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', (d) => (d.isPlayer ? 'bold' : 'normal'))
      .text((d) => d.gdp_growth.toFixed(1) + '%');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g').call(d3.axisLeft(yScale));

    // Zero line
    if (yDomain[0] < 0) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', '#666')
        .attr('stroke-dasharray', '3,3');
    }
  };

  const getSpilloversByTarget = (targetCountry: string) => {
    return spilloverEffects.filter((s) => s.targetCountry === targetCountry);
  };

  const getCooperationColor = (index: number) => {
    if (index >= 80) return 'text-green-600 bg-green-50';
    if (index >= 60) return 'text-blue-600 bg-blue-50';
    if (index >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Globe2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Regional Dashboard</h2>
        </div>
        <div className={`px-4 py-2 rounded-lg ${getCooperationColor(cooperationIndex)}`}>
          <div className="text-sm font-medium">Regional Cooperation</div>
          <div className="text-lg font-bold">{cooperationIndex}/100</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trade Network */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trade Network</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <svg ref={networkChartRef}></svg>
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 border-2 border-blue-800"></div>
                  <span>Your Country</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-0.5 bg-gray-400 mr-2"></div>
                  <span>Trade Relationship</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional GDP Comparison */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">GDP Growth Comparison</h3>
          <svg ref={comparisonChartRef}></svg>
        </div>
      </div>

      {/* Spillover Effects */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Policy Spillover Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(allCountries).map((country) => {
            const spillovers = getSpilloversByTarget(country);
            const isPlayer = country === playerCountry;

            return (
              <div
                key={country}
                className={`p-4 rounded-lg border-2 ${
                  isPlayer ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${isPlayer ? 'text-blue-800' : 'text-gray-800'}`}>
                    {SOUTH_ASIAN_COUNTRIES.find((c) => c.name === country)?.flag} {country}
                  </h4>
                  {isPlayer && <span className="text-xs text-blue-600 font-medium">YOU</span>}
                </div>

                {spillovers.length > 0 ? (
                  <div className="space-y-1">
                    {spillovers.slice(0, 3).map((spillover, idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        {spillover.effect > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className="text-gray-600 truncate">{spillover.description}</span>
                      </div>
                    ))}
                    {spillovers.length > 3 && (
                      <div className="text-xs text-gray-500">+{spillovers.length - 3} more effects</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No spillover effects</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800">Total Regional Trade</h4>
              <p className="text-2xl font-bold text-green-600">
                $
                {(
                  tradeMatrix.reduce((sum, t) => sum + t.tradeVolume, 0) * 10
                ).toFixed(1)}
                B
              </p>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">Average Tariff Rate</h4>
          <p className="text-2xl font-bold text-blue-600">
            {(
              tradeMatrix.reduce((sum, t) => sum + t.tariffRate, 0) / tradeMatrix.length
            ).toFixed(1)}
            %
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">Active Spillovers</h4>
          <p className="text-2xl font-bold text-purple-600">{spilloverEffects.length}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Regional Interdependency</h4>
        <p className="text-sm text-yellow-700">
          Your policy decisions affect neighboring countries through trade, investment, and cooperation. Higher
          cooperation and lower tariffs generally benefit the entire region, while protectionist policies may help
          short-term but hurt regional growth. Monitor spillover effects to understand your impact on South Asian
          development.
        </p>
      </div>
    </div>
  );
};