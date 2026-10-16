import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { Expense, SavingsGoal, Position, ExpensesSummary } from '../domain/myMoney';

/**
 * Hook de Mi Dinero: posiciones del portafolio y metas de ahorro
 * con sus acciones (agregar, aportar, eliminar).
 */
export default function useMyMoney() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [resumen, setResumen] = useState<ExpensesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // allSettled: si un endpoint falla, los demás igual cargan
    const [pos, met, gas, res] = await Promise.allSettled([
      api.get<Position[]>('/my-money/positions'),
      api.get<SavingsGoal[]>('/my-money/goals'),
      api.get<Expense[]>('/my-money/expenses'),
      api.get<ExpensesSummary>('/my-money/expenses/summary'),
    ]);

    if (pos.status === 'fulfilled') setPositions(pos.value.data);
    else console.warn('posiciones no cargaron', pos.reason?.message);

    if (met.status === 'fulfilled') setGoals(met.value.data);
    else console.warn('metas no cargaron', met.reason?.message);

    if (gas.status === 'fulfilled') setExpenses(gas.value.data);
    else console.warn('gastos no cargaron', gas.reason?.message);

    if (res.status === 'fulfilled') setResumen(res.value.data);
    else console.warn('resumen no cargó', res.reason?.message);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPosition = async (asset: string, quantity: number, purchasePrice: number) => {
    await api.post('/my-money/positions', { asset, quantity, purchasePrice });
    await load();
  };

  const deletePosition = async (id: number) => {
    await api.delete(`/my-money/positions/${id}`);
    await load();
  };

  const createGoal = async (name: string, targetAmount: number, deadline: string) => {
    await api.post('/my-money/goals', { name, targetAmount, deadline });
    await load();
  };

  const aportarMeta = async (id: number, amount: number) => {
    await api.post(`/my-money/goals/${id}/contribution`, { amount });
    await load();
  };

  const deleteGoal = async (id: number) => {
    await api.delete(`/my-money/goals/${id}`);
    await load();
  };

  const addExpense = async (category: string, description: string, amount: number) => {
    await api.post('/my-money/expenses', { category, description, amount });
    await load();
  };

  const deleteExpense = async (id: number) => {
    await api.delete(`/my-money/expenses/${id}`);
    await load();
  };

  const saveIncome = async (amount: number) => {
    await api.post('/my-money/income', { amount });
    await load();
  };

  return {
    positions, goals, expenses, resumen, loading,
    addPosition, deletePosition,
    createGoal, aportarMeta, deleteGoal,
    addExpense, deleteExpense, saveIncome,
  };
}
