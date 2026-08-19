import { useState } from 'react';
import api from '../lib/api';
import { PREGUNTAS } from '../constants/cuestionario';
import { clasificarPerfilLocal } from '../domain/perfil';

/** Aviso para mostrar en pantalla (éxito u offline). */
export interface Aviso {
  titulo: string;
  mensaje: string;
}

/**
 * Hook del test de perfil inversor (10 preguntas).
 *
 * Acumula el puntaje a medida que el usuario responde. Al llegar
 * a la última pregunta, envía la suma total al backend
 * (POST /usuarios/perfil con { puntaje }) y el backend clasifica.
 *
 * Si el backend no responde, el perfil se clasifica localmente
 * (clasificarPerfilLocal) y el flujo avanza igual.
 */
export default function useTestPerfil(onTestComplete: (perfil: string) => void) {
  const [indice, setIndice] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const preguntaActual = PREGUNTAS[indice];
  const totalPreguntas = PREGUNTAS.length;

  const responder = async (puntos: number) => {
    const nuevoPuntaje = puntaje + puntos;

    // Si no es la última pregunta, avanzamos sin llamar al backend
    if (indice + 1 < totalPreguntas) {
      setPuntaje(nuevoPuntaje);
      setIndice(indice + 1);
      return;
    }

    // Última pregunta: enviamos la suma total al backend
    setLoading(true);
    try {
      const response = await api.post('/usuarios/perfil', {
        nombre: 'Usuario Demo',
        email: 'demo@financia.com',
        puntaje: nuevoPuntaje,
      });

      setAviso({
        titulo: '¡Test Completado! 🎉',
        mensaje: `Tu puntaje: ${nuevoPuntaje} puntos. Perfil asignado: ${response.data.perfilInversor}`,
      });
      onTestComplete(response.data.perfilInversor);
    } catch (error) {
      console.error(error);
      // Fallback: clasificamos localmente y avanzamos igual
      const perfilLocal = clasificarPerfilLocal(nuevoPuntaje);
      setAviso({
        titulo: 'Modo Offline ⚠️',
        mensaje: `No se pudo conectar al backend, pero tu perfil fue asignado localmente como: ${perfilLocal}`,
      });
      onTestComplete(perfilLocal);
    } finally {
      setLoading(false);
    }
  };

  return {
    preguntaActual,
    indice,
    totalPreguntas,
    loading,
    aviso,
    limpiarAviso: () => setAviso(null),
    responder,
  };
}
