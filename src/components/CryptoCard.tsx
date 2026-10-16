import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { CryptoState } from '../domain/crypto';

/** Tono del badge según veredicto: BUY verde, WATCH amarillo, AVOID rojo. */
const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface CryptoCardProps {
  state: CryptoState;
  /** Abre la pantalla de detalle con el análisis completo. */
  onPress?: () => void;
}

/**
 * Tarjeta de un par cripto: precio actual, RSI, variación de 3 días
 * y veredicto del análisis técnico (BUY/WATCH/AVOID).
 * Tocable para ver el detalle completo.
 */
export default function CryptoCard({ state, onPress }: CryptoCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const name = state.symbol.startsWith('BTC') ? 'Bitcoin' : 'Ethereum';
  const cambio = state.change3d;

  return (
    <Card style={s.card} onPress={onPress}>
      <View style={s.header}>
        <Text style={s.name} numberOfLines={1} maxFontSizeMultiplier={1.3}>{name}</Text>
        <Badge label={state.verdict} tone={TONO_VEREDICTO[state.verdict] ?? 'warning'} />
      </View>

      <Text style={s.price} numberOfLines={1} maxFontSizeMultiplier={1.3}>${state.price.toLocaleString('es-AR')}</Text>

      <View style={s.fila}>
        <Text style={s.label}>RSI (14)</Text>
        <Text style={s.value}>{state.rsi14 != null ? state.rsi14.toFixed(1) : 'n/d'}</Text>
      </View>
      <View style={s.fila}>
        <Text style={s.label}>Var. 3 días</Text>
        <Text
          style={[
            s.value,
            cambio != null && (cambio >= 0 ? s.green : s.red),
          ]}
        >
          {cambio != null ? `${cambio >= 0 ? '+' : ''}${cambio.toFixed(1)}%` : 'n/d'}
        </Text>
      </View>
    </Card>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    // flex: 1 estira la tarjeta al alto de la celda: las dos quedan simétricas
    card: { padding: spacing.lg, marginBottom: spacing.md, flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    name: { ...typography.callout, fontWeight: '600', color: colors.label },
    price: { ...typography.title3, fontWeight: '700', color: colors.label, marginBottom: spacing.md },
    fila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    value: { ...typography.footnote, fontWeight: '600', color: colors.label },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },
  });
