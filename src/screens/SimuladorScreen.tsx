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
import type { ComparacionRequest, ComparacionResponse, RendimientoDTO } from '../types/inversion';

interface SimuladorProps {
  perfil: string;
}

export default function SimuladorScreen({ perfil }: SimuladorProps) {
  const [monto, setMonto] = useState('100000');
  const [plazo, setPlazo] = useState('6');
  const [inflacion, setInflacion] = useState('4.0');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ComparacionResponse | null>(null);

  const simular = async () => {
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
      const body: ComparacionRequest = {
        monto: montoNum,
        plazoMeses: plazoNum,
        inflacionMensual: inflacionNum,
      };
      const response = await api.post<ComparacionResponse>('/activos/comparar', body);
      setResultado(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error ❌', 'No se pudo conectar con el backend para simular.');
    } finally {
      setLoading(false);
    }
  };

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderRendimiento = (item: RendimientoDTO, index: number) => {
    const esMejor = resultado?.mejorOpcion === item.entidad;

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
          title="Simular Inversión"
          onPress={simular}
          loading={loading}
          style={styles.simularBtn}
        />
      </Card>

      {/* ── Resultados ─── */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B37E" />
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
  container: { flex: 1, backgroundColor: '#121214' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  /* ── Top Bar ─── */
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
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
  simularBtn: { marginTop: 20 },

  /* ── Resultados ─── */
  loadingContainer: { marginTop: 30, alignItems: 'center' },
  resultados: { marginTop: 10 },
  resultHeader: { marginBottom: 15 },
  resumenCard: { marginBottom: 15 },

  resultCard: { marginBottom: 15, padding: 16 },
  mejorCard: { borderColor: '#00B37E', borderWidth: 2 },
  mejorBadge: { backgroundColor: '#00875F', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 },
  mejorBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  entidad: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  tipo: { color: '#7C7C8A', fontSize: 12 },

  separator: { height: 1, backgroundColor: '#323238', marginVertical: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#C4C4CC', fontSize: 13 },
  value: { color: '#E1E1E6', fontSize: 13, fontWeight: '500' },
  valueHighlight: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  green: { color: '#00B37E', fontWeight: 'bold' },
  red: { color: '#F75A68', fontWeight: 'bold' },

  indicador: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  indicadorGana: { backgroundColor: '#1B3A2D' },
  indicadorPierde: { backgroundColor: '#3D1F24' },
  indicadorText: { color: '#E1E1E6', fontSize: 13, fontWeight: '600' },
});
