import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  /** Contenido interno de la tarjeta. */
  children: ReactNode;
  /** Estilos adicionales para el contenedor. */
  style?: ViewStyle;
}

/**
 * Tarjeta contenedor reutilizable.
 * Provee fondo oscuro, borde sutil y border-radius
 * consistente con el sistema de diseño de FinancIA.
 */
export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
