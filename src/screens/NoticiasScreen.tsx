import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../lib/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface Noticia {
  titulo: string;
  medio: string;
  link: string;
}

interface NoticiasScreenProps {
  onVolver: () => void;
}

/**
 * Noticias financieras destacadas (Yahoo Finance).
 * Tocar una noticia abre el artículo en el navegador.
 */
export default function NoticiasScreen({ onVolver }: NoticiasScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get<Noticia[]>('/mercados/noticias')
      .then((r) => setNoticias(r.data))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xxl }}
      >
        <Pressable onPress={onVolver} hitSlop={8} style={s.volver}>
          <Ionicons name="chevron-back" size={22} color={colors.label} />
        </Pressable>

        <Header text="Noticias Financieras" level="title" style={s.titulo} />
        <Text style={s.subtitulo}>Lo más destacado del día, de Yahoo Finance</Text>

        {cargando && (
          <View style={s.loading}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        )}

        {noticias.map((n) => (
          <Pressable
            key={n.titulo}
            onPress={() => n.link && Linking.openURL(n.link)}
            style={({ pressed }) => [s.noticia, pressed && s.noticiaPressed]}
          >
            <Text style={s.noticiaTitulo} numberOfLines={2}>{n.titulo}</Text>
            <Text style={s.noticiaMedio}>{n.medio || 'Yahoo Finance'}</Text>
          </Pressable>
        ))}

        {!cargando && noticias.length === 0 && (
          <Text style={s.vacio}>No hay noticias disponibles ahora.</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
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
    subtitulo: { ...typography.body, color: colors.secondaryLabel, marginBottom: spacing.lg },
    loading: { alignItems: 'center', paddingVertical: spacing.xl },

    noticia: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    noticiaPressed: { opacity: 0.7 },
    noticiaTitulo: { ...typography.subheadline, fontWeight: '600', color: colors.label },
    noticiaMedio: { ...typography.caption2, color: colors.tertiaryLabel, marginTop: spacing.xs },

    vacio: { ...typography.footnote, color: colors.tertiaryLabel, textAlign: 'center', marginTop: spacing.xl },
  });
