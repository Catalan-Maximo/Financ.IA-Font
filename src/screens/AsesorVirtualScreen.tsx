import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import type { IARequest, IAResponse, Asignacion } from '../types/ia';

interface AsesorVirtualProps {
  perfil: string;
  onVolver: () => void;
}

/** Colores de la insignia según nivel de riesgo. */
const RIESGO_ESTILOS: Record<string, { bg: string; texto: string }> = {
  Bajo: { bg: '#1B3A2D', texto: '#00B37E' },
  Medio: { bg: '#3D3320', texto: '#FBA94C' },
  Alto: { bg: '#3D1F24', texto: '#F75A68' },
};

export default function AsesorVirtualScreen({ perfil, onVolver }: AsesorVirtualProps) {
  const [monto, setMonto] = useState('100000');
  const [plazo, setPlazo] = useState('6');
  const [inflacion, setInflacion] = useState('4.0');
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<IAResponse | null>(null);

  const consultar = async () => {
    const montoNum = parseFloat(monto);
    const plazoNum = parseInt(plazo, 10);
    const inflacionNum = parseFloat(inflacion);

    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido mayor a 0.');
      return;
    }
    if (isNaN(plazoNum) || plazoNum <= 0) {
      Alert.alert('Error', 'Ingresá un plazo válido en meses.');
      return;
    }
    if (isNaN(inflacionNum) || inflacionNum < 0) {
      Alert.alert('Error', 'Ingresá un porcentaje de inflación válido.');
      return;
    }

    setLoading(true);
    try {
      const body: IARequest = {
        perfilInversor: perfil,
        monto: montoNum,
        plazoMeses: plazoNum,
        inflacionMensual: inflacionNum,
      };
      const response = await api.post<IAResponse>('/ia/simular', body);
      setRespuesta(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error ❌', 'No se pudo conectar con el asesor virtual.');
    } finally {
      setLoading(false);
    }
  };

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const riesgoEstilo = respuesta ? RIESGO_ESTILOS[respuesta.nivelRiesgo] ?? RIESGO_ESTILOS.Medio : RIESGO_ESTILOS.Medio;

  const renderAsignacion = (asignacion: Asignacion, index: number) => (
    <Card key={index} style={styles.asignacionCard}>
      <View style={styles.asignacionHeader}>
        <Text style={styles.asignacionTipo}>{asignacion.tipoActivo}</Text>
        <Text style={styles.asignacionPorcentaje}>{asignacion.porcentaje}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${asignacion.porcentaje}%` },
          ]}
        />
      </View>
      <Text style={styles.asignacionMotivo}>{asignacion.motivo}</Text>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Button title="← Volver" onPress={onVolver} variant="outline" style={styles.volverBtn} />
        <View style={styles.perfilBadge}>
          <Text style={styles.perfilText}>Perfil: {perfil}</Text>
        </View>
      </View>

      <Header text="🤖 Asesor Virtual" level="title" style={styles.titleSpacing} />
      <Header
        text="Recibí una estrategia personalizada según tu perfil"
        level="section"
        style={styles.subtitleSpacing}
      />

      {/* ── Formulario ─── */}
      <Card style={styles.formCard}>
        <Text style={styles.inputLabel}>💰 Monto a invertir ($)</Text>
        <TextInput
          style={styles.input}
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholder="100000"
          placeholderTextColor="#7C7C8A"
        />

        <Text style={styles.inputLabel}>📅 Plazo (meses)</Text>
        <TextInput
          style={styles.input}
          value={plazo}
          onChangeText={setPlazo}
          keyboardType="numeric"
          placeholder="6"
          placeholderTextColor="#7C7C8A"
        />

        <Text style={styles.inputLabel}>📈 Inflación mensual estimada (%)</Text>
        <TextInput
          style={styles.input}
          value={inflacion}
          onChangeText={setInflacion}
          keyboardType="numeric"
          placeholder="4.0"
          placeholderTextColor="#7C7C8A"
        />

        <Button
          title="Consultar Asesor"
          onPress={consultar}
          loading={loading}
          style={styles.consultarBtn}
        />
      </Card>

      {/* ── Resultados ─── */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B37E" />
        </View>
      )}

      {respuesta && !loading && (
        <View style={styles.resultados}>
          {/* Insignia de riesgo */}
          <Card style={styles.riesgoCard}>
            <View style={[styles.riesgoBadge, { backgroundColor: riesgoEstilo.bg }]}>
              <Text style={[styles.riesgoBadgeText, { color: riesgoEstilo.texto }]}>
                Riesgo: {respuesta.nivelRiesgo}
              </Text>
            </View>

            {/* Recomendación */}
            <Text style={styles.recomendacionTexto}>{respuesta.recomendacion}</Text>

            {/* Ganancia estimada */}
            <View style={styles.separator} />
            <View style={styles.row}>
              <Text style={styles.label}>Ganancia real estimada</Text>
              <Text
                style={[
                  styles.gananciaTexto,
                  respuesta.gananciaRealEstimada > 0 ? styles.green : styles.red,
                ]}
              >
                {formatPesos(respuesta.gananciaRealEstimada)}
              </Text>
            </View>
          </Card>

          {/* Distribución sugerida */}
          <Header
            text="📊 Distribución Sugerida"
            level="section"
            style={styles.resultHeader}
          />
          {respuesta.distribucionSugerida.map(renderAsignacion)}

          {/* Resumen de estrategia */}
          <Card style={styles.resumenCard}>
            <Header text="🎯 Resumen de Estrategia" level="section" style={styles.resumenTitulo} />
            <Text style={styles.resumenTexto}>{respuesta.resumenEstrategia}</Text>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  /* ── Top Bar ─── */
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  volverBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  perfilBadge: { backgroundColor: '#293845', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  perfilText: { color: '#00B37E', fontWeight: 'bold', fontSize: 12 },

  /* ── Títulos ─── */
  titleSpacing: { marginBottom: 6 },
  subtitleSpacing: { marginBottom: 20 },

  /* ── Formulario ─── */
  formCard: { marginBottom: 20 },
  inputLabel: { color: '#E1E1E6', fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#121214',
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#323238',
  },
  consultarBtn: { marginTop: 20 },

  /* ── Resultados ─── */
  loadingContainer: { marginTop: 30, alignItems: 'center' },
  resultados: { marginTop: 10 },

  riesgoCard: { marginBottom: 20 },
  riesgoBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 14,
  },
  riesgoBadgeText: { fontWeight: 'bold', fontSize: 13 },
  recomendacionTexto: { color: '#E1E1E6', fontSize: 14, lineHeight: 22 },

  separator: { height: 1, backgroundColor: '#323238', marginVertical: 14 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#C4C4CC', fontSize: 13 },
  gananciaTexto: { fontSize: 16, fontWeight: 'bold' },
  green: { color: '#00B37E' },
  red: { color: '#F75A68' },

  /* ── Distribución ─── */
  resultHeader: { marginBottom: 15 },
  asignacionCard: { marginBottom: 12, padding: 16 },
  asignacionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  asignacionTipo: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  asignacionPorcentaje: { color: '#00B37E', fontSize: 16, fontWeight: 'bold' },
  progressTrack: {
    height: 8,
    backgroundColor: '#29292E',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B37E',
    borderRadius: 4,
  },
  asignacionMotivo: { color: '#8D8D99', fontSize: 12, lineHeight: 18 },

  /* ── Resumen ─── */
  resumenCard: { marginTop: 8, padding: 16 },
  resumenTitulo: { marginBottom: 10 },
  resumenTexto: { color: '#C4C4CC', fontSize: 13, lineHeight: 20 },
});
