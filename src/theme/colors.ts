/**
 * Paleta de colores de FinancIA.
 * Fuente única de verdad para todos los estilos de la app —
 * nunca hardcodees colores en las pantallas, importá desde acá.
 */
export const colors = {
  // Fondos
  background: '#121214',
  surface: '#202024',
  surfaceLight: '#29292E',

  // Bordes y divisores
  border: '#323238',

  // Marca
  primary: '#00B37E',
  primaryDark: '#00875F',

  // Textos
  text: '#FFFFFF',
  textPrimary: '#E1E1E6',
  textSecondary: '#C4C4CC',
  textMuted: '#8D8D99',
  textFaint: '#7C7C8A',

  // Estados y badges
  danger: '#F75A68',
  warning: '#FBA94C',
  badgeBg: '#293845',
  successBg: '#1B3A2D',
  dangerBg: '#3D1F24',
  warningBg: '#3D3320',
} as const;
