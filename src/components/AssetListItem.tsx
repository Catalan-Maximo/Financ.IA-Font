import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Badge from './Badge';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface AssetListItemProps {
  /** Símbolo (ticker) o nombre corto. */
  symbol: string;
  /** Nombre descriptivo. */
  name?: string;
  /** Precio formateado (string, ya viene listo). */
  price: string;
  /** Variación en % (negativa = rojo, positiva = verde). */
  variation: number;
  /** Detalle opcional (ej. "Compra/Venta" del dólar). */
  detail?: string;
  /** Badge de veredicto opcional (ej. "BUY" verde, "Cara" rojo). */
  badge?: { text: string; tono: 'success' | 'warning' | 'danger' | 'brand' };
  onPress?: () => void;
}

/** Paleta de colores para el avatar según el símbolo (estilo Lemon). */
const COLORES_AVATAR = ['#F7931A', '#627EEA', '#26A17A', '#F0B90B', '#3C3C3D'];

function colorAvatar(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return COLORES_AVATAR[hash % COLORES_AVATAR.length];
}

/**
 * Fila de activo estilo Lemon: avatar circular con iniciales a la
 * izquierda, nombre+ticker al centro, precio y variación a la derecha.
 */
export default function AssetListItem({ symbol, name, price, variation, detail, badge, onPress }: AssetListItemProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const avatarColor = useMemo(() => colorAvatar(symbol), [symbol]);

  return (
    <Pressable
      style={({ pressed }) => [s.fila, pressed && s.filaPressed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[s.avatar, { backgroundColor: avatarColor }]}>
        <Text style={s.avatarText} maxFontSizeMultiplier={1.3}>{symbol.substring(0, 2).toUpperCase()}</Text>
      </View>

      <View style={s.centro}>
        <Text style={s.symbol} numberOfLines={1} maxFontSizeMultiplier={1.3}>{symbol}</Text>
        {name && <Text style={s.name} numberOfLines={1} maxFontSizeMultiplier={1.3}>{name}</Text>}
        {detail && <Text style={s.name} numberOfLines={1} maxFontSizeMultiplier={1.3}>{detail}</Text>}
      </View>

      <View style={s.derecha}>
        <Text style={s.price} numberOfLines={1} maxFontSizeMultiplier={1.3}>{price}</Text>
        <Text style={[s.variation, variation >= 0 ? s.green : s.red]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {variation >= 0 ? '+' : ''}{variation.toFixed(2)}%
        </Text>
        {badge && <Badge label={badge.text} tone={badge.tono} style={s.badge} />}
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
    },
    filaPressed: { backgroundColor: colors.fill },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.subheadline, fontWeight: '700', color: '#FFFFFF' },
    centro: { flex: 1, minWidth: 0 },
    symbol: { ...typography.headline, fontWeight: '600', color: colors.label },
    name: { ...typography.caption1, color: colors.secondaryLabel },
    derecha: { alignItems: 'flex-end', gap: spacing.xs },
    badge: { alignSelf: 'flex-end' },
    price: { ...typography.headline, fontWeight: '600', color: colors.label },
    variation: { ...typography.footnote, fontWeight: '600' },
    green: { color: colors.systemGreen },
    red: { color: colors.systemRed },
  });
