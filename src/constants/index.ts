import { colors } from '../theme/colors';

/** Valores por defecto de los formularios del simulador y del asesor. */
export const FORM_DEFAULTS = {
  monto: '100000',
  plazo: '6',
  inflacion: '4.0',
} as const;

/** Inflación mensual estimada usada en el dashboard (simulación). */
export const INFLACION_ESTIMADA_DASHBOARD = 4.0;

/** Colores de la insignia según nivel de riesgo (Asesor Virtual). */
export const RIESGO_ESTILOS: Record<string, { bg: string; texto: string }> = {
  Bajo: { bg: colors.successBg, texto: colors.primary },
  Medio: { bg: colors.warningBg, texto: colors.warning },
  Alto: { bg: colors.dangerBg, texto: colors.danger },
};
