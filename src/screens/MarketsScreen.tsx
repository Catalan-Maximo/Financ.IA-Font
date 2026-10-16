import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Screen from '../components/Screen';
import AssetListItem from '../components/AssetListItem';
import PackCard from '../components/PackCard';
import SegmentedTabs from '../components/SegmentedTabs';
import Loading from '../components/Loading';
import BarChart, { type ChartPoint } from '../components/BarChart';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useMarkets from '../hooks/useMarkets';
import useCrypto from '../hooks/useCrypto';
import type { PackQuote, StockQuote } from '../domain/markets';
import type { CryptoState, CryptoInfo } from '../domain/crypto';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

type TabMarket = 'acciones' | 'dolar' | 'crypto';

const TABS: { key: TabMarket; label: string }[] = [
  { key: 'acciones', label: 'Acciones' },
  { key: 'dolar', label: 'Dólar' },
  { key: 'crypto', label: 'Crypto' },
];

const TONO_VEREDICTO: Record<string, 'success' | 'warning' | 'danger'> = {
  BUY: 'success',
  WATCH: 'warning',
  AVOID: 'danger',
};

interface MercadosScreenProps {
  onOpenPack: (pack: PackQuote) => void;
  onOpenCryptoDetail: (state: CryptoState) => void;
  onOpenVersus: () => void;
  onOpenStock: (accion: StockQuote) => void;
  onOpenCryptoInfo: (info: CryptoInfo) => void;
}

/**
 * Sección Mercados con navegación superior (Acciones / Dólar / Crypto)
 * y carrusel horizontal de packs de inversión.
 */
/**
 * Pantalla Mercados: acciones argentinas y SPY (Yahoo Finance),
 * packs de inversión y cotizaciones del dólar.
 */
export default function MarketsScreen({ onOpenPack, onOpenCryptoDetail, onOpenVersus, onOpenStock, onOpenCryptoInfo }: MercadosScreenProps) {
  const [tab, setTab] = useState<TabMarket>('acciones');
  const { acciones, packs, dollar, loading, error, clearError } = useMarkets();
  const { crypto, extras } = useCrypto();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Historial del dólar oficial para el gráfico de la pestaña Dólar
  const [historialDollar, setHistorialDollar] = useState<ChartPoint[]>([]);
  useEffect(() => {
    api.get<ChartPoint[]>('/markets/dollar-historial?days=30')
      .then((r) => setHistorialDollar(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error de carga', 'No se pudieron sincronizar los mercados.', [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  if (loading) {
    return (
      <Screen>
        <Loading style={s.loading} />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <Header text="Mercados" level="title" style={s.title} />

      {/* Acceso al VERSUS */}
      <Pressable
        style={({ pressed }) => [s.versusBtn, pressed && s.versusPressed]}
        onPress={onOpenVersus}
      >
        <Ionicons name="git-compare-outline" size={18} color={colors.onBrand} />
        <Text style={s.versusText}>Versus: compará dos inversiones</Text>
      </Pressable>

      {/* Top Tabs */}
      <SegmentedTabs
        options={TABS}
        activa={tab}
        onCambiar={(t) => setTab(t as TabMarket)}
        style={s.tabsMargin}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl,
        }}
      >
        {tab === 'acciones' && (
          <>
            {/* Carrusel de packs */}
            <Header text="Packs de Inversión" level="section" style={s.seccion} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} onPress={() => onOpenPack(pack)} />
              ))}
            </ScrollView>

            {/* Lista de acciones */}
            <Header text="Acciones y ETFs" level="section" style={s.seccion} />
            {acciones.map((a) => (
              <AssetListItem
                key={a.ticker}
                symbol={a.ticker}
                name={nombreTicker(a.ticker)}
                price={`$${a.price.toLocaleString('es-AR')}`}
                variation={a.variation24h}
                onPress={() => onOpenStock(a)}
              />
            ))}
          </>
        )}

        {tab === 'dolar' && (
          <>
            <Header text="Dólar Oficial — últimos 30 días" level="section" style={s.seccion} />
            {historialDollar.length > 1 && (
              <View style={s.graficoDollar}>
                <BarChart points={historialDollar} prefijo="$" />
              </View>
            )}
            <Header text="Cotizaciones del Dólar" level="section" style={s.seccion} />
            {dollar.map((d) => (
              <AssetListItem
                key={d.name}
                symbol={abreviaturaDollar(d.name)}
                name={d.name}
                price={`$${d.sellPrice.toLocaleString('es-AR')}`}
                variation={0}
                detail={`Compra $${d.buyPrice.toLocaleString('es-AR')} · Venta $${d.sellPrice.toLocaleString('es-AR')} · ${d.date}`}
              />
            ))}
          </>
        )}

        {tab === 'crypto' && (
          <>
            <Header text="Cripto" level="section" style={s.seccion} />
            {crypto.map((c) => (
              <AssetListItem
                key={c.symbol}
                symbol={c.symbol.replace('USDT', '')}
                name={c.symbol.startsWith('BTC') ? 'Bitcoin' : 'Ethereum'}
                price={`$${c.price.toLocaleString('es-AR')}`}
                variation={c.change3d ?? 0}
                detail={`RSI ${c.rsi14 != null ? c.rsi14.toFixed(1) : 'n/d'}`}
                badge={{
                  text: c.verdict,
                  tono: TONO_VEREDICTO[c.verdict] ?? 'warning',
                }}
                onPress={() => onOpenCryptoDetail(c)}
              />
            ))}

            {extras.length > 0 && (
              <>
                <Header text="Otras criptomonedas (informativo)" level="section" style={s.seccion} />
                {extras.map((info) => (
                  <AssetListItem
                    key={info.symbol}
                    symbol={info.symbol.replace('USDT', '')}
                    name={info.name}
                    price={`$${info.price.toLocaleString('es-AR')}`}
                    variation={info.variation24h}
                    onPress={() => onOpenCryptoInfo(info)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

/** Nombres amigables para los tickers de la sección Acciones. */
function nombreTicker(ticker: string): string {
  const nombres: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corp.',
    SPY: 'SPDR S&P 500 ETF',
    YPF: 'YPF S.A. (ADR)',
    GGAL: 'Grupo Financiero Galicia (ADR)',
  };
  return nombres[ticker] ?? ticker;
}

/** Abreviatura para el avatar de cada dólar. */
function abreviaturaDollar(name: string): string {
  const abrev: Record<string, string> = {
    'Oficial': 'OF',
    'Blue': 'BL',
    'Bolsa': 'MEP',
    'Contado con liquidación': 'CCL',
    'Cripto': 'CR',
    'Tarjeta': 'TA',
    'Mayorista': 'MA',
  };
  return abrev[name] ?? name.substring(0, 2).toUpperCase();
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { marginTop: spacing.lg, marginBottom: spacing.lg },

    versusBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
    },
    versusPressed: { opacity: 0.85 },
    versusText: { ...typography.subheadline, fontWeight: '700', color: colors.onBrand },

    graficoDollar: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },

    tabsMargin: { marginBottom: spacing.sm },

    seccion: { marginTop: spacing.xl, marginBottom: spacing.md },
  });
