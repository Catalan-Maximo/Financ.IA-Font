import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BackButton from '../components/BackButton';
import Warning from '../components/Warning';
import Screen from '../components/Screen';
import BarChart, { type ChartPoint } from '../components/BarChart';
import ExplainWithAI from '../components/ExplainWithAI';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { StockQuote, Fundamentals } from '../domain/markets';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

const TONO_VALORACION: Record<string, 'success' | 'warning' | 'danger' | 'brand'> = {
  Barata: 'success',
  Razonable: 'warning',
  Cara: 'danger',
  'n/d': 'brand',
};

interface StockDetailProps {
  quote: StockQuote;
  onBack: () => void;
}

const formatMiles = (v: number | null) =>
  v == null ? 'n/d' : `$${(v / 1_000_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}B`;

/**
 * Detalle de una acción: precio, gráfico de 3 meses y fundamentales
 * (P/E con valoración, ingresos, margen neto, deuda vs caja).
 */
/**
 * Detalle de una acción: precio, gráfico de velas, indicadores
 * fundamentales (Yahoo Finance) y botón para explicarlos con IA.
 */
export default function StockDetailScreen({ quote, onBack }: StockDetailProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [fundamentales, setFundamentals] = useState<Fundamentals | null>(null);
  const [candles, setCandles] = useState<ChartPoint[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<Fundamentals>(`/markets/fundamentals/${quote.ticker}`),
      api.get<ChartPoint[]>(`/markets/stocks/${quote.ticker}/candles`),
    ])
      .then(([f, v]) => {
        setFundamentals(f.data);
        setCandles(v.data);
      })
      .catch((e) => console.warn('Sin datos de detalle', e));
  }, [quote.ticker]);

  const f = fundamentales;
  const growth = f?.revenueGrowthPct;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BackButton onPress={onBack} />

        <View style={s.cabecera}>
          <View style={s.cabeceraIzq}>
            <Header text={quote.ticker} level="title" />
            <Text style={[s.variation, quote.variation24h >= 0 ? s.green : s.red]}>
              {quote.variation24h >= 0 ? '+' : ''}{quote.variation24h.toFixed(2)}% hoy
            </Text>
          </View>
          <Text style={s.price} numberOfLines={1}>${quote.price.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</Text>
        </View>

        {/* Gráfico */}
        {candles.length > 1 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 3 meses" level="section" style={s.seccion} />
            <BarChart points={candles} prefijo="$" />
          </Card>
        )}

        {/* Fundamentales */}
        {f && (
          <>
            <Card style={s.card}>
              <View style={s.fundHeader}>
                <Header text="Fundamentales" level="section" />
                <Badge label={f.priceValuation} tone={TONO_VALORACION[f.priceValuation] ?? 'brand'} />
              </View>

              <View style={s.fila}>
                <Text style={s.label}>P/E (precio / ganancia)</Text>
                <Text style={s.value}>{f.pe != null ? f.pe.toFixed(1) : 'n/d'}</Text>
              </View>
              <Text style={s.nota}>
                Un P/E bajo de 20 suele indicar acción "barata"; muy por encima de 30, "cara".
              </Text>

              <View style={s.fila}>
                <Text style={s.label}>Crecimiento de ingresos (año a año)</Text>
                <Text style={[s.value, growth != null && (growth >= 0 ? s.green : s.red)]}>
                  {growth != null ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : 'n/d'}
                </Text>
              </View>

              <View style={s.fila}>
                <Text style={s.label}>Margen neto</Text>
                <Text style={s.value}>
                  {f.netMarginPct != null ? `${f.netMarginPct.toFixed(1)}%` : 'n/d'}
                </Text>
              </View>
              <Text style={s.nota}>
                El margen neto es lo que le queda a la empresa después de pagar todos sus expenses.
              </Text>

              <View style={s.fila}>
                <Text style={s.label}>Deuda / Caja</Text>
                <Text style={s.value}>{formatMiles(f.debt)} / {formatMiles(f.cash)}</Text>
              </View>
              <Text style={[s.nota, f.debtExceedsCash ? s.red : s.green]}>
                {f.debtExceedsCash
                  ? 'Tiene más deuda que caja: a largo plazo conviene que el capital supere las deudas.'
                  : 'Tiene más caja que deuda: situación financiera sólida.'}
              </Text>
            </Card>

            {/* Ingresos anuales */}
            {f.annualIncomes.length > 1 && (
              <Card style={s.card}>
                <Header text="Ingresos anuales" level="section" style={s.seccion} />
                <BarChart
                  points={f.annualIncomes.map((a) => ({ date: a.year, value: a.revenue }))}
                  alto={90}
                  prefijo=""
                />
                <Text style={s.nota}>
                  Lo ideal: revenue que crecen año tras año, como muestra el gráfico.
                </Text>
              </Card>
            )}
          </>
        )}

        <Warning text={
          'Este análisis fundamental es informativo y no garantiza resultados. Las acciones ' +
          'pueden bajar por factores ajenos a la empresa.'
        } />

        {f && (
          <ExplainWithAI data={
            `${quote.ticker}: P/E ${f.pe != null ? f.pe.toFixed(1) : 'n/d'} (${f.priceValuation}), ` +
            `ingresos ${growth != null ? (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%' : 'n/d'} año a año, ` +
            `margen neto ${f.netMarginPct != null ? f.netMarginPct.toFixed(1) + '%' : 'n/d'}, ` +
            `deuda ${formatMiles(f.debt)} contra caja ${formatMiles(f.cash)}. ` +
            `Ingresos anuales: ${f.annualIncomes.map((a) => a.year + ' ' + formatMiles(a.revenue)).join(', ')}.`
          } />
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    cabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    cabeceraIzq: { gap: spacing.xs, flexShrink: 1 },
    variation: { ...typography.footnote, fontWeight: '600' },
    price: { ...typography.title1, fontWeight: '700', color: colors.label },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
    fundHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    fila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    label: { ...typography.footnote, color: colors.secondaryLabel, flex: 1 },
    value: { ...typography.footnote, fontWeight: '700', color: colors.label },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 16 },

    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },
  });
