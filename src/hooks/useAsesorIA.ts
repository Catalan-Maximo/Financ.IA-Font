import { useState } from 'react';
import api from '../lib/api';
import { FORM_DEFAULTS } from '../constants';
import type { IARequest, IAResponse } from '../domain/ia';

/**
 * Hook del asesor virtual.
 * Maneja el estado del formulario, la validación y el POST
 * a /ia/simular. El perfil viene de App y no se pide al usuario.
 */
export default function useAsesorIA(perfil: string) {
  const [monto, setMonto] = useState<string>(FORM_DEFAULTS.monto);
  const [plazo, setPlazo] = useState<string>(FORM_DEFAULTS.plazo);
  const [inflacion, setInflacion] = useState<string>(FORM_DEFAULTS.inflacion);
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<IAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultar = async () => {
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
      const body: IARequest = {
        perfilInversor: perfil,
        monto: montoNum,
        plazoMeses: plazoNum,
        inflacionMensual: inflacionNum,
      };
      const response = await api.post<IAResponse>('/ia/simular', body);
      setRespuesta(response.data);
    } catch (e) {
      console.error(e);
      setError('No se pudo conectar con el asesor virtual.');
    } finally {
      setLoading(false);
    }
  };

  return {
    monto, setMonto,
    plazo, setPlazo,
    inflacion, setInflacion,
    loading,
    respuesta,
    error, limpiarError: () => setError(null),
    consultar,
  };
}
