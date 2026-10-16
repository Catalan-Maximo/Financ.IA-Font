import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export interface ChartPoint {
  date: string;
  value: number;
}

interface GraficoBarrasProps {
  /** Puntos ordenados cronológicamente. */
  points: ChartPoint[];
  /** Alto del gráfico en px. */
  alto?: number;
  /** Formato de los valores en las etiquetas (ej. "$" para precios). */
  prefijo?: string;
}

/**
 * Gráfico de barras sin dependencias: normaliza los valores al alto
 * disponible, verde si la serie subió, rojo si bajó.
 */
export default function BarChart({ points, alto = 110, prefijo = '' }: GraficoBarrasProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  if (points.length < 2) return null;

  const valores = points.map((p) => p.value);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = Math.max(max - min, 0.0001);
  const alza = valores[valores.length - 1] >= valores[0];

  const formato = (v: number) => `${prefijo}${v.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;

  return (
    <View>
      <View style={[s.grafico, { height: alto }]}>
        {points.map((p) => (
          <View
            key={p.date}
            style={[
              s.barra,
              {
                height: Math.max(((p.value - min) / rango) * alto, 4),
                backgroundColor: alza ? colors.systemGreen : colors.systemRed,
              },
            ]}
          />
        ))}
      </View>
      <View style={s.etiquetas}>
        <Text style={s.etiqueta}>{formato(min)}</Text>
        <Text style={s.etiqueta}>{formato(max)}</Text>
      </View>
      <View style={s.fechas}>
        <Text style={s.etiqueta}>{points[0].date}</Text>
        <Text style={s.etiqueta}>{points[points.length - 1].date}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    grafico: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
      marginBottom: spacing.sm,
    },
    barra: { flex: 1, borderRadius: 2, opacity: 0.85 },
    etiquetas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    fechas: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    etiqueta: { ...typography.caption2, color: colors.tertiaryLabel },
  });
