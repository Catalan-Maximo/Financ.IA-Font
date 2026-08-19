/**
 * Tipos para el simulador de inversiones.
 * Mapean 1:1 con los DTOs del backend (com.FinancIA.api.dto).
 */

/** Request body para POST /activos/comparar */
export interface ComparacionRequest {
  /** Monto en pesos a invertir. */
  monto: number;
  /** Plazo de la inversión en meses. */
  plazoMeses: number;
  /** Inflación mensual estimada (%, ej. 4.0 = 4%). */
  inflacionMensual: number;
}

/** Detalle de rendimiento calculado para un activo individual. */
export interface RendimientoDTO {
  entidad: string;
  tipo: string;
  /** Tasa Nominal Anual. */
  tna: number;
  /** Tasa Efectiva Mensual (%). */
  tasaEfectivaMensual: number;
  /** Tasa Real Mensual ajustada por inflación (%). */
  tasaRealMensual: number;
  /** Ganancia nominal proyectada en $ al final del plazo. */
  gananciaNominal: number;
  /** Ganancia real (ajustada por inflación) en $ al final del plazo. */
  gananciaReal: number;
  /** true si la tasa real supera la inflación. */
  leGanaALaInflacion: boolean;
}

/** Response de POST /activos/comparar */
export interface ComparacionResponse {
  montoInvertido: number;
  plazoMeses: number;
  inflacionMensualUsada: number;
  rendimientos: RendimientoDTO[];
  /** Entidad con la mejor tasa real. */
  mejorOpcion: string;
}
