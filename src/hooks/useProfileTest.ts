import { useState } from 'react';
import api from '../lib/api';
import { saveProfile } from '../lib/storage';
import { QUESTIONS } from '../constants/cuestionario';
import { classifyProfileLocally } from '../domain/profile';

/** Aviso para mostrar en pantalla (éxito u offline). */
export interface Aviso {
  title: string;
  message: string;
}

/**
 * Hook del test de perfil inversor (6 preguntas clave).
 *
 * Acumula el puntaje a medida que el usuario responde. Al llegar
 * a la última pregunta, envía la suma total al backend
 * (POST /usuarios/perfil con { puntaje }) y el backend clasifica.
 *
 * Si el backend no responde, el perfil se clasifica localmente
 * (clasificarPerfilLocal) y el flujo avanza igual.
 */
export default function useProfileTest(onTestComplete: (profile: string) => void) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Aviso | null>(null);

  const currentQuestion = QUESTIONS[index];
  const totalQuestions = QUESTIONS.length;

  const answer = async (points: number) => {
    const newScore = score + points;

    // Si no es la última pregunta, avanzamos sin llamar al backend
    if (index + 1 < totalQuestions) {
      setScore(newScore);
      setIndex(index + 1);
      return;
    }

    // Última pregunta: enviamos la suma total al backend
    setLoading(true);
    try {
      const response = await api.post('/users/profile', {
        name: 'Usuario Demo',
        email: 'demo@financia.com',
        score: newScore,
      });

      const perfilAsignado = response.data.investorProfile;
      await saveProfileSafely(perfilAsignado);

      setNotice({
        title: 'Test Completado',
        message: `Tu puntaje: ${newScore} puntos. Perfil asignado: ${perfilAsignado}`,
      });
      onTestComplete(perfilAsignado);
    } catch (error) {
      console.error(error);
      // Fallback: clasificamos localmente y avanzamos igual
      const perfilLocal = classifyProfileLocally(newScore);
      await saveProfileSafely(perfilLocal);

      setNotice({
        title: 'Modo Offline',
        message: `No se pudo conectar al backend, pero tu perfil fue asignado localmente como: ${perfilLocal}`,
      });
      onTestComplete(perfilLocal);
    } finally {
      setLoading(false);
    }
  };

  /** Guarda el perfil localmente sin romper el flujo si el storage falla. */
  const saveProfileSafely = async (profile: string) => {
    try {
      await saveProfile(profile);
    } catch (error) {
      console.warn('No se pudo guardar el perfil en el dispositivo', error);
    }
  };

  return {
    currentQuestion,
    index,
    totalQuestions,
    loading,
    notice,
    clearNotice: () => setNotice(null),
    answer,
  };
}
