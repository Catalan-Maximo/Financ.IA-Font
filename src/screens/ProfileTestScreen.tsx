import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import Card from '../components/Card';
import Screen from '../components/Screen';
import Loading from '../components/Loading';
import FadeIn from '../components/FadeIn';
import useProfileTest from '../hooks/useProfileTest';
import { useTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface TestPerfilProps {
  onTestComplete: (profile: string) => void;
}

/**
 * Test del inversor: 6 preguntas que definen el perfil del usuario
 * (Conservador, Moderado o Agresivo) según el puntaje.
 */
export default function ProfileTestScreen({ onTestComplete }: TestPerfilProps) {
  const {
    currentQuestion,
    index,
    totalQuestions,
    loading,
    notice,
    clearNotice,
    answer,
  } = useProfileTest(onTestComplete);

  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // El aviso (éxito u offline) se muestra como alert cuando el hook lo emite
  useEffect(() => {
    if (notice) {
      Alert.alert(notice.title, notice.message, [{ text: 'OK', onPress: clearNotice }]);
    }
  }, [notice, clearNotice]);

  // Barra de progreso animada (ancho real medido del track)
  const [trackWidth, setTrackWidth] = useState(0);
  const progreso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trackWidth > 0) {
      Animated.timing(progreso, {
        toValue: ((index + 1) / totalQuestions) * trackWidth,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [index, progreso, totalQuestions, trackWidth]);

  const elegir = (points: number) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    answer(points);
  };

  if (loading) {
    return (
      <Screen>
        <Loading style={s.loading} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header
        text={`Paso ${index + 1} de ${totalQuestions}`}
        level="label"
        style={s.stepLabel}
      />
      <View
        style={s.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[s.fill, { width: progreso }]} />
      </View>

      <ScrollView contentContainerStyle={s.optionsContainer} showsVerticalScrollIndicator={false}>
        <FadeIn key={index}>
          <Header text={currentQuestion.text} level="subtitle" style={s.question} />

          {currentQuestion.options.map((opcion) => (
            <Card key={opcion.letter} onPress={() => elegir(opcion.points)} style={s.optionCard}>
              <Text style={s.optionText}>{opcion.letter}) {opcion.text}</Text>
            </Card>
          ))}
        </FadeIn>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { marginBottom: spacing.sm },
    track: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.tertiarySystemBackground,
      marginBottom: spacing.xl,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.brand,
      borderRadius: 2,
    },
    question: { marginBottom: spacing.xxxl },
    optionsContainer: { gap: spacing.lg, paddingBottom: 40 },
    optionCard: { padding: spacing.lg },
    optionText: {
      ...typography.body,
      color: colors.label,
      textAlign: 'left',
    },
  });
