import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { RendimientoDTO } from '../domain/inversion';
import type { Activo } from '../domain/activo';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

/** Activos extra que no vienen en /activos/tasas pero sí en el comparador. */
const EXTRAS = [
  'Plazo Fijo Tradicional',
  'Dólar Oficial',
  'AAPL', 'MSFT', 'SPY', 'YPF', 'GGAL',
  'Bitcoin', 'Ethereum',
];

interface VersusResponse {
  activoA: RendimientoDTO;
  activoB: RendimientoDTO;
  ganador: string;
  probabilidadA: number | null;
  mensaje: string;
}

interface VersusScreenProps {
  onVolver: () => void;
}

/** Selector táctil de un activo (abre un modal con la lista). */
function SelectorActivo({
  titulo, seleccion, opciones, onElegir,
}: {
  titulo: string;
  seleccion: string;
  opciones: string[];
  onElegir: (nombre: string) => void;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Pressable style={({ pressed }) => [s.selector, pressed && s.selectorPressed]} onPress={() => setAbierto(true)}>
        <Text style={s.selectorTitulo}>{titulo}</Text>
        <Text style={s.selectorValor} numberOfLines={1}>{seleccion}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.tertiaryLabel} />
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <View style={s.modalFondo}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAbierto(false)} />
          <View style={s.modalPanel}>
            <ScrollView>
              {opciones.map((opcion) => (
                <Pressable
                  key={opcion}
                  style={({ pressed }) => [s.opcion, pressed && s.selectorPressed]}
                  onPress={() => { onElegir(opcion); setAbierto(false); }}
                >
                  <Text style={s.opcionTexto}>{opcion}</Text>
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

/** Tarjeta de resultado de un lado del versus. */
function CardResultado({ titulo, r }: { titulo: string; r: RendimientoDTO }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Card style={s.resultCard}>
      <Text style={s.resultTitulo}>{titulo}</Text>
      <Text style={s.resultEntidad}>{r.entidad}</Text>
      <Text style={[s.resultReal, r.leGanaALaInflacion ? s.verde : s.rojo]}>
        {r.tasaRealMensual > 0 ? '+' : ''}{r.tasaRealMensual}% real mensual
      </Text>
      <Text style={s.resultDetalle}>Riesgo: {r.riesgo}</Text>
      {r.peorEscenario != null && r.mejorEscenario != null && (
        <Text style={s.resultDetalle}>
          Rango: {r.peorEscenario.toFixed(0)}% a +{r.mejorEscenario.toFixed(0)}%
        </Text>
      )}
    </Card>
  );
}

export default function VersusScreen({ onVolver }: VersusScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [opciones, setOpciones] = useState<string[]>(EXTRAS);
  const [ladoA, setLadoA] = useState('Plazo Fijo Tradicional');
  const [ladoB, setLadoB] = useState('Bitcoin');
  const [monto, setMonto] = useState(100000);
  const [plazo, setPlazo] = useState(6);
  const [inflacion, setInflacion] = useState(2.1);
  const [cargando, setCargando] = useState(true);
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState<VersusResponse | null>(null);

  // Cargamos billeteras + inflación real para armar la lista de opciones
  useEffect(() => {
    Promise.all([
      api.get<Activo[]>('/activos/tasas'),
      api.get('/activos/inflacion'),
    ])
      .then(([tasas, infl]) => {
        const billeteras = tasas.data
          .filter((a) => a.tipo === 'Billetera Virtual')
          .map((a) => a.entidad);
        setOpciones([...EXTRAS, ...billeteras]);
        const valor = infl.data?.valor;
        if (valor && valor > 0) setInflacion(valor);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const calcular = async () => {
    setCalculando(true);
    try {
      const response = await api.post<VersusResponse>('/mercados/versus', {
        entidadA: ladoA,
        entidadB: ladoB,
        monto,
        plazoMeses: plazo,
        inflacionMensual: inflacion,
      }, { timeout: 60000 });
      setResultado(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculando(false);
    }
  };

  useEffect(() => {
    if (!cargando) calcular();
  }, [ladoA, ladoB, cargando]);

  if (cargando) {
    return (
      <Screen style={s.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </Screen>
    );
  }

  const tonoGanador = (nombre: string): 'success' | 'warning' | 'danger' =>
    resultado?.ganador === nombre ? 'success' : 'warning';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <Pressable onPress={onVolver} hitSlop={8} style={s.volver}>
          <Ionicons name="chevron-back" size={22} color={colors.label} />
        </Pressable>

        <Header text="⚔️ Versus" level="title" style={s.titulo} />
        <Text style={s.subtitulo}>Compará dos inversiones y mirá quién gana</Text>

        <View style={s.vsFila}>
          <View style={s.lado}>
            <SelectorActivo titulo="ACTIVO A" seleccion={ladoA} opciones={opciones} onElegir={setLadoA} />
          </View>
          <Text style={s.vs}>VS</Text>
          <View style={s.lado}>
            <SelectorActivo titulo="ACTIVO B" seleccion={ladoB} opciones={opciones} onElegir={setLadoB} />
          </View>
        </View>

        {calculando && (
          <View style={s.loadingRow}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        )}

        {resultado && !calculando && (
          <>
            <View style={s.ganadorBanner}>
              <Text style={s.ganadorTexto}>🏆 Gana: {resultado.ganador}</Text>
            </View>

            <View style={s.vsFila}>
              <View style={s.lado}><CardResultado titulo="Activo A" r={resultado.activoA} /></View>
              <View style={s.lado}><CardResultado titulo="Activo B" r={resultado.activoB} /></View>
            </View>

            {resultado.probabilidadA != null && (
              <View style={s.probBar}>
                <View style={[s.probFill, { width: `${Math.round(resultado.probabilidadA * 100)}%` }]} />
              </View>
            )}

            <Card style={s.mensajeCard}>
              <Text style={s.mensajeTexto}>{resultado.mensaje}</Text>
            </Card>

            <Text style={s.nota}>
              Monto ${monto.toLocaleString('es-AR')} · Plazo {plazo} meses · Inflación {inflacion}% mensual
            </Text>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { alignItems: 'center', justifyContent: 'center' },
    volver: {
      alignSelf: 'flex-start',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.fill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    titulo: { marginBottom: spacing.xs },
    subtitulo: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.xl },

    vsFila: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm, marginBottom: spacing.lg },
    lado: { flex: 1 },
    vs: { ...typography.headline, fontWeight: '800', color: colors.tertiaryLabel, alignSelf: 'center' },

    selector: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.xs,
    },
    selectorPressed: { opacity: 0.7 },
    selectorTitulo: { ...typography.caption2, fontWeight: '600', color: colors.tertiaryLabel },
    selectorValor: { ...typography.subheadline, fontWeight: '600', color: colors.label },

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
    opcionTexto: { ...typography.body, color: colors.label },

    loadingRow: { alignItems: 'center', paddingVertical: spacing.xl },

    ganadorBanner: {
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    ganadorTexto: { ...typography.headline, fontWeight: '700', color: colors.onBrand },

    resultCard: { padding: spacing.md },
    resultTitulo: { ...typography.caption2, fontWeight: '600', color: colors.tertiaryLabel, marginBottom: spacing.xs },
    resultEntidad: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    resultReal: { ...typography.title3, fontWeight: '700', marginVertical: spacing.xs },
    resultDetalle: { ...typography.caption1, color: colors.secondaryLabel, marginTop: 2 },
    verde: { color: colors.systemGreen },
    rojo: { color: colors.systemRed },

    probBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.tertiarySystemBackground,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    probFill: { height: '100%', backgroundColor: colors.brand, borderRadius: 4 },

    mensajeCard: { padding: spacing.md, marginBottom: spacing.md },
    mensajeTexto: { ...typography.footnote, color: colors.label, lineHeight: 18 },
    nota: { ...typography.caption2, color: colors.tertiaryLabel, textAlign: 'center' },
  });
