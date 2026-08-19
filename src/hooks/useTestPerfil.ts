import { useState } from 'react';
import api from '../lib/api';

/** Aviso para mostrar en pantalla (éxito u offline). */
export interface Aviso {
  titulo: string;
  mensaje: string;
}

/**
 * Hook del test de perfil inversor.
 * Encapsula el POST a /usuarios/perfil y el fallback offline:
 * si el backend no responde, el perfil se asigna localmente
 * y el flujo avanza igual.
 */
export default function useTestPerfil(onTestComplete: (perfil: string) => void) {
  const [loading, setLoading] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const finalizarTest = async (opcionSeleccionada: string) => {
    setLoading(true);
    let perfilCalculado = 'Moderado';

    if (opcionSeleccionada === 'A') perfilCalculado = 'Conservador';
    if (opcionSeleccionada === 'C') perfilCalculado = 'Agresivo';

    try {
      const response = await api.post('/usuarios/perfil', {
        nombre: 'Usuario Demo',
        email: 'demo@financia.com',
        perfilInversor: perfilCalculado,
      });

      setAviso({
        titulo: '¡Test Completado! 🎉',
        mensaje: `Tu perfil asignado es: ${response.data.perfilInversor}`,
      });
      onTestComplete(response.data.perfilInversor);
    } catch (error) {
      console.error(error);
      // Fallback: avanzamos con el perfil calculado localmente
      setAviso({
        titulo: 'Modo Offline ⚠️',
        mensaje: `No se pudo conectar al backend, pero tu perfil fue asignado localmente como: ${perfilCalculado}`,
      });
      onTestComplete(perfilCalculado);
    } finally {
      setLoading(false);
    }
  };

  return { loading, aviso, limpiarAviso: () => setAviso(null), finalizarTest };
}
