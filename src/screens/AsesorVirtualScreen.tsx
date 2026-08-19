import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import useAsesorIA from '../hooks/useAsesorIA';
import type { Asignacion } from '../domain/ia';
import { colors } from '../theme/colors';
import { RIESGO_ESTILOS } from '../constants';

interface AsesorVirtualProps {
  perfil: string;
}

export default function AsesorVirtualScreen({ perfil }: AsesorVirtualProps) {
  const {
    monto, setMonto,
    plazo, setPlazo,
    inflacion, setInflacion,
    loading,
    respuesta,
    error, limpiarError,
    consultar,
  } = useAsesorIA(perfil);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const riesgoEstilo = respuesta
    ? RIESGO_ESTILOS[respuesta.nivelRiesgo] ?? RIESGO_ESTILOS.Medio
    : RIESGO_ESTILOS.Medio;

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
          placeholderTextColor={colors.textFaint}
        />

        <Text style={styles.inputLabel}>📅 Plazo (meses)</Text>
        <TextInput
          style={styles.input}
          value={plazo}
          onChangeText={setPlazo}
          keyboardType="numeric"
          placeholder="6"
          placeholderTextColor={colors.textFaint}
        />

        <Text style={styles.inputLabel}>📈 Inflación mensual estimada (%)</Text>
        <TextInput
          style={styles.input}
          value={inflacion}
          onChangeText={setInflacion}
          keyboardType="numeric"
          placeholder="4.0"
          placeholderTextColor={colors.textFaint}
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
          <ActivityIndicator size="large" color={colors.primary} />
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  /* ── Top Bar ─── */
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  perfilBadge: { backgroundColor: colors.badgeBg, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  perfilText: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },

  /* ── Títulos ─── */
  titleSpacing: { marginBottom: 6 },
  subtitleSpacing: { marginBottom: 20 },

  /* ── Formulario ─── */
  formCard: { marginBottom: 20 },
  inputLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
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
  recomendacionTexto: { color: colors.textPrimary, fontSize: 14, lineHeight: 22 },

  separator: { height: 1, backgroundColor: colors.border, marginVertical: 14 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.textSecondary, fontSize: 13 },
  gananciaTexto: { fontSize: 16, fontWeight: 'bold' },
  green: { color: colors.primary },
  red: { color: colors.danger },

  /* ── Distribución ─── */
  resultHeader: { marginBottom: 15 },
  asignacionCard: { marginBottom: 12, padding: 16 },
  asignacionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  asignacionTipo: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
  asignacionPorcentaje: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  asignacionMotivo: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },

  /* ── Resumen ─── */
  resumenCard: { marginTop: 8, padding: 16 },
  resumenTitulo: { marginBottom: 10 },
  resumenTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
