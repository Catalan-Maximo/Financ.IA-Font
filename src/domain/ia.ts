import type { Performance } from './investment';

/**
 * Tipos para el asesor virtual de IA.
 * Mapean 1:1 con los DTOs del backend (com.FinancIA.api.dto).
 */

/** Request body para POST /ia/simular */
export interface AIRequest {
  /** Perfil de riesgo: "Conservador", "Moderado" o "Agresivo". */
  investorProfile: string;
  /** Monto disponible para invertir en pesos. */
  amount: number;
  /** Plazo de inversión deseado en meses. */
  months: number;
  /** Inflación mensual estimada (%, ej. 4.0 = 4%). */
  monthlyInflation: number;
  /** Activo A a comparar (opcional). */
  activoA?: string;
  /** Activo B a comparar (opcional). */
  activoB?: string;
}

/** Una asignación porcentual del portafolio sugerido. */
export interface Allocation {
  /** Tipo de activo (ej. "Billetera Virtual", "Plazo Fijo", "Dólar / Cobertura"). */
  assetType: string;
  /** Porcentaje sugerido del portafolio (0-100). */
  percentage: number;
  /** Justificación breve de la asignación. */
  reason: string;
}

/** Response de POST /ia/simular */
export interface AIResponse {
  /** Perfil de riesgo utilizado para la recomendación. */
  investorProfile: string;
  /** Texto de recomendación generado por la IA. */
  recommendation: string;
  /** Nivel de riesgo general: "Bajo", "Medio", "Alto". */
  riskLevel: string;
  /** Distribución sugerida del portafolio. */
  suggestedAllocation: Allocation[];
  /** Rendimientos proyectados para cada activo del mercado. */
  performances: Performance[];
  /** Ganancia real total estimada en $ al final del plazo. */
  estimatedRealGain: number;
  /** Resumen breve de la estrategia. */
  strategySummary: string;
}
