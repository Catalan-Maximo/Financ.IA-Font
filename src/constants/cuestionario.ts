/**
 * Cuestionario breve de perfil inversor (6 preguntas clave).
 * Cada opción suma de 1 a 5 puntos; la suma total (6 a 29)
 * se envía al backend para clasificar el perfil.
 *
 * Es la versión simplificada del test: menos preguntas, las que
 * más correlacionan con la tolerancia al riesgo real del usuario.
 */

/** Una opción de respuesta del cuestionario. */
export interface QuestionOption {
  letter: string;
  text: string;
  points: number;
}

/** Una pregunta del cuestionario. */
export interface Question {
  text: string;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    text: '¿Qué porcentaje de tus ingresos mensuales podés ahorrar de forma regular?',
    options: [
      { letter: 'A', text: 'Menos del 10%.', points: 1 },
      { letter: 'B', text: 'Entre el 10% y el 30%.', points: 3 },
      { letter: 'C', text: 'Más del 30%.', points: 5 },
    ],
  },
  {
    text: '¿Qué pasaría con tu nivel de vida si perdieras todo lo que vas a invertir?',
    options: [
      { letter: 'A', text: 'Tendría problemas graves para cubrir mis gastos básicos.', points: 1 },
      { letter: 'B', text: 'Me afectaría, pero podría mantener mi estilo de vida.', points: 3 },
      { letter: 'C', text: 'No afectaría en absoluto mi situación económica.', points: 5 },
    ],
  },
  {
    text: '¿Con qué frecuencia operaste instrumentos financieros en los últimos 2 años?',
    options: [
      { letter: 'A', text: 'Nunca, o solo plazos fijos y cuentas remuneradas.', points: 1 },
      { letter: 'B', text: 'Algunas veces al año.', points: 3 },
      { letter: 'C', text: 'Opero de forma activa todos los meses.', points: 5 },
    ],
  },
  {
    text: '¿Cuál es tu horizonte de inversión para este dinero?',
    options: [
      { letter: 'A', text: 'Corto plazo: lo necesito en menos de 6 meses.', points: 1 },
      { letter: 'B', text: 'Mediano plazo: entre 6 meses y 2 años.', points: 3 },
      { letter: 'C', text: 'Largo plazo: más de 2 años.', points: 5 },
    ],
  },
  {
    text: 'Invertiste $100.000 y a los 3 meses ves $80.000 (-20%). ¿Qué hacés?',
    options: [
      { letter: 'A', text: 'Vendo todo antes de que siga bajando.', points: 1 },
      { letter: 'B', text: 'No toco nada y espero a que se recupere.', points: 3 },
      { letter: 'C', text: 'Aprovecho la baja y compro más.', points: 5 },
    ],
  },
  {
    text: '¿Qué relación riesgo/retorno te deja dormir tranquilo?',
    options: [
      { letter: 'A', text: 'Rendimiento bajo pero seguro.', points: 1 },
      { letter: 'B', text: 'Rendimiento moderado con variaciones leves.', points: 3 },
      { letter: 'C', text: 'Rendimiento alto aunque el precio varíe fuerte.', points: 5 },
    ],
  },
];
