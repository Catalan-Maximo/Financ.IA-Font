import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import useTestPerfil from '../hooks/useTestPerfil';
import { colors } from '../theme/colors';

interface TestPerfilProps {
  onTestComplete: (perfil: string) => void;
}

export default function TestPerfilScreen({ onTestComplete }: TestPerfilProps) {
  const {
    preguntaActual,
    indice,
    totalPreguntas,
    loading,
    aviso,
    limpiarAviso,
    responder,
  } = useTestPerfil(onTestComplete);

  // El aviso (éxito u offline) se muestra como alert cuando el hook lo emite
  useEffect(() => {
    if (aviso) {
      Alert.alert(aviso.titulo, aviso.mensaje, [{ text: 'OK', onPress: limpiarAviso }]);
    }
  }, [aviso, limpiarAviso]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header text={`Paso ${indice + 1} de ${totalPreguntas}`} level="label" style={styles.stepLabel} />
      <Header text={preguntaActual.texto} level="subtitle" style={styles.question} />

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {preguntaActual.opciones.map((opcion) => (
          <Card key={opcion.letra}>
            <Button
              title={`${opcion.letra}) ${opcion.texto}`}
              onPress={() => responder(opcion.puntos)}
              variant="secondary"
              textStyle={styles.optionText}
            />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  stepLabel: { marginBottom: 10 },
  question: { marginBottom: 30 },
  optionsContainer: { gap: 15, paddingBottom: 40 },
  optionText: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'left' },
});
