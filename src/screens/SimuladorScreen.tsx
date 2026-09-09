import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Screen from '../components/Screen';
import Entrada from '../components/Entrada';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useSimulador from '../hooks/useSimulador';
import type { RendimientoDTO } from '../domain/inversion';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

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

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Key de resultados: remonta el bloque y dispara la animación de entrada
  const [resultadoKey, setResultadoKey] = useState(0);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: limpiarError }]);
    }
  }, [error, limpiarError]);

  // Haptic de éxito cuando llega el resultado
  useEffect(() => {
    if (resultado) {
      setResultadoKey((k) => k + 1);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [resultado]);

  const formatPesos = (valor: number) =>
    `$${valor.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ejecutarSimulacion = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    simular();
  };

  const renderRendimiento = (item: RendimientoDTO, index: number) => {
    const esMejor = resultado?.mejorOpcion === item.tipo;

    return (
      <Card
        key={index}
        style={[s.resultCard, esMejor && s.mejorCard]}
      >
        {esMejor && <Badge label="MEJOR OPCIÓN" tone="brand" style={s.mejorBadge} />}

        <View style={s.cardHeader}>
          <Text style={s.entidad}>{item.entidad}</Text>
          <Text style={s.tipo}>{item.tipo}</Text>
        </View>

        <View style={s.separator} />

        <View style={s.row}>
          <Text style={s.label}>TNA</Text>
          <Text style={s.value}>{item.tna}%</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Tasa Efectiva Mensual</Text>
          <Text style={s.value}>{item.tasaEfectivaMensual}%</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Tasa Real Mensual</Text>
          <Text style={[s.value, item.leGanaALaInflacion ? s.green : s.red]}>
            {item.tasaRealMensual > 0 ? '+' : ''}{item.tasaRealMensual}%
          </Text>
        </View>

        <View style={s.separator} />

        <View style={s.row}>
          <Text style={s.label}>Ganancia Nominal</Text>
          <Text style={s.valueHighlight}>{formatPesos(item.gananciaNominal)}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Ganancia Real</Text>
          <Text style={[s.valueHighlight, item.gananciaReal > 0 ? s.green : s.red]}>
            {formatPesos(item.gananciaReal)}
          </Text>
        </View>

        <View style={[s.indicador, item.leGanaALaInflacion ? s.indicadorGana : s.indicadorPierde]}>
          <Ionicons
            name={item.leGanaALaInflacion ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={item.leGanaALaInflacion ? colors.systemGreen : colors.systemRed}
          />
          <Text style={s.indicadorText}>
            {item.leGanaALaInflacion ? 'Le gana a la inflación' : 'Pierde contra la inflación'}
          </Text>
        </View>
      </Card>
    );
  };

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
        <Header text="Simulador de Inversiones" level="title" style={s.titleSpacing} />
        <Text style={s.subtitle}>Compará rendimientos reales vs. inflación</Text>

        {/* ── Formulario ─── */}
        <Card style={s.formCard}>
          <Input
            label="Monto a invertir ($)"
            value={monto}
            onChangeText={setMonto}
            keyboardType="numeric"
            placeholder="100000"
          />
          <Input
            label="Plazo (meses)"
            value={plazo}
            onChangeText={setPlazo}
            keyboardType="numeric"
            placeholder="6"
          />
          <Input
            label="Inflación mensual estimada (%)"
            value={inflacion}
            onChangeText={setInflacion}
            keyboardType="numeric"
            placeholder="4.0"
          />

          <Button
            title="Simular Inversión"
            icon="calculator-outline"
            onPress={ejecutarSimulacion}
            haptics
            loading={loading}
            style={s.simularBtn}
          />
        </Card>

        {/* ── Resultados ─── */}
        {loading && (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        )}

        {resultado && !loading && (
          <Entrada key={resultadoKey} style={s.resultados}>
            <Header text="Resultados de la Simulación" level="section" style={s.resultHeader} />

            <Card style={s.resumenCard}>
              <View style={s.row}>
                <Text style={s.label}>Monto invertido</Text>
                <Text style={s.valueHighlight}>{formatPesos(resultado.montoInvertido)}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>Plazo</Text>
                <Text style={s.value}>{resultado.plazoMeses} meses</Text>
              </View>
              <View style={s.row}>
                <Text style={s.label}>Inflación mensual</Text>
                <Text style={s.value}>{resultado.inflacionMensualUsada}%</Text>
              </View>
            </Card>

            {resultado.rendimientos.map(renderRendimiento)}
          </Entrada>
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
    simularBtn: { marginTop: spacing.xl },

    /* ── Resultados ─── */
    loadingContainer: { marginTop: spacing.xxxl, alignItems: 'center' },
    resultados: { marginTop: spacing.md },
    resultHeader: { marginBottom: spacing.lg },
    resumenCard: { marginBottom: spacing.lg },

    resultCard: { marginBottom: spacing.lg },
    mejorCard: { borderWidth: 2, borderColor: colors.brand },
    mejorBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    entidad: { ...typography.callout, fontWeight: '600', color: colors.label },
    tipo: { ...typography.caption1, color: colors.tertiaryLabel },

    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },

    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    label: { ...typography.footnote, color: colors.secondaryLabel },
    value: { ...typography.footnote, fontWeight: '600', color: colors.label },
    valueHighlight: { ...typography.headline, color: colors.label },

    green: { color: colors.systemGreen, fontWeight: '600' },
    red: { color: colors.systemRed, fontWeight: '600' },

    indicador: {
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    indicadorGana: { backgroundColor: colors.successBg },
    indicadorPierde: { backgroundColor: colors.dangerBg },
    indicadorText: { ...typography.footnote, fontWeight: '600', color: colors.label },
  });
