import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { CriptoAlerta, CriptoEstado } from '../domain/cripto';

/**
 * Hook que carga el estado cripto (GET /cripto/estado) y las señales
 * (GET /cripto/alertas). El interceptor de Axios adjunta el JWT.
 */
export default function useCripto() {
  const [cripto, setCripto] = useState<CriptoEstado[]>([]);
  const [alertas, setAlertas] = useState<CriptoAlerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [estado, senales] = await Promise.all([
        api.get<CriptoEstado[]>('/cripto/estado'),
        api.get<CriptoAlerta[]>('/cripto/alertas'),
      ]);
      setCripto(estado.data);
      setAlertas(senales.data);
      setError(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { cripto, alertas, loading, error, limpiarError: () => setError(false), recargar: cargar };
}
