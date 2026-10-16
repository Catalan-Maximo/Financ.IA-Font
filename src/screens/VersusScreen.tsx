import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BackButton from '../components/BackButton';
import Loading from '../components/Loading';
import ProgressBar from '../components/ProgressBar';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { Performance } from '../domain/investment';
import type { Asset } from '../domain/asset';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { grid } from '../theme/grid';

/** Activos extra que no vienen en /activos/tasas pero sí en el comparador. */
const EXTRAS = [
  'Plazo Fijo Tradicional',
  'Dólar Oficial',
  'AAPL', 'MSFT', 'SPY', 'YPF', 'GGAL',
  'Bitcoin', 'Ethereum',
];

interface VersusResponse {
  activoA: Performance;
  activoB: Performance;
  ganador: string;
  probabilidadA: number | null;
  message: string;
}

interface VersusScreenProps {
  onBack: () => void;
}

/** Selector táctil de un activo (abre un modal con la lista). */
function SelectorAsset({
  title, seleccion, options, onElegir,
}: {
  title: string;
  seleccion: string;
  options: string[];
  onElegir: (name: string) => void;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable style={({ pressed }) => [s.selector, pressed && s.selectorPressed]} onPress={() => setAbierto(true)}>
        <Text style={s.selectorTitle}>{title}</Text>
        <Text style={s.selectorValue} numberOfLines={1}>{seleccion}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.tertiaryLabel} />
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <View style={s.modalFondo}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAbierto(false)} />
          <View style={s.modalPanel}>
            <ScrollView>
              {options.map((opcion) => (
                <Pressable
                  key={opcion}
                  style={({ pressed }) => [s.opcion, pressed && s.selectorPressed]}
                  onPress={() => { onElegir(opcion); setAbierto(false); }}
                >
                  <Text style={s.opcionText}>{opcion}</Text>
                  {opcion === seleccion && <Ionicons name="checkmark" size={18} color={colors.brand} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const formatPesos = (v: number) =>
  `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Tarjeta de resultado de un lado del versus. */
function CardResultado({ title, r }: { title: string; r: Performance }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Mismas líneas siempre (la de rango muestra "—" en renta fija):
  // así las dos tarjetas quedan simétricas en alto.
  const rango = r.worstCase != null && r.bestCase != null
    ? `${r.worstCase.toFixed(0)}% a +${r.bestCase.toFixed(0)}%`
    : '—';

  return (
    <Card style={s.resultCard}>
      <Text style={s.resultTitle}>{title}</Text>
      <Text style={s.resultEntity} numberOfLines={1}>{r.entity}</Text>
      <Text style={[s.resultReal, r.beatsInflation ? s.green : s.red]}>
        {r.realMonthlyRate > 0 ? '+' : ''}{r.realMonthlyRate}% real
      </Text>
      <Text style={s.resultDetail}>Riesgo: {r.risk}</Text>
      <Text style={s.resultDetail}>Rango: {rango}</Text>
    </Card>
  );
}

/**
 * Comparador Versus: dos activos cara a cara con sus métricas
 * clave para decidir cuál conviene.
 */
export default function VersusScreen({ onBack }: VersusScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [options, setOptions] = useState<string[]>(EXTRAS);
  const [ladoA, setLadoA] = useState('Plazo Fijo Tradicional');
  const [ladoB, setLadoB] = useState('Bitcoin');
  const [amount, setAmount] = useState(100000);
  const [term, setTerm] = useState(6);
  const [inflation, setInflation] = useState(2.1);
  const [loading, setLoading] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState<VersusResponse | null>(null);

  // Cargamos billeteras + inflación real para armar la lista de opciones
  useEffect(() => {
    Promise.all([
      api.get<Asset[]>('/assets/rates'),
      api.get('/assets/inflacion'),
    ])
      .then(([tasas, infl]) => {
        const billeteras = tasas.data
          .filter((a) => a.type === 'Billetera Virtual')
          .map((a) => a.entity);
        setOptions([...EXTRAS, ...billeteras]);
        const value = infl.data?.value;
        if (value && value > 0) setInflation(value);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const calcular = async () => {
    setCalculando(true);
    try {
      const response = await api.post<VersusResponse>('/markets/versus', {
        assetA: ladoA,
        assetB: ladoB,
        amount,
        months: term,
        monthlyInflation: inflation,
      }, { timeout: 60000 });
      setResultado(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculando(false);
    }
  };

  useEffect(() => {
    if (!loading) calcular();
  }, [ladoA, ladoB, loading]);

  if (loading) {
    return (
      <Screen>
        <Loading style={s.loading} />
      </Screen>
    );
  }

  const tonoGanador = (name: string): 'success' | 'warning' | 'danger' =>
    resultado?.ganador === name ? 'success' : 'warning';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BackButton onPress={onBack} />

        <Header text="Versus" level="title" style={s.title} />
        <Text style={s.subtitle}>Compará dos inversiones y mirá quién gana</Text>

        <View style={s.vsFila}>
          <View style={s.lado}>
            <SelectorAsset title="ACTIVO A" seleccion={ladoA} options={options} onElegir={setLadoA} />
          </View>
          <Text style={s.vs}>VS</Text>
          <View style={s.lado}>
            <SelectorAsset title="ACTIVO B" seleccion={ladoB} options={options} onElegir={setLadoB} />
          </View>
        </View>

        {calculando && <Loading />}

        {resultado && !calculando && (
          <>
            <View style={s.ganadorBanner}>
              <Ionicons name="trophy" size={20} color={colors.onBrand} />
              <Text style={s.ganadorText}>Gana: {resultado.ganador}</Text>
            </View>

            <View style={s.vsFila}>
              <View style={s.lado}><CardResultado title="Activo A" r={resultado.activoA} /></View>
              <View style={s.lado}><CardResultado title="Activo B" r={resultado.activoB} /></View>
            </View>

            {resultado.probabilidadA != null && (
              <ProgressBar
                progreso={Math.round(resultado.probabilidadA * 100)}
                style={s.probBar}
              />
            )}

            {/* Gráfico de ganancia real proyectada: las dos barras lado a lado */}
            <Card style={s.graficoCard}>
              <Header text="Ganancia real proyectada" level="section" style={s.graficoTitle} />
              {(() => {
                const ga = resultado.activoA.realGain;
                const gb = resultado.activoB.realGain;
                const maxAbs = Math.max(Math.abs(ga), Math.abs(gb), 1);
                const altura = (v: number) => Math.max((Math.abs(v) / maxAbs) * 90, 4);
                return (
                  <View style={s.graficoFila}>
                    {[{ name: resultado.activoA.entity, value: ga }, { name: resultado.activoB.entity, value: gb }].map((item) => (
                      <View key={item.name} style={s.barraCol}>
                        <Text style={[s.barraValue, item.value >= 0 ? s.green : s.red]} numberOfLines={1}>
                          {item.value >= 0 ? '+' : ''}{formatPesos(item.value)}
                        </Text>
                        <View style={[s.barraG, { height: altura(item.value), backgroundColor: item.value >= 0 ? colors.systemGreen : colors.systemRed }]} />
                        <Text style={s.barraName} numberOfLines={1}>{item.name}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </Card>

            <Card style={s.mensajeCard}>
              <Text style={s.mensajeText}>{resultado.message}</Text>
            </Card>

            <Text style={s.nota}>
              Monto ${amount.toLocaleString('es-AR')} · Plazo {term} meses · Inflación {inflation}% mensual
            </Text>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.xl },

    // grid.fila con stretch: las dos tarjetas de resultado miden siempre lo mismo
    vsFila: { ...grid.fila, marginBottom: spacing.lg },
    lado: { ...grid.col },
    vs: { ...typography.headline, fontWeight: '800', color: colors.tertiaryLabel, alignSelf: 'center' },

    selector: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    selectorPressed: { opacity: 0.7 },
    selectorTitle: { ...typography.caption2, fontWeight: '600', color: colors.tertiaryLabel },
    selectorValue: { ...typography.subheadline, fontWeight: '600', color: colors.label },

    modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalPanel: {
      maxHeight: '60%',
      backgroundColor: colors.secondarySystemBackground,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
    },
    opcion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    opcionText: { ...typography.body, color: colors.label },

    ganadorBanner: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    ganadorText: { ...typography.headline, fontWeight: '700', color: colors.onBrand },

    resultCard: { padding: spacing.md, flex: 1 },
    resultTitle: { ...typography.caption2, fontWeight: '600', color: colors.tertiaryLabel, marginBottom: spacing.xs },
    resultEntity: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    resultReal: { ...typography.title3, fontWeight: '700', marginVertical: spacing.xs },
    resultDetail: { ...typography.caption1, color: colors.secondaryLabel, marginTop: 2 },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },

    probBar: { marginBottom: spacing.md },

    mensajeCard: { padding: spacing.md, marginBottom: spacing.md },
    mensajeText: { ...typography.footnote, color: colors.label, lineHeight: 18 },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, textAlign: 'center' },

    graficoCard: { padding: spacing.lg, marginBottom: spacing.lg },
    graficoTitle: { marginBottom: spacing.lg },
    graficoFila: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      gap: spacing.xl,
    },
    barraCol: { flex: 1, alignItems: 'center', gap: spacing.xs, justifyContent: 'flex-end' },
    barraValue: { ...typography.footnote, fontWeight: '700' },
    barraG: { width: '70%', borderRadius: 6 },
    barraName: { ...typography.caption1, color: colors.secondaryLabel, textAlign: 'center' },
  });
