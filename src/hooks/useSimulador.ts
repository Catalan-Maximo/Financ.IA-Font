import { useEffect, useState } from 'react';
import api from '../lib/api';
import { FORM_DEFAULTS } from '../constants';
import type { ComparacionRequest, ComparacionResponse } from '../domain/inversion';

/**
 * Hook del simulador de inversiones.
 * Maneja el estado del formulario, la validación y el POST
 * a /activos/comparar. La pantalla solo renderiza y muestra el error.
 */
export default function useSimulador() {
  const [monto, setMonto] = useState<string>(FORM_DEFAULTS.monto);
  const [plazo, setPlazo] = useState<string>(FORM_DEFAULTS.plazo);
  const [inflacion, setInflacion] = useState<string>(FORM_DEFAULTS.inflacion);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ComparacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Precargamos la inflación con el último IPC oficial (job del BCRA)
  useEffect(() => {
    api.get('/activos/inflacion')
      .then((r) => {
        const valor = r.data?.valor;
        if (valor && valor > 0) setInflacion(String(valor));
      })
      .catch(() => {});
  }, []);

  const simular = async () => {
    const montoNum = parseFloat(monto);
    const plazoNum = parseInt(plazo, 10);
    const inflacionNum = parseFloat(inflacion);

    if (isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresá un monto válido mayor a 0.');
      return;
    }
    if (isNaN(plazoNum) || plazoNum <= 0) {
      setError('Ingresá un plazo válido en meses.');
      return;
    }
    if (isNaN(inflacionNum) || inflacionNum < 0) {
      setError('Ingresá un porcentaje de inflación válido.');
      return;
    }

    setLoading(true);
    try {
      const body: ComparacionRequest = {
        monto: montoNum,
        plazoMeses: plazoNum,
        inflacionMensual: inflacionNum,
      };
      // La comparación ahora incluye acciones/cripto (consultas a Yahoo y Binance):
      // le damos más tiempo que el default de 5s
      const response = await api.post<ComparacionResponse>('/activos/comparar', body, { timeout: 30000 });
      setResultado(response.data);
    } catch (e) {
      console.error(e);
      setError('No se pudo conectar con el backend para simular.');
    } finally {
      setLoading(false);
    }
  };

  return {
    monto, setMonto,
    plazo, setPlazo,
    inflacion, setInflacion,
    loading,
    resultado,
    error, limpiarError: () => setError(null),
    simular,
  };
}
