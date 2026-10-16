import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import ExplainWithAI from '../components/ExplainWithAI';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BackButton from '../components/BackButton';
import Warning from '../components/Warning';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { CryptoState, DailyCandle } from '../domain/crypto';
import { analyzeChecks } from '../domain/crypto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface CryptoDetailProps {
  state: CryptoState;
  onBack: () => void;
}

/**
 * Detalle de un par cripto: por qué el veredicto (checklist con ✓/✗),
 * rango de 20 días, resumen de RSI/tendencia y advertencia de volatilidad.
 */
/**
 * Detalle de BTC/ETH: análisis técnico completo (precio, RSI,
 * medias móviles, soportes/resistencias) y veredicto BUY/WATCH/AVOID.
 */
export default function CryptoDetailScreen({ state, onBack }: CryptoDetailProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const name = state.symbol.startsWith('BTC') ? 'Bitcoin' : 'Ethereum';
  const checks = analyzeChecks(state);

  // Cierres diarios para el gráfico
  const [candles, setCandles] = useState<DailyCandle[]>([]);
  useEffect(() => {
    api.get<DailyCandle[]>(`/crypto/candles/${state.symbol}?days=30`)
      .then((response) => setCandles(response.data))
      .catch((e) => console.warn('No se pudieron cargar las velas', e));
  }, [state.symbol]);

  // Normalización del gráfico de barras
  const cierres = candles.map((v) => v.close);
  const minClose = cierres.length > 0 ? Math.min(...cierres) : 0;
  const maxClose = cierres.length > 0 ? Math.max(...cierres) : 1;
  const rangoCierres = Math.max(maxClose - minClose, 1);
  const tendenciaAlza = cierres.length > 1 && cierres[cierres.length - 1] >= cierres[0];

  // Posición del precio dentro del rango de 20 días (0 = soporte, 1 = resistencia)
  const rango = state.resistance20 - state.support20;
  const posicion = rango > 0
    ? Math.min(1, Math.max(0, (state.price - state.support20) / rango))
    : 0.5;

  const interpretarRsi = (rsi: number) =>
    rsi < 30 ? 'sobrevendido — posible rebote' : rsi > 70 ? 'sobrecomprado — cuidado con correcciones' : 'zona neutral';

  const trend = state.sma50 != null && state.sma200 != null
    ? (state.sma50 > state.sma200 ? 'alcista (SMA50 por encima de SMA200)' : 'bajista (SMA50 por debajo de SMA200)')
    : 'sin datos suficientes';

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

        {/* Encabezado */}
        <View style={s.encabezado}>
          <Header text={name} level="title" />
          <Badge label={state.verdict} tone={TONO_VEREDICTO[state.verdict] ?? 'warning'} />
        </View>
        <Text style={s.price} numberOfLines={1}>${state.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Text>
        {state.change3d != null && (
          <Text style={[s.cambio, state.change3d >= 0 ? s.green : s.red]}>
            {state.change3d >= 0 ? '+' : ''}{state.change3d.toFixed(1)}% últimos 3 días
          </Text>
        )}

        {/* Gráfico de cierres (30 días) */}
        {candles.length > 0 && (
          <Card style={s.card}>
            <Header text="Precio — últimos 30 días" level="section" style={s.tituloSeccion} />
            <View style={s.grafico}>
              {cierres.map((close, i) => (
                <View
                  key={i}
                  style={[
                    s.barra,
                    {
                      height: Math.max(((close - minClose) / rangoCierres) * 100, 6),
                      backgroundColor: tendenciaAlza ? colors.systemGreen : colors.systemRed,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={s.fila}>
              <Text style={s.label}>Mín ${minClose.toLocaleString('es-AR')}</Text>
              <Text style={s.label}>Máx ${maxClose.toLocaleString('es-AR')}</Text>
            </View>
          </Card>
        )}

        {/* Rango de 20 días */}
        <Card style={s.card}>
          <Header text="Rango de 20 días" level="section" style={s.tituloSeccion} />
          <View style={s.track}>
            <View style={[s.marcador, { left: `${posicion * 100}%` }]} />
          </View>
          <View style={s.fila}>
            <Text style={s.label}>Soporte ${state.support20.toLocaleString('es-AR')}</Text>
            <Text style={s.label}>Resistencia ${state.resistance20.toLocaleString('es-AR')}</Text>
          </View>
          <Text style={s.nota}>
            El punto green es el price actual. Más cerca del soporte = mejor momento de entrada.
          </Text>
        </Card>

        {/* Por qué este veredicto */}
        <Card style={s.card}>
          <Header text="¿Por qué este veredicto?" level="section" style={s.tituloSeccion} />
          {checks.map((check) => (
            <View key={check.label} style={s.checkFila}>
              <Ionicons
                name={check.passed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={check.passed ? colors.systemGreen : colors.systemRed}
              />
              <View style={s.checkText}>
                <Text style={s.checkLabel}>{check.label}</Text>
                <Text style={s.checkDetail}>{check.detail}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Resumen del mercado */}
        <Card style={s.card}>
          <Header text="Resumen del mercado" level="section" style={s.tituloSeccion} />
          <View style={s.fila}>
            <Text style={s.label}>RSI (14)</Text>
            <Text style={s.value}>
              {state.rsi14 != null ? `${state.rsi14.toFixed(1)} — ${interpretarRsi(state.rsi14)}` : 'n/d'}
            </Text>
          </View>
          <View style={s.fila}>
            <Text style={s.label}>Tendencia</Text>
            <Text style={s.value}>{trend}</Text>
          </View>
          <View style={s.fila}>
            <Text style={s.label}>SMA 50 / SMA 200</Text>
            <Text style={s.value}>
              {state.sma50 != null ? `$${state.sma50.toLocaleString('es-AR')}` : 'n/d'}
              {' / '}
              {state.sma200 != null ? `$${state.sma200.toLocaleString('es-AR')}` : 'n/d'}
            </Text>
          </View>
        </Card>

        {/* Advertencia de volatilidad */}
        <Warning text={
          'Las criptomonedas son muy volátiles: pueden bajar 20% o más en pocos días. ' +
          'Este análisis técnico es informativo y no garantiza resultados. Invertí solo ' +
          'lo que estés dispuesto a perder.'
        } />

        <ExplainWithAI data={
          `${name}: precio $${state.price.toLocaleString('es-AR')}, ` +
          `RSI(14) ${state.rsi14 != null ? state.rsi14.toFixed(1) : 'n/d'}, ` +
          `soporte $${state.support20.toLocaleString('es-AR')}, resistencia $${state.resistance20.toLocaleString('es-AR')}, ` +
          `veredicto ${state.verdict} (${state.checksPassed}/4 checks), ` +
          `variación 3 días ${state.change3d != null ? state.change3d.toFixed(1) + '%' : 'n/d'}.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
    price: { ...typography.title1, fontWeight: '700', color: colors.label, marginBottom: spacing.xs },
    cambio: { ...typography.footnote, marginBottom: spacing.xl },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    tituloSeccion: { marginBottom: spacing.lg },

    grafico: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
      height: 110,
      marginBottom: spacing.md,
    },
    barra: { flex: 1, borderRadius: 2, opacity: 0.85 },

    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.tertiarySystemBackground,
      marginBottom: spacing.md,
    },
    marcador: {
      position: 'absolute',
      top: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.systemGreen,
      borderWidth: 2,
      borderColor: colors.systemBackground,
      marginLeft: -8,
    },
    fila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.md },
    label: { ...typography.footnote, color: colors.secondaryLabel, flexShrink: 1 },
    value: { ...typography.footnote, fontWeight: '600', color: colors.label, textAlign: 'right', flexShrink: 1 },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.sm },

    checkFila: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    checkText: { flex: 1 },
    checkLabel: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    checkDetail: { ...typography.caption1, color: colors.secondaryLabel, marginTop: 2 },
  });
