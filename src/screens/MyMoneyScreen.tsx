import React, { useMemo, useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import EmptyState from '../components/EmptyState';
import SegmentedTabs from '../components/SegmentedTabs';
import ProgressBar from '../components/ProgressBar';
import Loading from '../components/Loading';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMyMoney from '../hooks/useMyMoney';
import { PORTFOLIO_ASSETS, EXPENSE_CATEGORIES } from '../domain/myMoney';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

type TabMyMoney = 'portafolio' | 'metas' | 'gastos';

const TABS_MIDINERO = [
  { key: 'gastos', label: 'Gastos' },
  { key: 'metas', label: 'Metas' },
  { key: 'portafolio', label: 'Portafolio' },
];

const formatPesos = (v: number) =>
  `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Mi Dinero: portafolio personal (P&L con precios reales) y metas
 * de ahorro con barra de progreso.
 */
/**
 * Pantalla Mi Dinero: ingreso mensual, gastos por categoría,
 * metas de ahorro y posiciones de inversión del usuario.
 */
export default function MyMoneyScreen() {
  const [tab, setTab] = useState<TabMyMoney>('gastos');
  const {
    positions, goals, expenses, resumen, loading,
    addPosition, deletePosition, createGoal, aportarMeta, deleteGoal,
    addExpense, deleteExpense, saveIncome,
  } = useMyMoney();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Formulario de posición
  const [asset, setAsset] = useState(PORTFOLIO_ASSETS[0]);
  const [quantity, setQuantity] = useState('10');
  const [price, setPrice] = useState('');

  // Formulario de meta
  const [nombreMeta, setNombreMeta] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [fechaMeta, setFechaMeta] = useState('2027-12-31');

  // Aporte inline por meta
  const [aporteMetaId, setAporteMetaId] = useState<number | null>(null);
  const [aporteAmount, setAporteAmount] = useState('');

  // Formulario de gasto
  const [categoriaExpense, setCategoriaExpense] = useState(EXPENSE_CATEGORIES[0]);
  const [descripcionExpense, setDescripcionExpense] = useState('');
  const [montoExpense, setMontoExpense] = useState('');

  // Ingreso mensual
  const [ingresoText, setIngresoText] = useState('');

  const agregarPos = async () => {
    const cant = parseFloat(quantity);
    const prec = parseFloat(price || '0');
    if (!prec || !cant) {
      Alert.alert('Error', 'Completá cantidad y precio de compra.');
      return;
    }
    await addPosition(asset, cant, prec);
    setPrice('');
    setQuantity('10');
  };

  const crear = async () => {
    const obj = parseFloat(objetivo);
    if (!nombreMeta.trim() || !obj) {
      Alert.alert('Error', 'Completá nombre y monto objetivo.');
      return;
    }
    await createGoal(nombreMeta.trim(), obj, fechaMeta);
    setNombreMeta('');
    setObjetivo('');
  };

  const confirmarAporte = async () => {
    const amount = parseFloat(aporteAmount);
    if (aporteMetaId != null && amount > 0) {
      await aportarMeta(aporteMetaId, amount);
    }
    setAporteMetaId(null);
    setAporteAmount('');
  };

  if (loading) {
    return (
      <Screen>
        <Loading style={s.loading} />
      </Screen>
    );
  }

  const totalValue = positions.reduce((acc, p) => acc + p.currentValue, 0);
  const totalGain = positions.reduce((acc, p) => acc + p.gain, 0);

  return (
    <Screen safeTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        <Header text="Mi Dinero" level="title" style={s.title} />

        {/* Top Tabs */}
        <SegmentedTabs
          options={TABS_MIDINERO}
          activa={tab}
          onCambiar={(t) => setTab(t as TabMyMoney)}
        />

        {tab === 'portafolio' && (
          <>
            {/* Resumen */}
            {positions.length > 0 && (
              <Card style={s.resumen}>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Valor total</Text>
                  <Text style={s.resumenValue}>{formatPesos(totalValue)}</Text>
                </View>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Ganancia total</Text>
                  <Text style={[s.resumenValue, totalGain >= 0 ? s.green : s.red]}>
                    {totalGain >= 0 ? '+' : ''}{formatPesos(totalGain)}
                  </Text>
                </View>
              </Card>
            )}

            {/* Formulario */}
            <Card style={s.form}>
              <Header text="Agregar posición" level="section" style={s.formTitle} />
              <View style={s.chips}>
                {PORTFOLIO_ASSETS.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setAsset(a)}
                    style={[s.chip, asset === a && s.chipAsset]}
                  >
                    <Text style={[s.chipText, asset === a && s.chipTextoAsset]}>{a}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="Cantidad"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="Precio de compra"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable style={({ pressed }) => [s.button, pressed && s.botonPressed]} onPress={agregarPos}>
                <Text style={s.botonText}>Agregar</Text>
              </Pressable>
            </Card>

            {/* Lista */}
            {positions.map((p) => (
              <Card key={p.id} style={s.posicion}>
                <View style={s.posHeader}>
                  <Text style={s.posAsset} numberOfLines={1}>{p.asset}</Text>
                  <Text style={[s.posGain, p.gain >= 0 ? s.green : s.red]}>
                    {p.gain >= 0 ? '+' : ''}{p.gainPct.toFixed(2)}%
                  </Text>
                </View>
                <Text style={s.posDetail} numberOfLines={1}>
                  {p.quantity} × {formatPesos(p.purchasePrice)} → {formatPesos(p.currentPrice)} ahora
                </Text>
                {p.alert && (
                  <View style={s.stopLoss}>
                    <Ionicons name="warning" size={16} color={colors.systemRed} />
                    <Text style={s.stopLossText}>
                      Stop-loss: cayó más del 10% since tu buyPrice
                    </Text>
                  </View>
                )}
                <View style={s.posPie}>
                  <Text style={s.posValue} numberOfLines={1}>
                    {formatPesos(p.currentValue)} · {p.gain >= 0 ? '+' : ''}{formatPesos(p.gain)}
                  </Text>
                  <Pressable onPress={() => deletePosition(p.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {positions.length === 0 && (
              <EmptyState
                icono="briefcase-outline"
                title="Todavía no tenés posiciones"
                detail="Cargá tu primera posición para seguir tu plata real."
              />
            )}
          </>
        )}

        {tab === 'metas' && (
          <>
            <Card style={s.form}>
              <Header text="Nueva meta" level="section" style={s.formTitle} />
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
              <Pressable style={({ pressed }) => [s.button, pressed && s.botonPressed]} onPress={crear}>
                <Text style={s.botonText}>Crear meta</Text>
              </Pressable>
            </Card>

            {goals.map((m) => {
              const pct = m.targetAmount > 0
                ? Math.min(100, (m.currentAmount / m.targetAmount) * 100) : 0;
              return (
                <Card key={m.id} style={s.posicion}>
                  <View style={s.posHeader}>
                    <Text style={s.posAsset} numberOfLines={1}>{m.name}</Text>
                    <Text style={s.metaPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <ProgressBar progreso={pct} style={s.progressTrack} />
                  <Text style={s.posDetail} numberOfLines={1}>
                    {formatPesos(m.currentAmount)} de {formatPesos(m.targetAmount)} · hasta {m.deadline}
                  </Text>

                  <View style={s.metaAcciones}>
                    {aporteMetaId === m.id ? (
                      <View style={s.aporteFila}>
                        <TextInput
                          style={[s.input, s.aporteInput]}
                          value={aporteAmount}
                          onChangeText={setAporteAmount}
                          keyboardType="numeric"
                          placeholder="Monto $"
                          placeholderTextColor={colors.tertiaryLabel}
                        />
                        <Pressable style={[s.button, s.botonChico]} onPress={confirmarAporte}>
                          <Text style={s.botonText}>OK</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable style={[s.button, s.botonChico]} onPress={() => setAporteMetaId(m.id)}>
                        <Text style={s.botonText}>+ Aportar</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => deleteGoal(m.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                    </Pressable>
                  </View>
                </Card>
              );
            })}

            {goals.length === 0 && (
              <EmptyState
                icono="flag-outline"
                title="Todavía no tenés metas"
                detail="Creá tu primera meta y empezá a medir tu progreso."
              />
            )}
          </>
        )}

        {tab === 'gastos' && (
          <>
            {/* Resumen del mes */}
            {resumen && (
              <Card style={s.resumen}>
                <Header text="Este mes" level="section" style={s.formTitle} />

                <Text style={s.resumenLabel}>Ingreso mensual</Text>
                <View style={s.ingresoFila}>
                  <TextInput
                    style={[s.input, s.ingresoInput]}
                    value={ingresoText || (resumen.income > 0 ? String(resumen.income) : '')}
                    onChangeText={setIngresoText}
                    keyboardType="numeric"
                    placeholder="Declarar ingreso"
                    placeholderTextColor={colors.tertiaryLabel}
                  />
                  <Pressable
                    style={[s.button, s.botonOk]}
                    onPress={() => {
                      const m = parseFloat(ingresoText);
                      if (m > 0) saveIncome(m);
                    }}
                  >
                    <Text style={s.botonText}>OK</Text>
                  </Pressable>
                </View>

                <View style={s.resumenDivisor} />

                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Total gastado</Text>
                  <Text style={s.resumenValue} numberOfLines={1}>{formatPesos(resumen.total)}</Text>
                </View>
                <View style={s.resumenFila}>
                  <Text style={s.resumenLabel}>Te sobra</Text>
                  <Text
                    style={[s.resumenValue, (resumen.leftover ?? 0) >= 0 ? s.green : s.red]}
                    numberOfLines={1}
                  >
                    {resumen.leftover != null ? formatPesos(resumen.leftover) : 'Declará tu ingreso'}
                  </Text>
                </View>
              </Card>
            )}

            {/* Por categoría */}
            {resumen && Object.keys(resumen.byCategory).length > 0 && (
              <Card style={s.posicion}>
                <Header text="Gastos por categoría" level="section" style={s.formTitle} />
                {Object.entries(resumen.byCategory).map(([cat, amount]) => {
                  const maxCat = Math.max(...Object.values(resumen.byCategory), 1);
                  const ancho = Math.max((amount / maxCat) * 100, 6);
                  return (
                    <View key={cat} style={s.categoriaFila}>
                      <Text style={s.categoriaName}>{cat}</Text>
                      <ProgressBar progreso={ancho} style={s.categoriaTrack} />
                      <Text style={s.categoriaAmount} numberOfLines={1}>{formatPesos(amount)}</Text>
                    </View>
                  );
                })}
              </Card>
            )}

            {/* Metas: cuánto necesito por mes */}
            {resumen && resumen.monthlyGoals.length > 0 && (
              <Card style={s.posicion}>
                <Header text="Para tus metas" level="section" style={s.formTitle} />
                {resumen.monthlyGoals.map((m) => (
                  <View key={m.name} style={s.categoriaFila}>
                    <Text style={s.categoriaName} numberOfLines={1}>{m.name}</Text>
                    <Text style={s.categoriaAmount} numberOfLines={1}>
                      {formatPesos(m.perMonth)}/mes · faltan {formatPesos(m.remaining)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Formulario de gasto */}
            <Card style={s.form}>
              <Header text="Agregar gasto" level="section" style={s.formTitle} />
              <View style={s.chips}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategoriaExpense(c)}
                    style={[s.chip, categoriaExpense === c && s.chipAsset]}
                  >
                    <Text style={[s.chipText, categoriaExpense === c && s.chipTextoAsset]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.filaInputs}>
                <TextInput
                  style={s.input}
                  value={descripcionExpense}
                  onChangeText={setDescripcionExpense}
                  placeholder="Descripción"
                  placeholderTextColor={colors.tertiaryLabel}
                />
                <TextInput
                  style={s.input}
                  value={montoExpense}
                  onChangeText={setMontoExpense}
                  keyboardType="numeric"
                  placeholder="Monto $"
                  placeholderTextColor={colors.tertiaryLabel}
                />
              </View>
              <Pressable
                style={({ pressed }) => [s.button, pressed && s.botonPressed]}
                onPress={async () => {
                  const m = parseFloat(montoExpense);
                  if (!m) {
                    Alert.alert('Error', 'Poné el monto del gasto.');
                    return;
                  }
                  await addExpense(categoriaExpense, descripcionExpense, m);
                  setMontoExpense('');
                  setDescripcionExpense('');
                }}
              >
                <Text style={s.botonText}>Agregar</Text>
              </Pressable>
            </Card>

            {/* Lista de gastos */}
            {expenses.map((g) => (
              <Card key={g.id} style={s.posicion}>
                <View style={s.posHeader}>
                  <Text style={s.posAsset} numberOfLines={1}>
                    {g.category}{g.description ? ` · ${g.description}` : ''}
                  </Text>
                  <Text style={s.posValue}>{formatPesos(g.amount)}</Text>
                </View>
                <View style={s.posPie}>
                  <Text style={s.posDetail}>{g.date}</Text>
                  <Pressable onPress={() => deleteExpense(g.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.systemRed} />
                  </Pressable>
                </View>
              </Card>
            ))}

            {expenses.length === 0 && (
              <EmptyState
                icono="receipt-outline"
                title="Todavía no tenés gastos"
                detail="Cargá tus gastos del mes para ver en qué se va tu plata."
              />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { marginBottom: spacing.lg },

    resumen: { padding: spacing.lg, marginBottom: spacing.lg },
    resumenFila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    resumenLabel: { ...typography.footnote, color: colors.secondaryLabel },
    resumenValue: { ...typography.title3, fontWeight: '700', color: colors.label, flexShrink: 1, textAlign: 'right' },
    resumenDivisor: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginVertical: spacing.md,
    },

    form: { padding: spacing.lg, marginBottom: spacing.lg },
    formTitle: { marginBottom: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    chip: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 16,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    chipAsset: { backgroundColor: colors.brand },
    chipText: { ...typography.caption1, color: colors.secondaryLabel },
    chipTextoAsset: { color: colors.onBrand, fontWeight: '600' },

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

    button: {
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
    },
    botonPressed: { opacity: 0.85 },
    botonChico: { alignSelf: 'flex-start' },
    botonText: { ...typography.subheadline, fontWeight: '700', color: colors.onBrand },

    posicion: { padding: spacing.lg, marginBottom: spacing.md },
    posHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
    posAsset: { ...typography.headline, fontWeight: '700', color: colors.label, flex: 1 },
    posGain: { ...typography.subheadline, fontWeight: '700' },
    posDetail: { ...typography.caption1, color: colors.secondaryLabel, marginTop: spacing.xs },
    posValue: { ...typography.footnote, fontWeight: '600', color: colors.label, flex: 1 },
    posPie: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    metaPct: { ...typography.subheadline, fontWeight: '700', color: colors.brand },
    stopLoss: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.dangerBg,
      borderRadius: radius.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
    },
    stopLossText: { ...typography.caption1, fontWeight: '600', color: colors.systemRed, flex: 1 },

    progressTrack: { marginTop: spacing.md },

    metaAcciones: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    aporteFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    aporteInput: { flex: 1 },

    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    ingresoFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    ingresoInput: { flex: 1 },
    botonOk: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, alignSelf: 'stretch' },
    categoriaFila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    categoriaName: { ...typography.footnote, color: colors.label, flex: 1 },
    categoriaTrack: { flex: 1.5 },
    categoriaAmount: {
      ...typography.footnote,
      fontWeight: '600',
      color: colors.label,
      textAlign: 'right',
      flexShrink: 1,
      minWidth: 80,
    },
  });
