import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ExplainWithAI from '../components/ExplainWithAI';
import BackButton from '../components/BackButton';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { PackQuote } from '../domain/markets';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TONO_RIESGO: Record<string, 'success' | 'warning' | 'danger'> = {
  Bajo: 'success',
  Moderado: 'warning',
  Agresivo: 'danger',
};

interface PackDetailProps {
  pack: PackQuote;
  onBack: () => void;
}

/**
 * Detalle de un pack: variación ponderada y composición con
 * porcentajes reales de la base de datos.
 */
export default function PackDetailScreen({ pack, onBack }: PackDetailProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <BackButton onPress={onBack} />

        <View style={s.encabezado}>
          <Header text={pack.name} level="title" />
          <Badge label={`Riesgo: ${pack.risk}`} tone={TONO_RIESGO[pack.risk] ?? 'warning'} />
        </View>
        <Text style={[s.variation, pack.variation24h >= 0 ? s.green : s.red]}>
          {pack.variation24h >= 0 ? '+' : ''}{pack.variation24h.toFixed(2)}% hoy
        </Text>
        <Text style={s.nota}>
          La variación del pack es el promedio ponderado de la variación real de cada asset que lo compone.
        </Text>

        <Card style={s.card}>
          <Header text="Composición" level="section" style={s.seccionTitle} />
          {pack.composition.map((item) => (
            <View key={item.ticker} style={s.fila}>
              <View style={s.filaIzq}>
                <View style={s.miniLogo}>
                  <Text style={s.miniLogoText}>{item.ticker.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={s.ticker}>{item.ticker}</Text>
              </View>
              <Text style={s.percentage}>{item.percentage}%</Text>
            </View>
          ))}
        </Card>

        <ExplainWithAI data={
          `Pack "${pack.name}" (riesgo ${pack.risk}): hoy rindió ${pack.variation24h >= 0 ? '+' : ''}${pack.variation24h.toFixed(2)}%. ` +
          `Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: Composición: ${pack.composition.map((c) => `${c.ticker} ${c.percentage}%`).join(', ')}.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    variation: { ...typography.title2, fontWeight: '700', marginBottom: spacing.sm },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },
    nota: { ...typography.caption1, color: colors.secondaryLabel, marginBottom: spacing.xl },

    card: { padding: spacing.lg, marginBottom: spacing.xl },
    seccionTitle: { marginBottom: spacing.lg },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    filaIzq: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    miniLogo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniLogoText: { ...typography.caption2, fontWeight: '700', color: colors.label },
    ticker: { ...typography.body, fontWeight: '600', color: colors.label },
    percentage: { ...typography.body, fontWeight: '700', color: colors.brand },

    button: { marginTop: spacing.sm },
  });
