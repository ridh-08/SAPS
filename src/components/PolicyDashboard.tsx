import React from 'react';
import { PolicyDecision } from '../types/GameTypes';
import { BookOpen, Heart, Building, Leaf, TrendingUp } from 'lucide-react';

interface PolicyDashboardProps {
  decisions: PolicyDecision[];
  onDecisionChange: (id: string, value: number) => void;
  year: number;
  country: string;
}

export const PolicyDashboard: React.FC<PolicyDashboardProps> = ({
  decisions,
  onDecisionChange,
  year,
  country
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'education': return <BookOpen className="w-6 h-6" />;
      case 'health': return <Heart className="w-6 h-6" />;
      case 'infrastructure': return <Building className="w-6 h-6" />;
      case 'environment': return <Leaf className="w-6 h-6" />;
      case 'economic': return <TrendingUp className="w-6 h-6" />;
      case 'agriculture': return <Leaf className="w-6 h-6" />;
      case 'manufacturing': return <Building className="w-6 h-6" />;
      case 'services': return <TrendingUp className="w-6 h-6" />;
      case 'energy': return <Building className="w-6 h-6" />;
      case 'technology': return <TrendingUp className="w-6 h-6" />;
      case 'tourism': return <Heart className="w-6 h-6" />;
      case 'fiscal': return <TrendingUp className="w-6 h-6" />;
      case 'investment': return <TrendingUp className="w-6 h-6" />;
      case 'social': return <Heart className="w-6 h-6" />;
      case 'labor': return <TrendingUp className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'text-blue-600 bg-blue-50';
      case 'health': return 'text-red-600 bg-red-50';
      case 'infrastructure': return 'text-gray-600 bg-gray-50';
      case 'environment': return 'text-green-600 bg-green-50';
      case 'economic': return 'text-purple-600 bg-purple-50';
      case 'agriculture': return 'text-green-600 bg-green-50';
      case 'manufacturing': return 'text-indigo-600 bg-indigo-50';
      case 'services': return 'text-cyan-600 bg-cyan-50';
      case 'energy': return 'text-orange-600 bg-orange-50';
      case 'technology': return 'text-violet-600 bg-violet-50';
      case 'tourism': return 'text-pink-600 bg-pink-50';
      case 'fiscal': return 'text-yellow-600 bg-yellow-50';
      case 'investment': return 'text-emerald-600 bg-emerald-50';
      case 'social': return 'text-rose-600 bg-rose-50';
      case 'labor': return 'text-teal-600 bg-teal-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Policy Dashboard</h2>
          <p className="text-gray-600">{country} • Year {year}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Budget Allocation</div>
          <div className="text-lg font-semibold text-gray-700">
            {decisions.reduce((sum, d) => sum + d.value, 0).toFixed(1)}% of GDP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decisions.map((decision) => (
          <div key={decision.id} className="border border-gray-200 rounded-lg p-5">
            <div className={`inline-flex items-center justify-center p-2 rounded-lg mb-4 ${getCategoryColor(decision.category)}`}>
              {getIcon(decision.category)}
            </div>
            
            <h3 className="font-semibold text-gray-800 mb-2">{decision.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{decision.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current: {decision.value}{decision.unit}</span>
                <span className="text-gray-500">{decision.min} - {decision.max}{decision.unit}</span>
              </div>
              
              <input
                type="range"
                min={decision.min}
                max={decision.max}
                step={decision.step}
                value={decision.value}
                onChange={(e) => onDecisionChange(decision.id, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                  {decision.value}{decision.unit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Policy Impact Framework</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Your policy decisions create complex interactions across multiple sectors and countries:
          </p>
          <ul className="text-xs text-yellow-600 space-y-1">
            <li>• <strong>Direct Effects:</strong> Immediate impact on your country's indicators</li>
            <li>• <strong>Spillover Effects:</strong> Impact on neighboring countries through trade and cooperation</li>
            <li>• <strong>Sectoral Interactions:</strong> Industry policies affect multiple economic sectors</li>
            <li>• <strong>Time Dynamics:</strong> Short-term costs may lead to long-term benefits</li>
          </ul>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Regional Considerations</h4>
          <p className="text-sm text-blue-700 mb-3">
            South Asian economies are highly interconnected. Consider these regional dynamics:
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• <strong>Trade Dependencies:</strong> Your tariff policies affect regional trade flows</li>
            <li>• <strong>Energy Cooperation:</strong> Cross-border energy projects benefit multiple countries</li>
            <li>• <strong>Technology Transfer:</strong> Innovation investments create regional knowledge spillovers</li>
            <li>• <strong>Environmental Impact:</strong> Pollution and climate policies have cross-border effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};