// Real data sources for South Asia Policy Simulation
// All data is now loaded from local Excel files in the /data folder.

export interface DataSource {
  name: string;
  file: string;
  description: string;
  indicators: string[];
}

export const OFFICIAL_DATA_SOURCES: DataSource[] = [
  { name: 'GDP', file: 'WDI_GDP.xlsx', description: 'GDP growth and related indicators', indicators: ['GDP growth (annual %)'] },
  { name: 'Unemployment', file: 'WDI_Unemployment.xlsx', description: 'Unemployment rate', indicators: ['Unemployment, total (% of total labor force)'] },
  { name: 'Literacy', file: 'WDI_Literacy.xlsx', description: 'Literacy rate', indicators: ['Literacy rate, adult total (% of people ages 15 and above)'] },
  { name: 'Life Expectancy', file: 'WDI_Health.xlsx', description: 'Life expectancy and health indicators', indicators: ['Life expectancy at birth, total (years)'] },
  { name: 'Poverty', file: 'WDI_Poverty.xlsx', description: 'Poverty headcount ratio', indicators: ['Poverty headcount ratio at national poverty lines (% of population)'] },
  { name: 'CO2 Emissions', file: 'WDI_CO2_Emissions.xlsx', description: 'CO2 emissions per capita', indicators: ['CO2 emissions (metric tons per capita)'] },
  { name: 'Population', file: 'WDI_Population.xlsx', description: 'Total population', indicators: ['Population, total'] },
  { name: 'Infant Mortality', file: 'WDI_MortalityRate.xlsx', description: 'Infant mortality rate', indicators: ['Mortality rate, infant (per 1,000 live births)'] },
  { name: 'Health Expenditure', file: 'WDI_Health.xlsx', description: 'Current health expenditure', indicators: ['Current health expenditure (% of GDP)'] },
  { name: 'Education Spending', file: 'WDI_Education.xlsx', description: 'Government expenditure on education', indicators: ['Government expenditure on education, total (% of GDP)'] },
  { name: 'Infrastructure Investment', file: 'WDI_Infrastructure.xlsx', description: 'Gross fixed capital formation', indicators: ['Gross fixed capital formation (% of GDP)'] },
  { name: 'Renewable Energy', file: 'WDI_RenewableEnergy.xlsx', description: 'Renewable energy consumption', indicators: ['Renewable energy consumption (% of total final energy consumption)'] },
  { name: 'Gini Index', file: 'WDI_Gini.xlsx', description: 'Gini index (inequality)', indicators: ['Gini index'] },
  { name: 'Inflation', file: 'WDI_Inflation.xlsx', description: 'Inflation, consumer prices', indicators: ['Inflation, consumer prices (annual %)'] },
  { name: 'Internet', file: 'WDI_Internet.xlsx', description: 'Individuals using the Internet', indicators: ['Individuals using the Internet (% of population)'] },
  { name: 'Agriculture', file: 'WDI_Agriculture.xlsx', description: 'Agriculture, value added', indicators: ['Agriculture, value added (% of GDP)'] },
  { name: 'Manufacturing', file: 'WDI_Manufacturing.xlsx', description: 'Manufacturing, value added', indicators: ['Manufacturing, value added (% of GDP)'] },
  { name: 'Industry', file: 'WDI_Industry.xlsx', description: 'Industry, value added', indicators: ['Industry, value added (% of GDP)'] },
  { name: 'Services', file: 'WDI_Services.xlsx', description: 'Services, value added', indicators: ['Services, value added (% of GDP)'] },
  { name: 'Finance', file: 'WDI_Finance.xlsx', description: 'Domestic credit to private sector', indicators: ['Domestic credit to private sector (% of GDP)'] },
  { name: 'Trade Index', file: 'WDI_TradeIndex.xlsx', description: 'Trade openness index', indicators: ['Trade openness index'] }
];


// All trade, FDI, and logistics data is also loaded from Excel files in the /data folder.
// See the folder for: WB_Tariffs_Nation.xlsx, WB_Tariffs_Products.xlsx, WB_TotalExport.xlsx, WB_TotalImport.xlsx, WB_FDIInflow.xlsx, WB_FDIOutflow.xlsx, WB_Logistics.xlsx, WB_LPI_BorderClearance.xlsx, WB_LPI_Infrastructure.xlsx, WITS_[Country].xlsx


// All bilateral trade relationships are now loaded from the WITS_[Country].xlsx files and related Excel data.


// All data loading is now handled by the Excel loader utility, which reads from the above Excel files in the /data folder.