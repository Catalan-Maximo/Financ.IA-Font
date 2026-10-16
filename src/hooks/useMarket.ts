import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { Asset } from '../domain/asset';

/**
 * Hook que carga las tasas de mercado (GET /activos/tasas).
 * Encapsula fetching, estado de carga y error — la pantalla
 * solo renderiza y muestra el alert cuando hay error.
 */
export default function useMarket() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<Asset[]>('/assets/rates');
      setAssets(response.data);
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

  return { assets, loading, error, clearError: () => setError(false), reload: load };
}
