/**
 * Clasificación del perfil inversor por puntuación.
 * Espejo del backend (PerfilInversorService) — se usa en el
 * modo offline cuando el backend no responde.
 */

/** Perfiles posibles. */
export type PerfilInversor = 'Conservador' | 'Moderado' | 'Agresivo';

/** Rangos de puntuación (8 a 49). */
export const RANGOS_PUNTAJE = {
  conservadorMax: 18,
  moderadoMax: 35,
  agresivoMin: 36,
} as const;

/**
 * Clasifica un puntaje en un perfil inversor.
 * Valores fuera de rango se clasifican al extremo más cercano.
 */
export function clasificarPerfilLocal(puntaje: number): PerfilInversor {
  if (puntaje <= RANGOS_PUNTAJE.conservadorMax) return 'Conservador';
  if (puntaje <= RANGOS_PUNTAJE.moderadoMax) return 'Moderado';
  return 'Agresivo';
}
