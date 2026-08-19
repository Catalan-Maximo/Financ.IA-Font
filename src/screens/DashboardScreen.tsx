import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMercado from '../hooks/useMercado';
import type { Activo } from '../domain/activo';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { INFLACION_ESTIMADA_DASHBOARD } from '../constants';

interface DashboardProps {
  perfil: string;
  onIrAlSimulador: () => void;
  onIrAlAsesor: () => void;
}

export default function DashboardScreen({ perfil, onIrAlSimulador, onIrAlAsesor }: DashboardProps) {
  const { activos, loading, error, limpiarError } = useMercado();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error de carga',
        'No se pudieron sincronizar las tasas del mercado.',
        [{ text: 'OK', onPress: limpiarError }],
      );
    }
  }, [error, limpiarError]);

  const renderActivo = ({ item }: { item: Activo }) => {
    // Cálculo rápido simulado: Tasa Mensual menos Inflación Estimada
    const rendimientoMensual = item.tna / 12;
    const tasaRealMensual = rendimientoMensual - INFLACION_ESTIMADA_DASHBOARD;

    return (
      <Card style={s.cardOverride}>
        <View style={s.cardHeader}>
          <Text style={s.entidad}>{item.entidad}</Text>
          <Text style={s.tipo}>{item.tipo}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Tasa Nominal (TNA):</Text>
          <Text style={s.value}>{item.tna}% anual</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Rendimiento Real Mensual:</Text>
          <Text style={[s.value, tasaRealMensual > 0 ? s.greenText : s.redText]}>
            {tasaRealMensual > 0 ? '+' : ''}{tasaRealMensual.toFixed(2)}% (vs Inflación)
          </Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen style={s.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <Header text="Rendimientos del Mercado Actual" level="section" style={s.sectionSpacing} />

      <FlatList
        data={activos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderActivo}
        contentContainerStyle={{
          gap: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={s.footer}>
            <Button
              title="Simular Inversión"
              icon="calculator-outline"
              onPress={onIrAlSimulador}
              style={s.footerBtn}
            />
            <Button
              title="Asesor Virtual"
              icon="sparkles-outline"
              onPress={onIrAlAsesor}
              style={s.footerBtn}
            />
          </View>
        }
      />
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { alignItems: 'center', justifyContent: 'center' },
    sectionSpacing: { marginTop: spacing.lg, marginBottom: spacing.lg },
    cardOverride: { padding: spacing.lg },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
    entidad: { ...typography.callout, fontWeight: '600', color: colors.label },
    tipo: { ...typography.caption1, color: colors.tertiaryLabel },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    value: { ...typography.footnote, fontWeight: '600', color: colors.label },
    greenText: { color: colors.systemGreen, fontWeight: '600' },
    redText: { color: colors.systemRed, fontWeight: '600' },
    footer: { gap: spacing.md, marginTop: spacing.md },
    footerBtn: { width: '100%' },
  });
