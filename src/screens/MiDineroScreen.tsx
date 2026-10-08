import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMiDinero from '../hooks/useMiDinero';
import { ACTIVOS_PORTFOLIO } from '../domain/midinero';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

type TabMiDinero = 'portafolio' | 'metas';

const formatPesos = (v: number) =>
  `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Mi Dinero: portafolio personal (P&L con precios reales) y metas
 * de ahorro con barra de progreso.
 */
export default function MiDineroScreen() {
  const [tab, setTab] = useState<TabMiDinero>('portafolio');
  const {
    posiciones, metas, loading,
    agregarPosicion, eliminarPosicion, crearMeta, aportarMeta, eliminarMeta,
  } = useMiDinero();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Formulario de posición
  const [activo, setActivo] = useState(ACTIVOS_PORTFOLIO[0]);
  const [cantidad, setCantidad] = useState('10');
  const [precio, setPrecio] = useState('');

  // Formulario de meta
  const [nombreMeta, setNombreMeta] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [fechaMeta, setFechaMeta] = useState('2027-12-31');

  // Aporte inline por meta
  const [aporteMetaId, setAporteMetaId] = useState<number | null>(null);
  const [aporteMonto, setAporteMonto] = useState('');

  const agregarPos = async () => {
    const cant = parseFloat(cantidad);
    const prec = parseFloat(precio || '0');
    if (!prec || !cant) {
      Alert.alert('Error', 'Completá cantidad y precio de compra.');
      return;
    }
    await agregarPosicion(activo, cant, prec);
    setPrecio('');
    setCantidad('10');
  };

  const crear = async () => {
    const obj = parseFloat(objetivo);
    if (!nombreMeta.trim() || !obj) {
      Alert.alert('Error', 'Completá nombre y monto objetivo.');
      return;
    }
    await crearMeta(nombreMeta.trim(), obj, fechaMeta);
    setNombreMeta('');
    setObjetivo('');
  };

  const confirmarAporte = async () => {
    const monto = parseFloat(aporteMonto);
    if (aporteMetaId != null && monto > 0) {
      await aportarMeta(aporteMetaId, monto);
    }
    setAporteMetaId(null);
    setAporteMonto('');
  };

  if (loading) {
    return (
      <Screen style={s.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </Screen>
    );
  }

  const totalValor = posiciones.reduce((acc, p) => acc + p.valorActual, 0);
  const totalGanancia = posiciones.reduce((acc, p) => acc + p.ganancia, 0);

  return (
    <Screen safeTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <Header text="Mi Dinero" level="title" style={s.titulo} />

        {/* Top Tabs */}
        <View style={s.tabs}>
          {(['portafolio', 'metas'] as TabMiDinero[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[s.tab, tab === t && s.tabActiva]}
            >
              <Text style={[s.tabTexto, tab === t && s.tabTextoActiva]}>
                {t === 'portafolio' ? 'Portafolio' : 'Metas'}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === 'portafolio' && (
          <>
            {/* Resumen */}
            {posiciones.length > 0 && (
              <Card style={s.resumen}>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Valor total</Text>
                  <Text style={s.resumenValor}>{formatPesos(totalValor)}</Text>
                </View>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Ganancia total</Text>
                  <Text style={[s.resumenValor, totalGanancia >= 0 ? s.verde : s.rojo]}>
                    {totalGanancia >= 0 ? '+' : ''}{formatPesos(totalGanancia)}
                  </Text>
                </View>
              </Card>
            )}

            {/* Formulario */}
            <Card style={s.form}>
              <Header text="Agregar posición" level="section" style={s.formTitulo} />
              <View style={s.chips}>
                {ACTIVOS_PORTFOLIO.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setActivo(a)}
                    style={[s.chip, activo === a && s.chipActivo]}
                  >
                    <Text style={[s.chipTexto, activo === a && s.chipTextoActivo]}>{a}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={cantidad}
                  onChangeText={setCantidad}
                  keyboardType="numeric"
                  placeholder="Cantidad"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="numeric"
                  placeholder="Precio de compra"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable style={({ pressed }) => [s.boton, pressed && s.botonPressed]} onPress={agregarPos}>
                <Text style={s.botonTexto}>Agregar</Text>
              </Pressable>
            </Card>

            {/* Lista */}
            {posiciones.map((p) => (
              <Card key={p.id} style={s.posicion}>
                <View style={s.posHeader}>
                  <Text style={s.posActivo} numberOfLines={1}>{p.activo}</Text>
                  <Text style={[s.posGanancia, p.ganancia >= 0 ? s.verde : s.rojo]}>
                    {p.ganancia >= 0 ? '+' : ''}{p.gananciaPct.toFixed(2)}%
                  </Text>
                </View>
                <Text style={s.posDetalle} numberOfLines={1}>
                  {p.cantidad} × {formatPesos(p.precioCompra)} → {formatPesos(p.precioActual)} ahora
                </Text>
                <View style={s.posPie}>
                  <Text style={s.posValor} numberOfLines={1}>
                    {formatPesos(p.valorActual)} · {p.ganancia >= 0 ? '+' : ''}{formatPesos(p.ganancia)}
                  </Text>
                  <Pressable onPress={() => eliminarPosicion(p.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {posiciones.length === 0 && (
              <Text style={s.vacio}>Cargá tu primera posición para seguir tu plata real.</Text>
            )}
          </>
        )}

        {tab === 'metas' && (
          <>
            <Card style={s.form}>
              <Header text="Nueva meta" level="section" style={s.formTitulo} />
              <TextInput
                style={s.inputFull}
                value={nombreMeta}
                onChangeText={setNombreMeta}
                placeholder="Nombre (ej. Viaje a Bariloche)"
                placeholderTextColor={colors.tertiaryLabel}
              />
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={objetivo}
                  onChangeText={setObjetivo}
                  keyboardType="numeric"
                  placeholder="Objetivo $"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={fechaMeta}
                  onChangeText={setFechaMeta}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable style={({ pressed }) => [s.boton, pressed && s.botonPressed]} onPress={crear}>
                <Text style={s.botonTexto}>Crear meta</Text>
              </Pressable>
            </Card>

            {metas.map((m) => {
              const pct = m.montoObjetivo > 0
                ? Math.min(100, (m.montoActual / m.montoObjetivo) * 100) : 0;
              return (
                <Card key={m.id} style={s.posicion}>
                  <View style={s.posHeader}>
                    <Text style={s.posActivo} numberOfLines={1}>{m.nombre}</Text>
                    <Text style={s.metaPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={s.posDetalle} numberOfLines={1}>
                    {formatPesos(m.montoActual)} de {formatPesos(m.montoObjetivo)} · hasta {m.fechaLimite}
                  </Text>

                  <View style={s.metaAcciones}>
                    {aporteMetaId === m.id ? (
                      <View style={s.aporteFila}>
                        <TextInput
                          style={[s.input, s.aporteInput]}
                          value={aporteMonto}
                          onChangeText={setAporteMonto}
                          keyboardType="numeric"
                          placeholder="Monto $"
                          placeholderTextColor={colors.tertiaryLabel}
                        />
                        <Pressable style={[s.boton, s.botonChico]} onPress={confirmarAporte}>
                          <Text style={s.botonTexto}>OK</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable style={[s.boton, s.botonChico]} onPress={() => setAporteMetaId(m.id)}>
                        <Text style={s.botonTexto}>+ Aportar</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => eliminarMeta(m.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                    </Pressable>
                  </View>
                </Card>
              );
            })}

            {metas.length === 0 && (
              <Text style={s.vacio}>Creá tu primera meta y empezá a medir tu progreso.</Text>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { alignItems: 'center', justifyContent: 'center' },
    titulo: { marginBottom: spacing.lg },

    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 10,
      padding: 3,
      marginBottom: spacing.lg,
    },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, alignItems: 'center' },
    tabActiva: { backgroundColor: colors.secondarySystemBackground },
    tabTexto: { ...typography.subheadline, color: colors.secondaryLabel },
    tabTextoActiva: { color: colors.label, fontWeight: '600' },

    resumen: { padding: spacing.lg, marginBottom: spacing.lg },
    resumenFila: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
    resumenLabel: { ...typography.footnote, color: colors.secondaryLabel },
    resumenValor: { ...typography.title3, fontWeight: '700', color: colors.label },

    form: { padding: spacing.lg, marginBottom: spacing.lg },
    formTitulo: { marginBottom: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 16,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    chipActivo: { backgroundColor: colors.brand },
    chipTexto: { ...typography.caption1, color: colors.secondaryLabel },
    chipTextoActivo: { color: colors.onBrand, fontWeight: '600' },

    filaInputs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    input: {
      flex: 1,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
    },
    inputFull: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
      marginBottom: spacing.md,
    },

    boton: {
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    botonPressed: { opacity: 0.85 },
    botonChico: { alignSelf: 'flex-start' },
    botonTexto: { ...typography.subheadline, fontWeight: '700', color: colors.onBrand },

    posicion: { padding: spacing.lg, marginBottom: spacing.md },
    posHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
    posActivo: { ...typography.headline, fontWeight: '700', color: colors.label, flex: 1 },
    posGanancia: { ...typography.subheadline, fontWeight: '700' },
    posDetalle: { ...typography.caption1, color: colors.secondaryLabel, marginTop: spacing.xs },
    posValor: { ...typography.footnote, fontWeight: '600', color: colors.label, flex: 1 },
    posPie: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    metaPct: { ...typography.subheadline, fontWeight: '700', color: colors.brand },

    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.tertiarySystemBackground,
      overflow: 'hidden',
      marginTop: spacing.md,
    },
    progressFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 4 },

    metaAcciones: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    aporteFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    aporteInput: { flex: 1 },

    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },
    vacio: { ...typography.footnote, color: colors.tertiaryLabel, textAlign: 'center', marginTop: spacing.xl },
  });
