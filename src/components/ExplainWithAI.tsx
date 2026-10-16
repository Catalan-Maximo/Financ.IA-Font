import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../lib/api';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface ExplicarDatosIAProps {
  /** Texto con los datos a explicar (ej. "P/E 33.1, margen 5.3%..."). */
  data: string;
}

/**
 * Botón "explicámelo con IA": manda los datos al backend y muestra
 * la explicación en palabras simples, para usuarios sin formación financiera.
 */
export default function ExplainWithAI({ data }: ExplicarDatosIAProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const explicar = async () => {
    if (loading) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await api.post('/ia/explain', { data }, { timeout: 30000 });
      setResponse(res.data.response);
    } catch (e) {
      console.error(e);
      setResponse('No pude explicarlo ahora. Intentá de nuevo en unos segundos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.contenedor}>
      <Pressable
        style={({ pressed }) => [s.button, pressed && s.botonPressed]}
        onPress={explicar}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.brand} />
        ) : (
          <Ionicons name="sparkles-outline" size={16} color={colors.brand} />
        )}
        <Text style={s.botonText}>Que me lo explique la IA</Text>
      </Pressable>

      {response != null && (
        <View style={s.response}>
          <Text style={s.respuestaText}>{response}</Text>
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    contenedor: { marginTop: spacing.md },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.brand,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    botonPressed: { opacity: 0.7 },
    botonText: { ...typography.subheadline, fontWeight: '600', color: colors.brand },

    response: {
      backgroundColor: colors.secondarySystemBackground,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    respuestaText: { ...typography.footnote, color: colors.label, lineHeight: 18 },
  });
