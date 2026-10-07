/** Tipos de la sección Mi Dinero (portafolio y metas). */

/** Una posición del portafolio con P&L calculado por el backend. */
export interface Posicion {
  id: number;
  activo: string;
  cantidad: number;
  precioCompra: number;
  precioActual: number;
  valorActual: number;
  ganancia: number;
  gananciaPct: number;
  fecha: string;
}

/** Una meta de ahorro. */
export interface MetaAhorro {
  id: number;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaLimite: string;
}

/** Activos que se pueden cargar al portafolio. */
export const ACTIVOS_PORTFOLIO = ['YPF', 'GGAL', 'AAPL', 'MSFT', 'SPY', 'Bitcoin', 'Ethereum'];
