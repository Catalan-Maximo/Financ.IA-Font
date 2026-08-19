import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';

/**
 * Variantes de estilo del botón.
 * - primary: fondo verde con texto blanco.
 * - secondary: fondo gris oscuro con borde.
 * - outline: fondo transparente con borde verde y texto verde.
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  /** Texto que muestra el botón. */
  title: string;
  /** Callback al presionar. */
  onPress: () => void;
  /** Variante visual (default: 'primary'). */
  variant?: ButtonVariant;
  /** Deshabilita el botón y reduce opacidad. */
  disabled?: boolean;
  /** Muestra un spinner y deshabilita el botón. */
  loading?: boolean;
  /** Estilos adicionales para el contenedor. */
  style?: ViewStyle;
  /** Estilos adicionales para el texto. */
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text : colors.primary}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* ── Base ─────────────────────────────────── */
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Variantes de contenedor ──────────────── */
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },

  /* ── Estado deshabilitado ─────────────────── */
  disabled: {
    opacity: 0.5,
  },

  /* ── Texto ────────────────────────────────── */
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.text,
  },
  secondaryText: {
    color: colors.textSecondary,
  },
  outlineText: {
    color: colors.primary,
  },
});
