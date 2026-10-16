/**
 * Snapshot del análisis técnico de un par cripto.
 * Mapea 1:1 con la entidad CriptoEstado del backend (GET /cripto/estado).
 */
/** Señal emitida por el backend cuando cambió el veredicto (GET /cripto/alertas). */
export interface CryptoAlert {
  symbol: string;
  currentVerdict: string;
  previousVerdict: string;
  message: string;
}

/** Un cierre diario para el gráfico (GET /cripto/velas/{simbolo}). */
export interface DailyCandle {
  date: string;
  close: number;
}

/** Cripto extra: solo informativa (precio y variación), sin análisis. */
export interface CryptoInfo {
  symbol: string;
  name: string;
  price: number;
  variation24h: number;
}

/** Una regla del checklist con su resultado. */
export interface CryptoCheck {
  label: string;
  passed: boolean;
  detail: string;
}

/**
 * Recalcula las 4 reglas del checklist (espejo del backend
 * CriptoChecklistService) para mostrar el "por qué" del veredicto.
 */
export function analyzeChecks(state: CryptoState): CryptoCheck[] {
  const supportDistance = ((state.price - state.support20) / state.support20) * 100;

  return [
    {
      label: 'Contexto de fondo no bajista',
      passed: state.sma200 != null && state.price >= state.sma200 * 0.97,
      detail: state.sma200 != null
        ? `Precio $${state.price.toFixed(2)} vs SMA200*0.97 $${(state.sma200 * 0.97).toFixed(2)}`
        : 'SMA200 aún no disponible',
    },
    {
      label: 'Cerca del soporte de 20 días',
      passed: supportDistance <= 4,
      detail: `${supportDistance.toFixed(1)}% sobre el soporte ($${state.support20.toFixed(2)})`,
    },
    {
      label: 'RSI(14) sin sobrecompra',
      passed: state.rsi14 != null && state.rsi14 < 70,
      detail: state.rsi14 != null ? `RSI ${state.rsi14.toFixed(1)}` : 'RSI aún no disponible',
    },
    {
      label: 'No persiguiendo una suba fuerte',
      passed: state.change3d != null && state.change3d <= 12,
      detail: state.change3d != null ? `Variación 3 días: ${state.change3d.toFixed(1)}%` : 'Sin datos suficientes',
    },
  ];
}

export interface CryptoState {
  /** Par analizado (BTCUSDT / ETHUSDT). */
  symbol: string;
  /** Fecha del snapshot. */
  date: string;
  /** Precio de cierre actual en USD. */
  price: number;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  support20: number;
  resistance20: number;
  /** Variación % de los últimos 3 días. */
  change3d: number | null;
  /** Cuántas de las 4 reglas pasaron. */
  checksPassed: number;
  /** BUY / WATCH / AVOID. */
  verdict: 'BUY' | 'WATCH' | 'AVOID';
  source: string;
}
