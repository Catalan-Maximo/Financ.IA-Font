import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Screen from '../components/Screen';
import { TAB_BAR_HEIGHT } from '../components/BottomNav';
import useChat from '../hooks/useChat';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

/** Sugerencias iniciales: desaparecen con el primer mensaje del usuario. */
const SUGERENCIAS = [
  '¿Qué es el dólar MEP?',
  '¿Cuánto rinde Mercado Pago hoy?',
  '¿Cómo me protejo de la inflación?',
];

/**
 * Chat de dudas: el usuario pregunta lo que sea y el asistente
 * responde con los datos reales de la app (tasas, dólar, cripto, packs).
 */
export default function ChatScreen() {
  const { messages, sending, send, clear } = useChat();
  const [text, setText] = useState('');
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, sending]);

  const hasMessages = messages.length > 0;

  const mandar = () => {
    const t = text;
    setText('');
    send(t);
  };

  return (
    <Screen safeTop={false}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.bottom}
      >
        <Header text="Chat de Dudas" level="title" style={s.title} />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.md,
          }}
        >
          {/* Sugerencias (solo antes del primer mensaje) */}
          {!hasMessages && (
            <>
              <Text style={s.subtitle}>
                Preguntame lo que quieras sobre la app, tasas, dólar, crypto o inflación:
              </Text>
              {SUGERENCIAS.map((pregunta) => (
                <Pressable
                  key={pregunta}
                  style={({ pressed }) => [s.chip, pressed && s.chipPressed]}
                  onPress={() => send(pregunta)}
                >
                  <Text style={s.chipText}>{pregunta}</Text>
                </Pressable>
              ))}
            </>
          )}

          {/* Burbujas */}
          {messages.map((m, i) => (
            <View
              key={i}
              style={[s.bubble, m.role === 'user' ? s.userBubble : s.botBubble]}
            >
              <Text style={m.role === 'user' ? s.userText : s.botText}>{m.content}</Text>
            </View>
          ))}

          {sending && (
            <View style={[s.bubble, s.botBubble]}>
              <Text style={s.botText}>Escribiendo…</Text>
            </View>
          )}
        </ScrollView>

        {/* Barra de entrada (reserva espacio para la tab bar inferior) */}
        <View style={[s.barra, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.sm }]}>
          {hasMessages && (
            <Pressable onPress={clear} hitSlop={8} style={s.limpiarBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.tertiaryLabel} />
            </Pressable>
          )}
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribí tu duda…"
            placeholderTextColor={colors.tertiaryLabel}
            onSubmitEditing={mandar}
            returnKeyType="send"
            editable={!sending}
          />
          <Pressable
            onPress={mandar}
            disabled={sending || !text.trim()}
            style={[s.enviarBtn, (sending || !text.trim()) && s.enviarBtnOff]}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    flex: { flex: 1 },
    title: { marginTop: spacing.lg, marginBottom: spacing.lg },
    subtitle: { ...typography.callout, color: colors.secondaryLabel, marginBottom: spacing.md },

    chip: {
      alignSelf: 'flex-start',
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: 18,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    chipPressed: { opacity: 0.7 },
    chipText: { ...typography.subheadline, color: colors.label },

    bubble: {
      maxWidth: '82%',
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.brand,
    },
    botBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.secondarySystemBackground,
    },
    userText: { ...typography.body, color: colors.onBrand },
    botText: { ...typography.body, color: colors.label },

    barra: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.sm,
    },
    limpiarBtn: { padding: spacing.xs },
    input: {
      flex: 1,
      backgroundColor: colors.tertiarySystemBackground,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.label,
      ...typography.body,
    },
    enviarBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    enviarBtnOff: { opacity: 0.4 },
  });
