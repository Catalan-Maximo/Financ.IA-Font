/**
 * Tipos para el simulador de inversiones.
 * Mapean 1:1 con los DTOs del backend (com.FinancIA.api.dto).
 */

/** Request body para POST /activos/comparar */
export interface ComparisonRequest {
  /** Monto en pesos a invertir. */
  amount: number;
  /** Plazo de la inversión en meses. */
  months: number;
  /** Inflación mensual estimada (%, ej. 4.0 = 4%). */
  monthlyInflation: number;
}

/** Detalle de rendimiento calculado para un activo individual. */
export interface Performance {
  entity: string;
  type: string;
  /** Tasa Nominal Anual. */
  tna: number;
  /** Tasa Efectiva Mensual (%). */
  effectiveMonthlyRate: number;
  /** Tasa Real Mensual ajustada por inflación (%). */
  realMonthlyRate: number;
  /** Ganancia nominal proyectada en $ al final del plazo. */
  nominalGain: number;
  /** Ganancia real (ajustada por inflación) en $ al final del plazo. */
  realGain: number;
  /** true si la tasa real supera la inflación. */
  beatsInflation: boolean;
  /** Percentil 5 del retorno total (Monte Carlo), null en renta fija. */
  worstCase: number | null;
  /** Percentil 95 del retorno total (Monte Carlo), null en renta fija. */
  bestCase: number | null;
  /** Nivel de riesgo según volatilidad histórica. */
  risk: string;
}

/** Response de POST /activos/comparar */
export interface ComparisonResponse {
  investedAmount: number;
  months: number;
  monthlyInflationUsed: number;
  performances: Performance[];
  /** Entidad con la mejor tasa real. */
  bestOption: string;
}
