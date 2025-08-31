import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DetailedSpilloverEffect } from '../types/GameTypes';
import { SOUTH_ASIAN_COUNTRIES } from '../data/CountryList';
import {
  ArrowRight,
  Clock,
  Factory,
  Leaf,
  Cpu,
  Landmark,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface DetailedSpilloverDashboardProps {
  spilloverEffects: DetailedSpilloverEffect[];
  playerCountry: string;
  currentYear: number;
}

interface CountryNode {
  id: string;
  name: string;
  flag: string;
  color: string;
  isPlayer: boolean;
  spilloverCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SpilloverLink {
  source: string;
  target: string;
  magnitude: number;
  effect: number;
  type: string;
  description: string;
  timeframe: string;
}

export const DetailedSpilloverDashboard: React.FC<DetailedSpilloverDashboardProps> = ({
  spilloverEffects,
  playerCountry,
  currentYear,
}) => {
  const networkRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<SVGSVGElement>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const toggleSourceExpansion = (sourceCountry: string) => {
    setExpandedSources((prev) => ({ ...prev, [sourceCountry]: !prev[sourceCountry] }));
  };

  useEffect(() => {
    const handleResize = () => {
      drawSpilloverNetwork();
      drawSpilloverTimeline();
    };

    // Initial draw
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [spilloverEffects, playerCountry, currentYear]); // Redraw when data changes

  const drawSpilloverNetwork = () => {
    if (!networkRef.current) return;
    const container = networkRef.current.parentElement;
    if (!container) return;

    const svg = d3.select(networkRef.current);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = 400;
    svg.attr('width', width).attr('height', height);

    // Prepare nodes
    const countries: CountryNode[] = SOUTH_ASIAN_COUNTRIES.map((country) => ({
      id: country.name,
      name: country.name,
      flag: country.flag || '🏳️',
      color: country.color,
      isPlayer: country.name === playerCountry,
      spilloverCount: spilloverEffects.filter(
        (s) => s.sourceCountry === country.name || s.targetCountry === country.name
      ).length,
    }));

    // Prepare links
    const links: SpilloverLink[] = spilloverEffects.map((effect) => ({
      source: effect.sourceCountry,
      target: effect.targetCountry,
      magnitude: Math.abs(effect.magnitude),
      effect: effect.magnitude,
      type: effect.effectType,
      description: effect.description,
      timeframe: effect.timeframe,
    }));

    // Append defs for arrow markers once
    const defs = svg.append('defs');

    const markerTypes = ['trade', 'investment', 'technology', 'environment'] as const;

    markerTypes.forEach((type) => {
      defs
        .append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .attr('pointer-events', 'none')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', () => {
          switch (type) {
            case 'trade':
              return '#3B82F6';
            case 'investment':
              return '#10B981';
            case 'technology':
              return '#8B5CF6';
            case 'environment':
              return '#F59E0B';
            default:
              return '#6B7280';
          }
        });
    });

    // Setup simulation
    const simulation = d3
      .forceSimulation<CountryNode>(countries)
      .force(
        'link',
        d3
          .forceLink<CountryNode, SpilloverLink>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg
      .append('g')
      .attr('stroke-opacity', 0.7)
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        switch (d.type) {
          case 'trade':
            return '#3B82F6';
          case 'investment':
            return '#10B981';
          case 'technology':
            return '#8B5CF6';
          case 'environment':
            return '#F59E0B';
          default:
            return '#6B7280';
        }
      })
      .attr('stroke-width', (d) => Math.max(1, d.magnitude * 20))
      .attr('stroke-dasharray', (d) => (d.effect < 0 ? '5,5' : 'none'))
      .attr('marker-end', (d) => `url(#arrow-${d.type})`);

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('g')
      .data(countries)
      .enter()
      .append('g')
      .attr('cursor', 'pointer');

    // Circles
    node
      .append('circle')
      .attr('r', (d) => Math.max(20, 15 + d.spilloverCount * 2))
      .attr('fill', (d) => d.color)
      .attr('stroke', (d) => (d.isPlayer ? '#1E40AF' : '#fff'))
      .attr('stroke-width', (d) => (d.isPlayer ? 4 : 2))
      .attr('opacity', 0.8);

    // Flags
    node
      .append('text')
      .text((d) => d.flag)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '16px')
      .style('user-select', 'none');

    // Country names
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '35px')
      .style('font-size', '10px')
      .style('font-weight', (d) => (d.isPlayer ? 'bold' : 'normal'))
      .style('user-select', 'none');

    // Spillover count badges
    const badgeNodes = node.filter((d) => d.spilloverCount > 0);

    badgeNodes
      .append('circle')
      .attr('cx', 15)
      .attr('cy', -15)
      .attr('r', 8)
      .attr('fill', '#EF4444')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    badgeNodes
      .append('text')
      .attr('x', 15)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text((d) => d.spilloverCount);

    // Tooltips
    node.append('title').text((d) => `${d.name}\nSpillover Effects: ${d.spilloverCount}`);

    link.append('title').text(
      (d) =>
        `${d.description}\nMagnitude: ${d.magnitude.toFixed(3)}\nTimeframe: ${d.timeframe}`
    );

    // Simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as CountryNode).x!)
        .attr('y1', (d) => (d.source as CountryNode).y!)
        .attr('x2', (d) => (d.target as CountryNode).x!)
        .attr('y2', (d) => (d.target as CountryNode).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  };

  const drawSpilloverTimeline = () => {
    if (!timelineRef.current) return;
    const container = timelineRef.current.parentElement;
    if (!container) return;

    const svg = d3.select(timelineRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    if (width <= 0) return; // Don't draw if container is not visible or has no width

    svg.attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const timeframeOrder = ['immediate', 'short-term', 'medium-term', 'long-term'];

    // Group spillovers by timeframe
    const timeframeData = d3.rollup(
      spilloverEffects,
      (v) => v.length,
      (d) => d.timeframe
    );

    const data = timeframeOrder.map(tf => ({
      timeframe: tf,
      count: timeframeData.get(tf) || 0
    }));

    const xScale = d3
      .scaleBand()
      .domain(timeframeOrder)
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) ?? 0])
      .nice()
      .range([height, 0]);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.timeframe)!)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d.count))
      .attr('height', (d) => height - yScale(d.count))
      .attr('fill', (d) => {
        switch (d.timeframe) {
          case 'immediate':
            return '#EF4444';
          case 'short-term':
            return '#F59E0B';
          case 'medium-term':
            return '#3B82F6';
          case 'long-term':
            return '#10B981';
          default:
            return '#6B7280';
        }
      })
      .attr('opacity', 0.8);

    // Value labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (d) => (xScale(d.timeframe)! + xScale.bandwidth() / 2))
      .attr('y', (d) => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d) => d.count);

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));

    g.append('g').call(d3.axisLeft(yScale));

    // Title
    svg
      .append('text')
      .attr('x', (width + margin.left + margin.right) / 2)
      .attr('y', margin.top - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Spillover Effects by Timeframe');
  };

  const getEffectIcon = (effectType: string) => {
    switch (effectType) {
      case 'trade':
        return <Factory className="w-5 h-5" />;
      case 'investment':
        return <Landmark className="w-5 h-5" />;
      case 'technology':
        return <Cpu className="w-5 h-5" />;
      case 'environment':
        return <Leaf className="w-5 h-5" />;
      default:
        return <ArrowRight className="w-5 h-5" />;
    }
  };

  const getEffectColor = (effectType: string) => {
    switch (effectType) {
      case 'trade':
        return 'text-blue-600 bg-blue-100';
      case 'investment':
        return 'text-green-600 bg-green-100';
      case 'technology':
        return 'text-purple-600 bg-purple-100';
      case 'environment':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeframeIcon = (_timeframe: string) => {
    return <Clock className="w-3 h-3" />;
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude > 0) return 'text-green-600';
    if (magnitude < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Group spillovers by source country
  const spilloversBySource = d3.group(spilloverEffects, (d) => d.sourceCountry);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Detailed Spillover Analysis</h2>
          <p className="text-gray-600">Comprehensive view of policy interdependencies • Year {currentYear}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Active Spillovers</div>
          <div className="text-2xl font-bold text-blue-600">{spilloverEffects.length}</div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-blue-800">Trade Spillovers</h4>
          <p className="text-3xl font-bold text-blue-600">
            {spilloverEffects.filter((s) => s.effectType === 'trade').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-green-800">Investment Effects</h4>
          <p className="text-3xl font-bold text-green-600">
            {spilloverEffects.filter((s) => s.effectType === 'investment').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-purple-800">Technology Transfer</h4>
          <p className="text-3xl font-bold text-purple-600">
            {spilloverEffects.filter((s) => s.effectType === 'technology').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-yellow-800">Environmental Impact</h4>
          <p className="text-3xl font-bold text-yellow-600">
            {spilloverEffects.filter((s) => s.effectType === 'environment').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Spillover Network */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Spillover Network</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <svg ref={networkRef} />
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-1 bg-blue-500 mr-2" />
                <span>Trade Effects</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-green-500 mr-2" />
                <span>Investment Effects</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-purple-500 mr-2" />
                <span>Technology Effects</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-yellow-500 mr-2" />
                <span>Environmental Effects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spillover Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Effects by Timeframe</h3>
          <svg ref={timelineRef} />
        </div>
      </div>

      {/* Detailed Spillover List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Breakdown of Active Spillover Effects</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.from(spilloversBySource.entries()).map(([sourceCountry, effects]) => {
            const isExpanded = !!expandedSources[sourceCountry];
            const displayedEffects = isExpanded ? effects : effects.slice(0, 4);

            return (
              <div key={sourceCountry} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">
                    {SOUTH_ASIAN_COUNTRIES.find((c) => c.name === sourceCountry)?.flag ?? '🏳️'}{' '}
                    {sourceCountry}
                    {sourceCountry === playerCountry && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        YOU
                      </span>
                    )}
                  </h4>
                  <span className="text-sm text-gray-500">{effects.length} effects</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayedEffects.map((effect, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${getEffectColor(effect.effectType)}`}>
                            {getEffectIcon(effect.effectType)}
                          </div>
                          <div>
                            <span className="text-base font-bold text-gray-800">
                              → {SOUTH_ASIAN_COUNTRIES.find((c) => c.name === effect.targetCountry)?.flag ?? '🏳️'}{' '}
                              {effect.targetCountry}
                            </span>
                            <span className="block text-xs text-gray-500 capitalize">{effect.effectType} Effect</span>
                          </div>
                        </div>
                        <div className={`text-lg font-bold flex items-center ${getMagnitudeColor(effect.magnitude)}`}>
                          {effect.magnitude > 0 ? (
                            <ArrowUp className="w-5 h-5" />
                          ) : effect.magnitude < 0 ? (
                            <ArrowDown className="w-5 h-5" />
                          ) : (
                            <Minus className="w-5 h-5" />
                          )}
                          <span className="ml-1">{Math.abs(effect.magnitude).toFixed(3)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 my-3 pl-10">"{effect.description}"</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 pl-10">
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                          {getTimeframeIcon(effect.timeframe)}
                          <span className="ml-1 capitalize">{effect.timeframe}</span>
                        </div>
                        {effect.sector && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-medium">
                            {effect.sector}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {effects.length > 4 && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => toggleSourceExpansion(sourceCountry)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {isExpanded ? 'Show Less' : `Show ${effects.length - 4} More Effects...`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Understanding Spillover Effects</h4>
        <p className="text-sm text-blue-700">
          This dashboard visualizes how your policy decisions ripple through the region. Positive effects (green ▲)
          indicate benefits to other countries, while negative effects (red ▼) indicate harm. The network graph
          shows the flow of these effects, with thicker lines representing stronger impacts.
        </p>
      </div>
    </div>
  );
};