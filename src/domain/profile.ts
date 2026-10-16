/**
 * Clasificación del perfil inversor por puntuación.
 * Espejo del backend (PerfilInversorService) — se usa en el
 * modo offline cuando el backend no responde.
 */

/** Perfiles posibles. */
export type InvestorProfile = 'Conservador' | 'Moderado' | 'Agresivo';

/** Rangos de puntuación (test breve de 6 preguntas: 6 a 29). */
export const SCORE_RANGES = {
  conservativeMax: 13,
  moderateMax: 23,
  aggressiveMin: 24,
} as const;

/**
 * Clasifica un puntaje en un perfil inversor.
 * Valores fuera de rango se clasifican al extremo más cercano.
 */
export function classifyProfileLocally(score: number): InvestorProfile {
  if (score <= SCORE_RANGES.conservativeMax) return 'Conservador';
  if (score <= SCORE_RANGES.moderateMax) return 'Moderado';
  return 'Agresivo';
}
