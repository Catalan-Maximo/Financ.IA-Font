import React, { useEffect } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import useTestPerfil from '../hooks/useTestPerfil';
import { colors } from '../theme/colors';

interface TestPerfilProps {
  onTestComplete: (perfil: string) => void;
}

export default function TestPerfilScreen({ onTestComplete }: TestPerfilProps) {
  const { loading, aviso, limpiarAviso, finalizarTest } = useTestPerfil(onTestComplete);

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
      <Header text="Paso 1 de 1" level="label" style={styles.stepLabel} />
      <Header
        text="¿Qué harías si tus inversiones bajan un 10% en un mes?"
        level="subtitle"
        style={styles.question}
      />

      <View style={styles.optionsContainer}>
        <Card>
          <Button
            title="A) Saco todo mi dinero inmediatamente para no perder más. (Evito el riesgo)"
            onPress={() => finalizarTest('A')}
            variant="secondary"
            textStyle={styles.optionText}
          />
        </Card>

        <Card>
          <Button
            title="B) Mantengo la calma y espero a que el mercado se recupere. (Riesgo medio)"
            onPress={() => finalizarTest('B')}
            variant="secondary"
            textStyle={styles.optionText}
          />
        </Card>

        <Card>
          <Button
            title="C) Invierto más dinero aprovechando que está barato. (Busco máximo rendimiento)"
            onPress={() => finalizarTest('C')}
            variant="secondary"
            textStyle={styles.optionText}
          />
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
  stepLabel: { marginBottom: 10 },
  question: { marginBottom: 30 },
  optionsContainer: { gap: 15 },
  optionText: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'left' },
});
