import React from 'react';
import { SOUTH_ASIAN_COUNTRIES } from '../data/CountryList';
import { Country } from '../types/GameTypes';

interface CountrySelectorProps {
  selectedCountry: string;
  onSelectCountry: (country: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelectCountry
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Choose Your Country
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SOUTH_ASIAN_COUNTRIES.map((country: Country) => (
          <button
            key={country.code}
            onClick={() => onSelectCountry(country.name)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105
              ${selectedCountry === country.name
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
            style={{
              borderColor: selectedCountry === country.name ? country.color : undefined
            }}
          >
            <div className="text-4xl mb-2">{country.flag}</div>
            <div className="font-semibold text-gray-800">{country.name}</div>
            <div className="text-sm text-gray-500">{country.code}</div>
            {selectedCountry === country.name && (
              <div 
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: country.color }}
              />
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">About the Simulation</h3>
        <p className="text-sm text-gray-600">
          Lead your chosen country through 20 years of policy decisions. Your choices in education, 
          healthcare, infrastructure, environment, and trade will shape your nation's future. 
          Make strategic decisions to improve economic growth, reduce poverty, and enhance quality of life.
        </p>
      </div>
    </div>
  );
};