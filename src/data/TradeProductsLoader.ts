
let tradeProductsData: any = null;

export async function loadTradeProductsData(): Promise<void> {
  if (tradeProductsData) return;
  const response = await fetch('/BilateralTradeProducts.json');
  if (!response.ok) throw new Error('Failed to load BilateralTradeProducts.json');
  tradeProductsData = await response.json();
}

export interface TradeProductsData {
  imports: {
    [country: string]: {
      [partner: string]: string[];
    };
  };

  exports: {
    [country: string]: {
      [partner: string]: string[];
    };
  };
}

export function getBilateralTradeProducts(): TradeProductsData {
  if (!tradeProductsData) throw new Error('Trade products data not loaded. Call loadTradeProductsData() first.');
  return tradeProductsData;
}


export function getImportProducts(importer: string, exporter: string): string[] {
  return getBilateralTradeProducts().imports[importer]?.[exporter] || [];
}

export function getExportProducts(exporter: string, importer: string): string[] {
  return getBilateralTradeProducts().exports[exporter]?.[importer] || [];
}


export function getAllTradingPartners(country: string): string[] {
  const partners = new Set<string>();
  const data = getBilateralTradeProducts();
  // Add import partners
  if (data.imports[country]) {
    Object.keys(data.imports[country]).forEach(partner => {
      partners.add(partner);
    });
  }
  // Add export partners
  if (data.exports[country]) {
    Object.keys(data.exports[country]).forEach(partner => {
      partners.add(partner);
    });
  }
  return Array.from(partners);
}


export function getTradeIntensity(country1: string, country2: string): number {
  const imports = getImportProducts(country1, country2);
  const exports = getExportProducts(country1, country2);
  // Simple intensity calculation based on number of traded products
  const totalProducts = imports.length + exports.length;
  return Math.min(100, totalProducts * 5); // Scale to 0-100
}


export function getMainTradeProducts(country1: string, country2: string): {
  imports: string[];
  exports: string[];
  total: string[];
} {
  const imports = getImportProducts(country1, country2);
  const exports = getExportProducts(country1, country2);
  const total = [...new Set([...imports, ...exports])];
  return { imports, exports, total };
}