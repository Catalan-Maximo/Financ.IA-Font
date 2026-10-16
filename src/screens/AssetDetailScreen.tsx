import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Badge from '../components/Badge';
import BackButton from '../components/BackButton';
import Screen from '../components/Screen';
import BarChart, { type ChartPoint } from '../components/BarChart';
import ExplainWithAI from '../components/ExplainWithAI';
import { ESTIMATED_MONTHLY_INFLATION } from '../constants';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import type { Asset } from '../domain/asset';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
}

/**
 * Detalle de un activo de renta fija: tasa actual y tendencia
 * de los últimos 30 días (los datos los guarda el job diario).
 */
export default function AssetDetailScreen({ asset, onBack }: AssetDetailProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [history, setHistory] = useState<ChartPoint[]>([]);

  useEffect(() => {
    api.get<ChartPoint[]>(`/assets/history/${encodeURIComponent(asset.entity)}`)
      .then((r) => setHistory(r.data))
      .catch(() => {});
  }, [asset.entity]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BackButton onPress={onBack} />

        <Header text={asset.entity} level="title" style={s.title} />
        <View style={s.data}>
          <Badge label={asset.type} tone="brand" />
          <Text style={s.tna}>{asset.tna}% TNA</Text>
        </View>
        {(() => {
          const real = asset.tna / 12 - ESTIMATED_MONTHLY_INFLATION;
          return (
            <Badge
              label={real > 0 ? 'Le gana a la inflación' : 'Pierde con la inflación'}
              tone={real > 0 ? 'success' : 'danger'}
              style={s.veredictoBadge}
            />
          );
        })()}

        <Card style={s.card}>
          <Header text="Tendencia — últimos 30 días" level="section" style={s.seccion} />
          {history.length > 1 ? (
            <BarChart points={history} prefijo="" />
          ) : (
            <Text style={s.sinData}>Todavía no hay historial suficiente (se acumula día a día).</Text>
          )}
        </Card>

        <Card style={s.card}>
          <Header text="Riesgo" level="section" style={s.seccion} />
          <Text style={s.text}>
            Renta fija: el rendimiento es contractual (Bajo riesgo). No fluctúa como las
            acciones o crypto, aunque puede perder contra la inflación.
          </Text>
        </Card>

        <ExplainWithAI data={
          `${asset.entity} (${asset.type}): TNA ${asset.tna}% anual. ` +
          `Rendimiento real mensual estimado ${(asset.tna / 12 - 4).toFixed(2)}% contra una inflación del 4%.`
        } />
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    title: { marginBottom: spacing.md },
    data: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    veredictoBadge: { alignSelf: 'flex-start', marginBottom: spacing.md },
    tna: { ...typography.title2, fontWeight: '700', color: colors.label },

    card: { padding: spacing.lg, marginBottom: spacing.lg },
    seccion: { marginBottom: spacing.lg },
    sinData: { ...typography.footnote, color: colors.secondaryLabel },
    text: { ...typography.footnote, color: colors.secondaryLabel, lineHeight: 18 },
  });
