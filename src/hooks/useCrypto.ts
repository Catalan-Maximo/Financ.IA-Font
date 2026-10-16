import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { CryptoAlert, CryptoState, CryptoInfo } from '../domain/crypto';

/**
 * Hook que carga el estado cripto (GET /cripto/estado), las señales
 * (GET /cripto/alertas) y las criptos extra informativas.
 */
export default function useCrypto() {
  const [crypto, setCrypto] = useState<CryptoState[]>([]);
  const [alerts, setAlerts] = useState<CryptoAlert[]>([]);
  const [extras, setExtras] = useState<CryptoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [state, senales, info] = await Promise.all([
        api.get<CryptoState[]>('/crypto/state'),
        api.get<CryptoAlert[]>('/crypto/alerts'),
        api.get<CryptoInfo[]>('/markets/crypto-info'),
      ]);
      setCrypto(state.data);
      setAlerts(senales.data);
      setExtras(info.data);
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

  return { crypto, alerts, extras, loading, error, clearError: () => setError(false), reload: load };
}
