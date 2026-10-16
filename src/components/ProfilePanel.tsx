import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import type { TabKey } from './BottomNav';

interface PanelPerfilProps {
  /** Si el panel está abierto. */
  visible: boolean;
  /** Perfil de inversor actual. */
  profile: string;
  /** Email del usuario logueado. */
  email: string;
  /** Cerrar el panel (tap en el scrim). */
  onClose: () => void;
  /** Navegar a una pestaña de la app. */
  onNavigate: (tab: TabKey) => void;
  /** Abrir el panel de consultas frecuentes. */
  onOpenFaq: () => void;
  /** Abrir la pantalla VERSUS. */
  onOpenVersus: () => void;
  /** Abrir las noticias financieras. */
  onOpenNews: () => void;
  /** Rehacer el test del inversor. */
  onRedoTest: () => void;
  /** Cerrar sesión (borra token y vuelve al login). */
  onLogout: () => void;
}

/** Fila de menú con ícono, título y acción. */
function FilaMenu({
  icono,
  title,
  color,
  onPress,
  ultima = false,
  children,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
  ultima?: boolean;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [s.fila, !ultima && s.filaBorde, pressed && s.filaPressed]}
      onPress={onPress}
    >
      <View style={s.filaIzq}>
        <Ionicons name={icono} size={22} color={color} />
        <Text style={s.filaText}>{title}</Text>
      </View>
      {children}
    </Pressable>
  );
}

/**
 * Panel deslizante desde la derecha (estilo iOS) con la cuenta del
 * usuario organizada en grupos: navegación, preferencias, ayuda y cuenta.
 */
export default function PanelProfile({
  visible, profile, email, onClose, onNavigate, onOpenFaq, onOpenVersus, onOpenNews, onRedoTest, onLogout,
}: PanelPerfilProps) {
  const { colors, dark, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const ANCHO = Math.min(width * 0.85, 340);

  const scrim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-ANCHO)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scrim, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }),
      Animated.spring(slide, {
        toValue: visible ? 0 : -ANCHO,
        tension: 220,
        friction: 26,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, ANCHO, scrim, slide]);

  const toggleTheme = (oscuro: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setMode(oscuro ? 'dark' : 'light');
  };

  const navigate = (tab: TabKey) => {
    onClose();
    onNavigate(tab);
  };

  const inicial = (email.trim().charAt(0) || 'F').toUpperCase();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[s.scrim, { opacity: scrim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          s.panel,
          {
            width: ANCHO,
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Cabecera de cuenta ─── */}
          <View style={s.cabecera}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{inicial}</Text>
            </View>
            <View style={s.cabeceraText}>
              <Text style={s.email} numberOfLines={1}>{email || 'usuario@financia.com'}</Text>
              <Badge label={`Perfil: ${profile}`} tone="brand" style={s.badge} />
            </View>
          </View>

          {/* ── Navegación ─── */}
          <Text style={s.seccionTitle}>IR A</Text>
          <View style={s.grupo}>
            <FilaMenu icono="home-outline" title="Inicio" color={colors.brand} onPress={() => navigate('dashboard')} />
            <FilaMenu icono="stats-chart-outline" title="Mercados" color={colors.brand} onPress={() => navigate('mercados')} />
            <FilaMenu icono="wallet-outline" title="Mi Dinero" color={colors.brand} onPress={() => navigate('midinero')} />
            <FilaMenu icono="git-compare-outline" title="Versus" color={colors.brand} onPress={() => { onClose(); onOpenVersus(); }} />
            <FilaMenu icono="chatbubbles-outline" title="Chat de dudas" color={colors.brand} onPress={() => navigate('chat')} />
            <FilaMenu icono="calculator-outline" title="Simulador" color={colors.brand} onPress={() => navigate('simulador')} ultima />
          </View>

          {/* ── Preferencias ─── */}
          <Text style={s.seccionTitle}>PREFERENCIAS</Text>
          <View style={s.grupo}>
            <FilaMenu icono={dark ? 'moon' : 'sunny'} title="Modo oscuro" color={colors.brand} onPress={() => toggleTheme(!dark)} ultima>
              <Switch
                value={dark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.fill, true: colors.brand }}
                thumbColor="#FFFFFF"
              />
            </FilaMenu>
          </View>

          {/* ── Mercados y noticias ─── */}
          <Text style={s.seccionTitle}>INFORMACIÓN</Text>
          <View style={s.grupo}>
            <FilaMenu icono="newspaper-outline" title="Noticias financieras" color={colors.brand} onPress={() => { onClose(); onOpenNews(); }} />
            <FilaMenu icono="help-circle-outline" title="Consultas frecuentes" color={colors.systemBlue} onPress={() => { onClose(); onOpenFaq(); }} ultima />
          </View>

          {/* ── Cuenta ─── */}
          <Text style={s.seccionTitle}>CUENTA</Text>
          <View style={s.grupo}>
            <FilaMenu icono="refresh" title="Rehacer test del inversor" color={colors.systemRed} onPress={onRedoTest} />
            <FilaMenu icono="log-out-outline" title="Cerrar sesión" color={colors.systemRed} onPress={onLogout} ultima />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      backgroundColor: colors.secondarySystemBackground,
      borderTopRightRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.separator,
      paddingHorizontal: spacing.lg,
    },

    /* ── Cabecera ─── */
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.title2, fontWeight: '700', color: colors.onBrand },
    cabeceraText: { flex: 1, gap: spacing.xs },
    email: { ...typography.headline, fontWeight: '600', color: colors.label },
    badge: { alignSelf: 'flex-start' },

    /* ── Grupos ─── */
    seccionTitle: {
      ...typography.caption2,
      fontWeight: '600',
      color: colors.tertiaryLabel,
      marginBottom: spacing.xs,
      marginLeft: spacing.sm,
      letterSpacing: 0.5,
    },
    grupo: {
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    filaBorde: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.separator,
    },
    filaPressed: {
      backgroundColor: 'rgba(128,128,128,0.15)',
    },
    filaIzq: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    filaText: {
      ...typography.body,
      color: colors.label,
    },
  });
