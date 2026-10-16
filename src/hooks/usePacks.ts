import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { PackQuote } from '../domain/markets';

/**
 * Hook que carga los packs de inversión (GET /mercados/packs).
 * El JWT lo adjunta el interceptor de Axios.
 */
export default function usePacks() {
  const [packs, setPacks] = useState<PackQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await api.get<PackQuote[]>('/markets/packs');
      setPacks(response.data);
    } catch (e) {
      console.warn('No se pudieron cargar los packs', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { packs, loading };
}
