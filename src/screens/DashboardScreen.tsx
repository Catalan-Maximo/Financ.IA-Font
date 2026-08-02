import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';

interface Activo {
  entidad: string;
  tna: number;
  tipo: string;
}

interface DashboardProps {
  perfil: string;
  onIrAlSimulador: () => void;
}

export default function DashboardScreen({ perfil, onIrAlSimulador }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [activos, setActivos] = useState<Activo[]>([]);
  const inflacionEstimada = 4.0; // Simulación de inflación mensual promedio

  useEffect(() => {
    obtenerTasas();
  }, []);

  const obtenerTasas = async () => {
    try {
      // Traemos las tasas desde el backend (Endpoint 4)
      const response = await api.get('/activos/tasas');
      setActivos(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error de carga ❌', 'No se pudieron sincronizar las tasas del mercado.');
    } finally {
      setLoading(false);
    }
  };

  const renderActivo = ({ item }: { item: Activo }) => {
    // Cálculo rápido simulado: Tasa Mensual menos Inflación Estimada
    const rendimientoMensual = item.tna / 12;
    const tasaRealMensual = rendimientoMensual - inflacionEstimada;

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
        <ActivityIndicator size="large" color="#00B37E" />
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
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderActivo}
        contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
        scrollEnabled={true}
        ListFooterComponent={
          <Button
            title="🧮 Simular Inversión"
            onPress={onIrAlSimulador}
            variant="primary"
            style={styles.simuladorBtn}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  badge: { backgroundColor: '#293845', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: '#00B37E', fontWeight: 'bold', fontSize: 12 },
  sectionSpacing: { marginBottom: 15 },
  cardOverride: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  entidad: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  tipo: { color: '#7C7C8A', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#C4C4CC', fontSize: 13 },
  value: { color: '#E1E1E6', fontSize: 13, fontWeight: '500' },
  greenText: { color: '#00B37E', fontWeight: 'bold' },
  redText: { color: '#F75A68', fontWeight: 'bold' },
  simuladorBtn: { marginTop: 10 },
});
