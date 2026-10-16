import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import type { PackQuote } from '../domain/markets';

/** Tono del badge según riesgo del pack. */
const TONO_RIESGO: Record<string, 'success' | 'warning' | 'danger'> = {
  Bajo: 'success',
  Moderado: 'warning',
  Agresivo: 'danger',
};

interface PackCardProps {
  pack: PackQuote;
  onPress: () => void;
}

/**
 * Tarjeta horizontal de un pack de inversión (estilo Lemon):
 * etiqueta de riesgo, nombre, variación y fila de mini-logos.
 */
export default function PackCard({ pack, onPress }: PackCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={onPress}>
      <Badge label={`Riesgo: ${pack.risk}`} tone={TONO_RIESGO[pack.risk] ?? 'warning'} style={s.badge} />
      <Text style={s.name}>{pack.name}</Text>
      <Text style={[s.variation, pack.variation24h >= 0 ? s.green : s.red]}>
        {pack.variation24h >= 0 ? '+' : ''}{pack.variation24h.toFixed(2)}% hoy
      </Text>

      <View style={s.logos}>
        {pack.composition.slice(0, 4).map((item) => (
          <View key={item.ticker} style={s.miniLogo}>
            <Text style={s.miniLogoText}>{item.ticker.substring(0, 2).toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    card: {
      width: 180,
      padding: spacing.lg,
      borderRadius: 16,
      backgroundColor: colors.secondarySystemBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      marginRight: spacing.md,
    },
    cardPressed: { opacity: 0.8 },
    badge: { alignSelf: 'flex-start', marginBottom: spacing.md },
    name: { ...typography.headline, fontWeight: '600', color: colors.label, marginBottom: spacing.xs },
    variation: { ...typography.footnote, fontWeight: '600', marginBottom: spacing.md },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },
    logos: { flexDirection: 'row', gap: spacing.sm },
    miniLogo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniLogoText: { ...typography.caption2, fontWeight: '700', color: colors.label },
  });
