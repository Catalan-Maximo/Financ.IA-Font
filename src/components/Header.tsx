import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

/**
 * Nivel jerárquico del encabezado.
 * - title:    24px – Título principal de pantalla.
 * - subtitle: 22px – Subtítulo / pregunta destacada.
 * - section:  14px – Encabezado de sección, uppercase.
 * - label:    14px – Label pequeño y resaltado (ej. "Paso 1 de 3").
 */
type HeaderLevel = 'title' | 'subtitle' | 'section' | 'label';

interface HeaderProps {
  /** Texto a mostrar. */
  text: string;
  /** Nivel jerárquico (default: 'title'). */
  level?: HeaderLevel;
  /** Estilos adicionales. */
  style?: TextStyle;
}

export default function Header({ text, level = 'title', style }: HeaderProps) {
  return <Text style={[styles.base, styles[level], style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  base: {
    fontWeight: 'bold',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  subtitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 32,
  },

  section: {
    color: '#8D8D99',
    fontSize: 14,
    textTransform: 'uppercase',
  },

  label: {
    color: '#00B37E',
    fontSize: 14,
  },
});
