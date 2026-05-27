import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

interface Activo {
  entidad: string;
  tna: number;
  tipo: string;
}

interface DashboardProps {
  perfil: string;
}

export default function DashboardScreen({ perfil }: DashboardProps) {
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
      <View style={styles.card}>
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
      </View>
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
        <Text style={styles.title}>Tu Cartera FinancIA</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Perfil: {perfil}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>🔥 Rendimientos del Mercado Actual</Text>

      <FlatList
        data={activos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderActivo}
        contentContainerStyle={{ gap: 15, paddingBottom: 20 }}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  badge: { backgroundColor: '#293845', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { color: '#00B37E', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { color: '#8D8D99', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  card: { backgroundColor: '#202024', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#323238' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  entidad: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  tipo: { color: '#7C7C8A', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#C4C4CC', fontSize: 13 },
  value: { color: '#E1E1E6', fontSize: 13, fontWeight: '500' },
  greenText: { color: '#00B37E', fontWeight: 'bold' },
  redText: { color: '#F75A68', fontWeight: 'bold' }
});
