import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import FadeIn from '../components/FadeIn';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useAdvisor from '../hooks/useAdvisor';
import useCrypto from '../hooks/useCrypto';
import type { Allocation } from '../domain/ia';
import { useTheme, type ThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface AsesorVirtualProps {
  profile: string;
}

/** Tono del badge según nivel de riesgo. */
const RIESGO_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  Bajo: 'success',
  Medio: 'warning',
  Alto: 'danger',
};

/** Tono del chip según veredicto cripto. */
const CRIPTO_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

/** Barra de distribución con ancho animado (stagger por índice). */
function BarraDistribucion({ percentage, index }: { percentage: number; index: number }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeBarStyles(colors), [colors]);

  const [trackWidth, setTrackWidth] = useState(0);
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trackWidth > 0) {
      width.setValue(0);
      Animated.timing(width, {
        toValue: (percentage / 100) * trackWidth,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        delay: index * 80,
        useNativeDriver: false,
      }).start();
    }
  }, [index, percentage, trackWidth, width]);

  return (
    <View style={s.track} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[s.fill, { width }]} />
    </View>
  );
}

const makeBarStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: {
      height: 8,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    fill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 4,
    },
  });

/**
 * Simulador de inversión: proyecta una inversión según el perfil
 * del usuario (Monte Carlo) y compara los packs de inversión.
 */
export default function AdvisorScreen({ profile }: AsesorVirtualProps) {
  const {
    amount, setAmount,
    term, setTerm,
    inflation, setInflation,
    loading,
    response,
    error, clearError,
    consult,
  } = useAdvisor(profile);

  const { crypto } = useCrypto();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Key de resultados: remonta el bloque y dispara la animación de entrada
  const [respuestaKey, setRespuestaKey] = useState(0);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  // Haptic de éxito cuando llega la respuesta del asesor
  useEffect(() => {
    if (response) {
      setRespuestaKey((k) => k + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [response]);

  const formatPesos = (value: number) =>
    `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ejecutarConsulta = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    consult();
  };

  const renderAllocation = (asignacion: Allocation, index: number) => (
    <Card
      key={index}
      style={s.asignacionCard}
    >
      <View style={s.asignacionHeader}>
        <Text style={s.asignacionType}>{asignacion.assetType}</Text>
        <Text style={s.asignacionPercentage}>{asignacion.percentage}%</Text>
      </View>
      <BarraDistribucion percentage={asignacion.percentage} index={index} />
      <Text style={s.asignacionReason}>{asignacion.reason}</Text>
    </Card>
  );

  return (
    <Screen safeTop={false}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <Header text="Simulador con Asesor" level="title" style={s.titleSpacing} />
        <Text style={s.subtitle}>Compará todos los activos y recibí una estrategia personalizada</Text>

        {/* ── Formulario ─── */}
        <Card style={s.formCard}>
          <Input
            label="Monto a invertir ($)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="100000"
          />
          <Input
            label="Plazo (meses)"
            value={term}
            onChangeText={setTerm}
            keyboardType="numeric"
            placeholder="6"
          />
          <Input
            label="Inflación mensual estimada (%)"
            value={inflation}
            onChangeText={setInflation}
            keyboardType="numeric"
            placeholder="4.0"
          />

          <Button
            title="Consultar Asesor"
            icon="sparkles-outline"
            onPress={ejecutarConsulta}
            haptics
            loading={loading}
            style={s.consultarBtn}
          />
        </Card>

        {/* ── Resultados ─── */}
        {loading && <Loading style={s.loadingContainer} />}

        {response && !loading && (
          <FadeIn key={respuestaKey} style={s.resultados}>
            {/* Insignia de riesgo y recomendación */}
            <Card style={s.riesgoCard}>
              <Badge
                label={`Riesgo: ${response.riskLevel}`}
                tone={RIESGO_TONE[response.riskLevel] ?? 'warning'}
                style={s.riesgoBadge}
              />

              <Text style={s.recomendacionText}>{response.recommendation}</Text>

              {/* Veredicto cripto del día (análisis técnico) */}
              {crypto.length > 0 && (
                <View style={s.criptoFila}>
                  {crypto.map((c) => (
                    <Badge
                      key={c.symbol}
                      label={`${c.symbol.replace('USDT', '')}: ${c.verdict}`}
                      tone={CRIPTO_TONE[c.verdict] ?? 'warning'}
                    />
                  ))}
                </View>
              )}

              <View style={s.separator} />
              <View style={s.row}>
                <Text style={s.label}>Ganancia real estimada</Text>
                <Text
                  style={[
                    s.gananciaText,
                    response.estimatedRealGain > 0 ? s.green : s.red,
                  ]}
                >
                  {formatPesos(response.estimatedRealGain)}
                </Text>
              </View>
            </Card>

            {/* Distribución sugerida */}
            <Header text="Distribución Sugerida" level="section" style={s.resultHeader} />
            {response.suggestedAllocation.map(renderAllocation)}

            {/* Rendimientos por activo (la lista completa del simulador) */}
            <Header text="Rendimientos por Activo" level="section" style={s.resultHeader} />
            <Card style={s.performancesCard}>
              {response.performances.map((r, i) => (
                <View key={`${r.entity}-${i}`} style={[s.rendFila, i > 0 && s.rendBorde]}>
                  <View style={s.rendIzq}>
                    <Text style={s.rendEntity} numberOfLines={1}>{r.entity}</Text>
                    <Text style={s.rendType}>{r.type} · Riesgo {r.risk}</Text>
                  </View>
                  <View style={s.rendDer}>
                    <Text style={[s.rendReal, r.beatsInflation ? s.green : s.red]} numberOfLines={1}>
                      {r.realMonthlyRate > 0 ? '+' : ''}{r.realMonthlyRate}% real
                    </Text>
                    {/* Línea fija siempre (— en renta fija): todas las filas miden lo mismo */}
                    <Text style={s.rendRango}>
                      {r.worstCase != null && r.bestCase != null
                        ? `${r.worstCase.toFixed(0)}% a +${r.bestCase.toFixed(0)}%`
                        : '—'}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            {/* Resumen de estrategia */}
            <Card style={s.resumenCard}>
              <Header text="Resumen de Estrategia" level="section" style={s.resumenTitle} />
              <Text style={s.resumenText}>{response.strategySummary}</Text>
            </Card>
          </FadeIn>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scroll: { flex: 1 },

    /* ── Títulos ─── */
    titleSpacing: { marginBottom: spacing.sm },
    subtitle: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.xl },

    /* ── Formulario ─── */
    formCard: { marginBottom: spacing.xl },
    consultarBtn: { marginTop: spacing.xl },

    /* ── Resultados ─── */
    loadingContainer: { marginTop: spacing.xxxl, alignItems: 'center' },
    resultados: { marginTop: spacing.md },

    riesgoCard: { marginBottom: spacing.xl },
    riesgoBadge: { alignSelf: 'flex-start', marginBottom: spacing.lg },
    recomendacionText: { ...typography.callout, color: colors.label },
    criptoFila: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginVertical: spacing.lg,
    },

    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    gananciaText: { ...typography.callout, fontWeight: '700' },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    /* ── Distribución ─── */
    resultHeader: { marginBottom: spacing.lg },
    asignacionCard: { marginBottom: spacing.md },

    performancesCard: { padding: 0, marginBottom: spacing.lg },
    rendFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    rendBorde: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.separator,
    },
    rendIzq: { flex: 1 },
    rendEntity: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    rendType: { ...typography.caption2, color: colors.tertiaryLabel },
    rendDer: { alignItems: 'flex-end' },
    rendReal: { ...typography.subheadline, fontWeight: '700' },
    rendRango: { ...typography.caption2, color: colors.tertiaryLabel },
    asignacionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
    asignacionType: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    asignacionPercentage: { ...typography.callout, fontWeight: '700', color: colors.brand },
    asignacionReason: { ...typography.footnote, color: colors.secondaryLabel },

    /* ── Resumen ─── */
    resumenCard: { marginTop: spacing.sm },
    resumenTitle: { marginBottom: spacing.md },
    resumenText: { ...typography.footnote, color: colors.secondaryLabel },
  });
