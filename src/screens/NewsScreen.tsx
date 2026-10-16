import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking, Pressable, ScrollView, StyleSheet, Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface NewsItem {
  title: string;
  medio: string;
  link: string;
}

interface NoticiasScreenProps {
  onBack: () => void;
}

/**
 * Noticias financieras destacadas (Yahoo Finance).
 * Tocar una noticia abre el artículo en el navegador.
 */
export default function NewsScreen({ onBack }: NoticiasScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [noticias, setNoticias] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<NewsItem[]>('/markets/news')
      .then((r) => setNoticias(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <BackButton onPress={onBack} />

        <Header text="Noticias Financieras" level="title" style={s.title} />
        <Text style={s.subtitle}>Lo más destacado del día, de Yahoo Finance</Text>

        {loading && <Loading />}

        {noticias.map((n) => (
          <Pressable
            key={n.title}
            onPress={() => n.link && Linking.openURL(n.link)}
            style={({ pressed }) => [s.noticia, pressed && s.noticiaPressed]}
          >
            <Text style={s.noticiaTitle} numberOfLines={2}>{n.title}</Text>
            <Text style={s.noticiaMedio}>{n.medio || 'Yahoo Finance'}</Text>
          </Pressable>
        ))}

        {!loading && noticias.length === 0 && (
          <EmptyState
            icono="newspaper-outline"
            title="No hay noticias ahora"
            detail="Volvé más tarde: el feed se actualiza durante el día."
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    title: { marginBottom: spacing.xs },
    subtitle: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.lg },

    noticia: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    noticiaPressed: { opacity: 0.7 },
    noticiaTitle: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    noticiaMedio: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.xs },
  });
