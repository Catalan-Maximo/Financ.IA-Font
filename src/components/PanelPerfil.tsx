import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Switch,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface PanelPerfilProps {
  /** Si el panel está abierto. */
  visible: boolean;
  /** Perfil de inversor actual. */
  perfil: string;
  /** Cerrar el panel (tap en el scrim). */
  onClose: () => void;
  /** Rehacer el test del inversor (cierra sesión del perfil). */
  onRehacerTest: () => void;
}

/**
 * Panel deslizante desde la derecha (estilo iOS) con los datos del
 * usuario: perfil, toggle de modo oscuro y reinicio del test.
 */
export default function PanelPerfil({ visible, perfil, onClose, onRehacerTest }: PanelPerfilProps) {
  const { colors, dark, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const ANCHO = Math.min(width * 0.82, 340);

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

  const cambiarTema = (oscuro: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setMode(oscuro ? 'dark' : 'light');
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Scrim que oscurece el fondo y cierra al tocarlo */}
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
        <Header text="Tu Perfil" level="title" style={s.titulo} />
        <Badge label={`Perfil: ${perfil}`} tone="brand" style={s.badge} />

        <View style={s.separator} />

        {/* Toggle de apariencia */}
        <View style={s.fila}>
          <View style={s.filaIzq}>
            <Ionicons name={dark ? 'moon' : 'sunny'} size={22} color={colors.brand} />
            <Text style={s.filaTexto}>Modo oscuro</Text>
          </View>
          <Switch
            value={dark}
            onValueChange={cambiarTema}
            trackColor={{ false: colors.fill, true: colors.brand }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Reinicio del test */}
        <Pressable
          style={({ pressed }) => [s.fila, pressed && s.filaPressed]}
          onPress={onRehacerTest}
        >
          <View style={s.filaIzq}>
            <Ionicons name="refresh" size={22} color={colors.systemRed} />
            <Text style={[s.filaTexto, s.filaTextoPeligro]}>Rehacer test del inversor</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    scrim: {
      ...StyleSheet.absoluteFillObject,
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
      paddingHorizontal: spacing.xl,
    },
    titulo: { marginBottom: spacing.lg },
    badge: { alignSelf: 'flex-start', marginBottom: spacing.lg },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.separator,
      marginBottom: spacing.lg,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      marginHorizontal: -spacing.sm,
    },
    filaPressed: {
      backgroundColor: colors.fill,
    },
    filaIzq: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    filaTexto: {
      ...typography.body,
      color: colors.label,
    },
    filaTextoPeligro: {
      color: colors.systemRed,
    },
  });
