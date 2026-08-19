import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import useMercado from '../hooks/useMercado';
import type { Activo } from '../domain/activo';
import { colors } from '../theme/colors';
import { INFLACION_ESTIMADA_DASHBOARD } from '../constants';

interface DashboardProps {
  perfil: string;
  onIrAlSimulador: () => void;
  onIrAlAsesor: () => void;
}

export default function DashboardScreen({ perfil, onIrAlSimulador, onIrAlAsesor }: DashboardProps) {
  const { activos, loading, error, limpiarError } = useMercado();

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error de carga ❌',
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
      <Card style={styles.cardOverride}>
        <View style={styles.cardHeader}>
          <Text style={styles.entidad}>{item.entidad}</Text>
          <Text style={styles.tipo}>{item.tipo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tasa Nominal (TNA):</Text>
          <Text style={styles.value}>{item.tna}% anual</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rendimiento Real Mensual:</Text>
          <Text style={[styles.value, tasaRealMensual > 0 ? styles.greenText : styles.redText]}>
            {tasaRealMensual > 0 ? '+' : ''}{tasaRealMensual.toFixed(2)}% (vs Inflación)
          </Text>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header text="Tu Cartera FinancIA" level="title" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Perfil: {perfil}</Text>
        </View>
      </View>

      <Header
        text="🔥 Rendimientos del Mercado Actual"
        level="section"
        style={styles.sectionSpacing}
      />

      <FlatList
        data={activos}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderActivo}
        contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
        scrollEnabled={true}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              title="🧮 Simular Inversión"
              onPress={onIrAlSimulador}
              variant="primary"
              style={styles.footerBtn}
            />
            <Button
              title="🤖 Asesor Virtual"
              onPress={onIrAlAsesor}
              variant="outline"
              style={styles.footerBtn}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  badge: { backgroundColor: colors.badgeBg, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  sectionSpacing: { marginBottom: 15 },
  cardOverride: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  entidad: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  tipo: { color: colors.textFaint, fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: colors.textSecondary, fontSize: 13 },
  value: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  greenText: { color: colors.primary, fontWeight: 'bold' },
  redText: { color: colors.danger, fontWeight: 'bold' },
  footer: { gap: 10, marginTop: 10 },
  footerBtn: { width: '100%' },
});
