import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { StockQuote, DollarQuote, PackQuote } from '../domain/markets';

/**
 * Hook de la sección Mercados: carga los tres bloques de datos
 * (acciones + packs, dólar) con un solo request en paralelo.
 * El JWT lo adjunta el interceptor de Axios.
 */
export default function useMarkets() {
  const [acciones, setAcciones] = useState<StockQuote[]>([]);
  const [packs, setPacks] = useState<PackQuote[]>([]);
  const [dollar, setDollar] = useState<DollarQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accionesRes, packsRes, dolarRes] = await Promise.all([
        api.get<StockQuote[]>('/markets/stocks'),
        api.get<PackQuote[]>('/markets/packs'),
        api.get<DollarQuote[]>('/markets/dollar'),
      ]);
      setAcciones(accionesRes.data);
      setPacks(packsRes.data);
      setDollar(dolarRes.data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { acciones, packs, dollar, loading, error, clearError: () => setError(false), reload: load };
}
