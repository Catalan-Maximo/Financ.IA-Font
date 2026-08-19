import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/** Pestañas disponibles en la navegación inferior. */
export type TabKey = 'dashboard' | 'simulador' | 'asesor';

interface BottomNavProps {
  /** Pestaña activa en este momento. */
  activeTab: TabKey;
  /** Callback al tocar una pestaña distinta. */
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; icono: string; label: string }[] = [
  { key: 'dashboard', icono: '🏠', label: 'Inicio' },
  { key: 'simulador', icono: '🧮', label: 'Simulador' },
  { key: 'asesor', icono: '🤖', label: 'Asesor' },
];

/**
 * Barra de navegación inferior reutilizable.
 * Muestra las pestañas principales de la app y resalta la activa
 * con color e indicador.
 */
export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const esActiva = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.icono}>{tab.icono}</Text>
            <Text style={[styles.label, esActiva && styles.labelActiva]}>
              {tab.label}
            </Text>
            {esActiva && <View style={styles.indicador} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 20, // espacio extra para el home indicator del celular
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icono: { fontSize: 20 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  labelActiva: { color: colors.primary },
  indicador: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});
