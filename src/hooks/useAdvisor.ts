import { useEffect, useState } from 'react';
import api from '../lib/api';
import { FORM_DEFAULTS } from '../constants';
import type { AIRequest, AIResponse } from '../domain/ia';

/**
 * Hook del asesor virtual.
 * Maneja el estado del formulario, la validación y el POST
 * a /ia/simular. El perfil viene de App y no se pide al usuario.
 */
export default function useAdvisor(profile: string) {
  const [amount, setAmount] = useState<string>(FORM_DEFAULTS.amount);
  const [term, setTerm] = useState<string>(FORM_DEFAULTS.term);
  const [inflation, setInflation] = useState<string>(FORM_DEFAULTS.inflation);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Precargamos la inflación con el último IPC oficial (job del BCRA)
  useEffect(() => {
    api.get('/assets/inflacion')
      .then((r) => {
        const value = r.data?.value;
        if (value && value > 0) setInflation(String(value));
      })
      .catch(() => {});
  }, []);

  const consult = async () => {
    const montoNum = parseFloat(amount);
    const plazoNum = parseInt(term, 10);
    const inflacionNum = parseFloat(inflation);

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
      const body: AIRequest = {
        investorProfile: profile,
        amount: montoNum,
        months: plazoNum,
        monthlyInflation: inflacionNum,
      };
      // El asesor consulta mercados + Groq: le damos más tiempo que el default
      const response = await api.post<AIResponse>('/ia/simulate', body, { timeout: 30000 });
      setResponse(response.data);
    } catch (e) {
      console.error(e);
      setError('No se pudo conectar con el asesor virtual.');
    } finally {
      setLoading(false);
    }
  };

  return {
    amount, setAmount,
    term, setTerm,
    inflation, setInflation,
    loading,
    response,
    error, clearError: () => setError(null),
    consult,
  };
}
