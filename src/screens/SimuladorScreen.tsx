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
import useSimulador from '../hooks/useSimulador';
import type { RendimientoDTO } from '../domain/inversion';
import { colors } from '../theme/colors';

interface SimuladorProps {
  perfil: string;
}

export default function SimuladorScreen({ perfil }: SimuladorProps) {
  const {
    monto, setMonto,
    plazo, setPlazo,
    inflacion, setInflacion,
    loading,
    resultado,
    error, limpiarError,
    simular,
  } = useSimulador();

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderRendimiento = (item: RendimientoDTO, index: number) => {
    const esMejor = resultado?.mejorOpcion === item.tipo;

    return (
      <Card
        key={index}
        style={esMejor ? { ...styles.resultCard, ...styles.mejorCard } : styles.resultCard}
      >
        {esMejor && (
          <View style={styles.mejorBadge}>
            <Text style={styles.mejorBadgeText}>⭐ MEJOR OPCIÓN</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.entidad}>{item.entidad}</Text>
          <Text style={styles.tipo}>{item.tipo}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>TNA</Text>
          <Text style={styles.value}>{item.tna}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tasa Efectiva Mensual</Text>
          <Text style={styles.value}>{item.tasaEfectivaMensual}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tasa Real Mensual</Text>
          <Text style={[styles.value, item.leGanaALaInflacion ? styles.green : styles.red]}>
            {item.tasaRealMensual > 0 ? '+' : ''}{item.tasaRealMensual}%
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.label}>Ganancia Nominal</Text>
          <Text style={styles.valueHighlight}>{formatPesos(item.gananciaNominal)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ganancia Real</Text>
          <Text style={[styles.valueHighlight, item.gananciaReal > 0 ? styles.green : styles.red]}>
            {formatPesos(item.gananciaReal)}
          </Text>
        </View>

        <View style={[styles.indicador, item.leGanaALaInflacion ? styles.indicadorGana : styles.indicadorPierde]}>
          <Text style={styles.indicadorText}>
            {item.leGanaALaInflacion ? '✅ Le gana a la inflación' : '❌ Pierde contra la inflación'}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.perfilBadge}>
          <Text style={styles.perfilText}>Perfil: {perfil}</Text>
        </View>
      </View>

      <Header text="Simulador de Inversiones" level="title" style={styles.titleSpacing} />
      <Header
        text="Compará rendimientos reales vs. inflación"
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
          title="Simular Inversión"
          onPress={simular}
          loading={loading}
          style={styles.simularBtn}
        />
      </Card>

      {/* ── Resultados ─── */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {resultado && !loading && (
        <View style={styles.resultados}>
          <Header text="📊 Resultados de la Simulación" level="section" style={styles.resultHeader} />

          <Card style={styles.resumenCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Monto invertido</Text>
              <Text style={styles.valueHighlight}>{formatPesos(resultado.montoInvertido)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Plazo</Text>
              <Text style={styles.value}>{resultado.plazoMeses} meses</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Inflación mensual</Text>
              <Text style={styles.value}>{resultado.inflacionMensualUsada}%</Text>
            </View>
          </Card>

          {resultado.rendimientos.map(renderRendimiento)}
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
  simularBtn: { marginTop: 20 },

  /* ── Resultados ─── */
  loadingContainer: { marginTop: 30, alignItems: 'center' },
  resultados: { marginTop: 10 },
  resultHeader: { marginBottom: 15 },
  resumenCard: { marginBottom: 15 },

  resultCard: { marginBottom: 15, padding: 16 },
  mejorCard: { borderColor: colors.primary, borderWidth: 2 },
  mejorBadge: { backgroundColor: colors.primaryDark, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 },
  mejorBadgeText: { color: colors.text, fontSize: 11, fontWeight: 'bold' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entidad: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  tipo: { color: colors.textFaint, fontSize: 12 },

  separator: { height: 1, backgroundColor: colors.border, marginVertical: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: colors.textSecondary, fontSize: 13 },
  value: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  valueHighlight: { color: colors.text, fontSize: 14, fontWeight: 'bold' },

  green: { color: colors.primary, fontWeight: 'bold' },
  red: { color: colors.danger, fontWeight: 'bold' },

  indicador: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  indicadorGana: { backgroundColor: colors.successBg },
  indicadorPierde: { backgroundColor: colors.dangerBg },
  indicadorText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
});
