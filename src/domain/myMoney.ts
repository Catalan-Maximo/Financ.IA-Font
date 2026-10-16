/** Tipos de la sección Mi Dinero (portafolio y metas). */

/** Una posición del portafolio con P&L calculado por el backend. */
export interface Position {
  id: number;
  asset: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  gain: number;
  gainPct: number;
  date: string;
  /** true si cayó 10% o más desde el precio de compra (stop-loss). */
  alert: boolean;
}

/** Una meta de ahorro. */
export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

/** Activos que se pueden cargar al portafolio. */
export const PORTFOLIO_ASSETS = ['YPF', 'GGAL', 'AAPL', 'MSFT', 'SPY', 'Bitcoin', 'Ethereum'];

/** Categorías de gastos del mes. */
export const EXPENSE_CATEGORIES = ['Comida', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Otros'];

/** Un gasto del mes. */
export interface Expense {
  id: number;
  category: string;
  description: string | null;
  amount: number;
  date: string;
}

/** Resumen del mes: total, sobra, categorías y metas. */
export interface ExpensesSummary {
  total: number;
  income: number;
  hasIncome?: boolean;
  leftover?: number | null;
  byCategory: Record<string, number>;
  monthlyGoals: { name: string; remaining: number; perMonth: number }[];
}
