import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import BackButton from '../components/BackButton';
import Warning from '../components/Warning';
import Screen from '../components/Screen';
import BarChart, { type ChartPoint } from '../components/BarChart';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { CryptoInfo } from '../domain/crypto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface CriptoInfoProps {
  info: CryptoInfo;
  onBack: () => void;
}

/**
 * Detalle informativo de una cripto extra: precio, variación 24h y
 * gráfico de 3 meses. Sin análisis técnico (eso es solo para BTC/ETH).
 */
export default function CryptoInfoScreen({ info, onBack }: CriptoInfoProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [candles, setCandles] = useState<ChartPoint[]>([]);

  useEffect(() => {
    api.get<ChartPoint[]>(`/crypto/candles/${info.symbol}?days=90`)
      .then((r) => setCandles(r.data))
      .catch(() => {});
  }, [info.symbol]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BackButton onPress={onBack} />

        <Header text={info.name} level="title" style={s.title} />
        <Text style={s.price} numberOfLines={1}>${info.price.toLocaleString('es-AR', { maximumFractionDigits: 4 })}</Text>
        <Text style={[s.variation, info.variation24h >= 0 ? s.green : s.red]}>
          {info.variation24h >= 0 ? '+' : ''}{info.variation24h.toFixed(2)}% últimas 24h
        </Text>

        {candles.length > 1 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 3 meses" level="section" style={s.seccion} />
            <BarChart points={candles} prefijo="$" />
          </Card>
        )}

        <Warning text={
          'Esta cripto es solo informativa: no tiene el análisis técnico ni los ' +
          'veredictos de compra que damos para Bitcoin y Ethereum. Las cripto son ' +
          'muy volátiles y pueden bajar 20% o más en pocos días.'
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    title: { marginBottom: spacing.sm },
    price: { ...typography.title1, fontWeight: '700', color: colors.label },
    variation: { ...typography.footnote, fontWeight: '600', marginBottom: spacing.lg },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
  });
