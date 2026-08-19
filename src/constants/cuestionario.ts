/**
 * Cuestionario de perfil inversor (10 preguntas).
 * Cada opción suma puntos; al final, la suma total (8 a 49)
 * se envía al backend para clasificar el perfil.
 *
 * Bloques:
 *  A) Situación financiera y patrimonio (preguntas 1-3)
 *  B) Conocimiento y experiencia en mercados (preguntas 4-6)
 *  C) Objetivos y tolerancia al riesgo (preguntas 7-10)
 */

/** Una opción de respuesta del cuestionario. */
export interface OpcionCuestionario {
  letra: string;
  texto: string;
  puntos: number;
}

/** Una pregunta del cuestionario. */
export interface PreguntaCuestionario {
  texto: string;
  opciones: OpcionCuestionario[];
}

export const PREGUNTAS: PreguntaCuestionario[] = [
  {
    texto: '¿Cuál es tu principal fuente de ingresos actual?',
    opciones: [
      { letra: 'A', texto: 'Relación de dependencia o jubilación estable.', puntos: 1 },
      { letra: 'B', texto: 'Trabajo independiente / Profesional autónomo.', puntos: 2 },
      { letra: 'C', texto: 'Ingresos variables por negocios propios o rentas.', puntos: 4 },
      { letra: 'D', texto: 'No poseo ingresos fijos actuales.', puntos: 0 },
    ],
  },
  {
    texto: '¿Qué porcentaje de tus ingresos mensuales podés destinar al ahorro de forma regular?',
    opciones: [
      { letra: 'A', texto: 'Menos del 10%.', puntos: 1 },
      { letra: 'B', texto: 'Entre el 10% y el 30%.', puntos: 3 },
      { letra: 'C', texto: 'Más del 30%.', puntos: 5 },
    ],
  },
  {
    texto: '¿Qué pasaría con tu nivel de vida si perdieras el total del dinero que vas a invertir en esta app?',
    opciones: [
      { letra: 'A', texto: 'Tendría graves problemas económicos para cubrir mis gastos básicos.', puntos: 0 },
      { letra: 'B', texto: 'Me afectaría, pero podría mantener mi estilo de vida reduciendo gastos secundarios.', puntos: 3 },
      { letra: 'C', texto: 'No afectaría en absoluto mi situación económica ni mis planes futuros.', puntos: 5 },
    ],
  },
  {
    texto: '¿Con qué frecuencia operaste instrumentos financieros en los últimos 2 años?',
    opciones: [
      { letra: 'A', texto: 'Nunca operé o solo utilicé cuentas remuneradas / plazos fijos.', puntos: 1 },
      { letra: 'B', texto: 'Menos de 5 veces al año (compras muy ocasionales).', puntos: 2 },
      { letra: 'C', texto: 'Entre 5 y 12 veces al año (opero algunos meses).', puntos: 4 },
      { letra: 'D', texto: 'Más de una vez al mes de forma activa.', puntos: 5 },
    ],
  },
  {
    texto: 'Si escuchás el término "Volatilidad", ¿cómo lo interpretás en base a tus conocimientos?',
    opciones: [
      { letra: 'A', texto: 'Significa que voy a perder mi dinero con seguridad.', puntos: 1 },
      { letra: 'B', texto: 'Entiendo que el precio del activo puede subir o bajar, generando ganancias o pérdidas.', puntos: 3 },
      { letra: 'C', texto: 'Es una oportunidad de mercado para comprar activos más baratos y maximizar retornos.', puntos: 5 },
    ],
  },
  {
    texto: '¿Qué instrumentos financieros de esta lista conocés o comprendés cómo funcionan conceptualmente?',
    opciones: [
      { letra: 'A', texto: 'Solo Plazo Fijo, Cuentas Remuneradas y Dólar ahorro.', puntos: 1 },
      { letra: 'B', texto: 'Fondos Comunes de Inversión (FCI) y Bonos simples.', puntos: 3 },
      { letra: 'C', texto: 'Acciones, CEDEARs, Obligaciones Negociables o Criptomonedas.', puntos: 5 },
    ],
  },
  {
    texto: '¿Cuál es el horizonte temporal estimado para el cual estás invirtiendo este capital?',
    opciones: [
      { letra: 'A', texto: 'Corto Plazo: Menos de 6 meses (necesito liquidez rápida).', puntos: 1 },
      { letra: 'B', texto: 'Mediano Plazo: Entre 6 meses y 2 años.', puntos: 3 },
      { letra: 'C', texto: 'Largo Plazo: Más de 2 años.', puntos: 5 },
    ],
  },
  {
    texto: '¿Cuál es tu expectativa de rendimiento respecto a la inflación?',
    opciones: [
      { letra: 'A', texto: 'Me conformo con empatarle a la inflación o perder lo mínimo posible, priorizando la seguridad.', puntos: 1 },
      { letra: 'B', texto: 'Busco ganarle por unos puntos a la inflación asumiendo riesgos controlados.', puntos: 3 },
      { letra: 'C', texto: 'Busco ganarle ampliamente a la inflación asumiendo que puedo sufrir caídas importantes.', puntos: 5 },
    ],
  },
  {
    texto: 'Imagina que realizás una inversión de $100.000. Al cabo de tres meses, debido a una crisis global, el saldo en tu pantalla muestra $80.000 (-20%). ¿Qué acción tomás en la aplicación?',
    opciones: [
      { letra: 'A', texto: 'Vendo todo inmediatamente para retirar los $80.000 antes de que sigan bajando.', puntos: 1 },
      { letra: 'B', texto: 'Mantengo la calma, no opero y espero que los activos recuperen su valor histórico.', puntos: 3 },
      { letra: 'C', texto: 'Aprovecho la baja del precio para inyectar más capital y comprar más cantidad del activo.', puntos: 5 },
    ],
  },
  {
    texto: 'Seleccioná la relación Riesgo / Retorno con la que te sientas más cómodo operando:',
    opciones: [
      { letra: 'A', texto: 'Rendimiento bajo pero seguro (sé exactamente cuánto voy a cobrar al final).', puntos: 1 },
      { letra: 'B', texto: 'Rendimiento moderado con variaciones leves (puede bajar un poco, pero tiende a subir).', puntos: 3 },
      { letra: 'C', texto: 'Rendimiento potencialmente muy alto con variaciones extremas (puedo ganar mucho o perder mucho).', puntos: 5 },
    ],
  },
];
