import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  /** Contenido interno de la tarjeta. */
  children: ReactNode;
  /** Estilos adicionales para el contenedor. */
  style?: ViewStyle;
}

/**
 * Tarjeta contenedor reutilizable.
 * Provee fondo oscuro (#202024), borde sutil y border-radius
 * consistente con el sistema de diseño de FinancIA.
 */
export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#202024',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#323238',
  },
});
