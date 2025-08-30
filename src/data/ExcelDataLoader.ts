import * as XLSX from 'xlsx';
import { SOUTH_ASIAN_COUNTRIES } from './CountryList';

export interface IndicatorData {
  [country: string]: {
    [year: string]: number;
  };
}

export interface AllIndicators {
  [indicator: string]: IndicatorData;
}

// Country name mapping for Excel files (handles variations in naming)
const COUNTRY_NAME_MAPPING: { [key: string]: string } = {
  'India': 'India',
  'Pakistan': 'Pakistan', 
  'Bangladesh': 'Bangladesh',
  'Sri Lanka': 'Sri Lanka',
  'Nepal': 'Nepal',
  'Bhutan': 'Bhutan',
  'Maldives': 'Maldives',
  'Afghanistan': 'Afghanistan',
  'Myanmar': 'Myanmar',
  // Alternative names that might appear in Excel files
  'Islamic Republic of Pakistan': 'Pakistan',
  'People\'s Republic of Bangladesh': 'Bangladesh',
  'Democratic Socialist Republic of Sri Lanka': 'Sri Lanka',
  'Federal Democratic Republic of Nepal': 'Nepal',
  'Kingdom of Bhutan': 'Bhutan',
  'Republic of Maldives': 'Maldives',
  'Islamic Republic of Afghanistan': 'Afghanistan',
  'Republic of the Union of Myanmar': 'Myanmar'
};

export async function loadAllExcelIndicators(): Promise<AllIndicators> {
  const indicatorFiles = [
    { file: 'WDI_GDP.xlsx', indicator: 'GDP' },
    { file: 'WDI_Unemployment.xlsx', indicator: 'Unemployment' },
    { file: 'WDI_Literacy.xlsx', indicator: 'Literacy' },
    { file: 'WDI_Health.xlsx', indicator: 'Health' },
    { file: 'WDI_Poverty.xlsx', indicator: 'Poverty' },
    { file: 'WDI_CO2_Emissions.xlsx', indicator: 'CO2_Emissions' },
    { file: 'WDI_Population.xlsx', indicator: 'Population' },
    { file: 'WDI_MortalityRate.xlsx', indicator: 'MortalityRate' },
    { file: 'WDI_Education.xlsx', indicator: 'Education' },
    { file: 'WDI_Infrastructure.xlsx', indicator: 'Infrastructure' },
    { file: 'WDI_RenewableEnergy.xlsx', indicator: 'RenewableEnergy' },
    { file: 'WDI_Gini.xlsx', indicator: 'Gini' },
    { file: 'WDI_Inflation.xlsx', indicator: 'Inflation' },
    { file: 'WDI_Internet.xlsx', indicator: 'Internet' },
    { file: 'WDI_Agriculture.xlsx', indicator: 'Agriculture' },
    { file: 'WDI_Manufacturing.xlsx', indicator: 'Manufacturing' },
    { file: 'WDI_Industry.xlsx', indicator: 'Industry' },
    { file: 'WDI_Services.xlsx', indicator: 'Services' },
    { file: 'WDI_Finance.xlsx', indicator: 'Finance' },
    { file: 'WDI_TradeIndex.xlsx', indicator: 'TradeIndex' }
  ];

  const allIndicators: AllIndicators = {};

  for (const { file, indicator } of indicatorFiles) {
    try {
      console.log(`Loading ${file}...`);
  const response = await fetch(`/${file}`);
      
      if (!response.ok) {
        console.warn(`Failed to load ${file}: ${response.status}`);
        // Create empty indicator data structure
        allIndicators[indicator] = {};
        SOUTH_ASIAN_COUNTRIES.forEach(country => {
          allIndicators[indicator][country.name] = {};
        });
        continue;
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      // Initialize indicator data structure
      allIndicators[indicator] = {};
      SOUTH_ASIAN_COUNTRIES.forEach(country => {
        allIndicators[indicator][country.name] = {};
      });

      // Process Excel data - assume format: [Country, Year, Value] or [Country, 2020, 2021, 2022, ...]
      if (jsonData.length > 1) {
        const headers = jsonData[0] as string[];
        
        // Check if it's time-series format (years as columns)
        const isTimeSeriesFormat = headers.length > 2 && 
          headers.slice(1).every(h => !isNaN(parseInt(String(h))));

        if (isTimeSeriesFormat) {
          // Format: [Country, 2020, 2021, 2022, ...]
          const years = headers.slice(1).map(h => String(h));
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const countryName = normalizeCountryName(String(row[0]));
            
            if (countryName) {
              years.forEach((year, yearIndex) => {
                const value = parseFloat(String(row[yearIndex + 1]));
                if (!isNaN(value)) {
                  allIndicators[indicator][countryName][year] = value;
                }
              });
            }
          }
        } else {
          // Format: [Country, Year, Value]
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const countryName = normalizeCountryName(String(row[0]));
            const year = String(row[1]);
            const value = parseFloat(String(row[2]));
            
            if (countryName && !isNaN(value)) {
              allIndicators[indicator][countryName][year] = value;
            }
          }
        }
      }

      console.log(`Loaded ${indicator} data for countries:`, Object.keys(allIndicators[indicator]));
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
      // Create empty indicator data structure
      allIndicators[indicator] = {};
      SOUTH_ASIAN_COUNTRIES.forEach(country => {
        allIndicators[indicator][country.name] = {};
      });
    }
  }

  return allIndicators;
}

function normalizeCountryName(name: string): string | null {
  const trimmedName = name.trim();
  
  // Direct match
  if (COUNTRY_NAME_MAPPING[trimmedName]) {
    return COUNTRY_NAME_MAPPING[trimmedName];
  }
  
  // Fuzzy matching for common variations
  const lowerName = trimmedName.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_NAME_MAPPING)) {
    if (key.toLowerCase() === lowerName || 
        lowerName.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }
  
  return null;
}

// Utility to get a country's indicator for a year with fallback logic
export function getIndicatorValue(
  allIndicators: AllIndicators,
  indicator: string,
  country: string,
  year: string | number
): number | null {
  const yearStr = String(year);
  const indicatorData = allIndicators[indicator];
  
  if (!indicatorData || !indicatorData[country]) {
    return null;
  }
  
  const countryData = indicatorData[country];
  
  // Try exact year match first
  if (countryData[yearStr] !== undefined) {
    return countryData[yearStr];
  }
  
  // Try to find closest available year
  const availableYears = Object.keys(countryData).map(y => parseInt(y)).filter(y => !isNaN(y)).sort();
  if (availableYears.length === 0) {
    return null;
  }
  
  const targetYear = parseInt(yearStr);
  
  // Find closest year
  let closestYear = availableYears[0];
  let minDiff = Math.abs(targetYear - closestYear);
  
  for (const availableYear of availableYears) {
    const diff = Math.abs(targetYear - availableYear);
    if (diff < minDiff) {
      minDiff = diff;
      closestYear = availableYear;
    }
  }
  
  return countryData[String(closestYear)] || null;
}

// Get latest available data for a country and indicator
export function getLatestIndicatorValue(
  allIndicators: AllIndicators,
  indicator: string,
  country: string
): { value: number | null; year: string | null } {
  const indicatorData = allIndicators[indicator];
  
  if (!indicatorData || !indicatorData[country]) {
    return { value: null, year: null };
  }
  
  const countryData = indicatorData[country];
  const years = Object.keys(countryData).map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a, b) => b - a);
  
  if (years.length === 0) {
    return { value: null, year: null };
  }
  
  const latestYear = years[0];
  return {
    value: countryData[String(latestYear)] || null,
    year: String(latestYear)
  };
}

// Returns all stats for a country for a given year (with fallback to latest available)
export function getCountryStats(allIndicators: AllIndicators, country: string, year?: string | number): Record<string, number | null> {
  const stats: Record<string, number | null> = {};
  
  for (const indicator of Object.keys(allIndicators)) {
    if (year) {
      stats[indicator] = getIndicatorValue(allIndicators, indicator, country, year);
    } else {
      const latest = getLatestIndicatorValue(allIndicators, indicator, country);
      stats[indicator] = latest.value;
    }
  }
  
  return stats;
}

// Returns all stats for all countries for a given year
export function getAllCountriesStats(allIndicators: AllIndicators, year?: string | number): Record<string, Record<string, number | null>> {
  const allStats: Record<string, Record<string, number | null>> = {};
  
  for (const countryObj of SOUTH_ASIAN_COUNTRIES) {
    allStats[countryObj.name] = getCountryStats(allIndicators, countryObj.name, year);
  }
  
  return allStats;
}

// Get regional average for an indicator
export function getRegionalAverage(allIndicators: AllIndicators, indicator: string, year?: string | number): number {
  const values: number[] = [];
  
  SOUTH_ASIAN_COUNTRIES.forEach(country => {
    const value = year 
      ? getIndicatorValue(allIndicators, indicator, country.name, year)
      : getLatestIndicatorValue(allIndicators, indicator, country.name).value;
    
    if (value !== null) {
      values.push(value);
    }
  });
  
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
}