/**
 * Tipos de la sección Mercados (GET /mercados/...).
 * Mapean 1:1 con los DTOs del backend.
 */

/** Cotización de una acción/ETF (Yahoo Finance). */
export interface StockQuote {
  ticker: string;
  price: number;
  variation24h: number;
  /** Valoración por P/E: "Barata" / "Razonable" / "Cara" / "n/d". */
  priceValuation?: string;
}

/** Cotización de un tipo de dólar (DolarAPI). */
export interface DollarQuote {
  name: string;
  buyPrice: number;
  sellPrice: number;
  date: string;
}

/** Un activo dentro de un pack con su peso. */
export interface PackCompositionItem {
  ticker: string;
  percentage: number;
}

/** Un pack de inversión con su variación ponderada. */
export interface PackQuote {
  id: number;
  name: string;
  risk: 'Bajo' | 'Moderado' | 'Agresivo';
  variation24h: number;
  composition: PackCompositionItem[];
}

/** Un año de resultados de una empresa. */
export interface AnnualIncome {
  year: string;
  revenue: number;
  neto: number;
}

/** Fundamentales de una acción (Yahoo Finance). */
export interface Fundamentals {
  ticker: string;
  pe: number | null;
  priceValuation: 'Barata' | 'Razonable' | 'Cara' | 'n/d';
  revenueGrowthPct: number | null;
  netMarginPct: number | null;
  debt: number | null;
  cash: number | null;
  debtExceedsCash: boolean;
  annualIncomes: AnnualIncome[];
}
