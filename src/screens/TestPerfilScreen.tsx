import React, { useState } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

interface TestPerfilProps {
  onTestComplete: (perfil: string) => void;
}

export default function TestPerfilScreen({ onTestComplete }: TestPerfilProps) {
  const [loading, setLoading] = useState(false);

  const finalizarTest = async (opcionSeleccionada: string) => {
    setLoading(true);
    let perfilCalculado = "Moderado";

    if (opcionSeleccionada === 'A') perfilCalculado = "Conservador";
    if (opcionSeleccionada === 'C') perfilCalculado = "Agresivo";

    try {
      // Mandamos los datos al backend (Endpoint 2)
      const response = await api.post('/usuarios/perfil', {
        nombre: "Usuario Demo",
        email: "demo@financia.com",
        perfilInversor: perfilCalculado
      });

      Alert.alert('¡Test Completado! 🎉', `Tu perfil asignado es: ${response.data.perfilInversor}`);
      onTestComplete(response.data.perfilInversor);
    } catch (error) {
      console.error(error);
      Alert.alert('Error ❌', 'No se pudo guardar tu perfil en el backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00B37E" />
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
  container: { flex: 1, backgroundColor: '#121214', justifyContent: 'center', padding: 20 },
  stepLabel: { marginBottom: 10 },
  question: { marginBottom: 30 },
  optionsContainer: { gap: 15 },
  optionText: { color: '#C4C4CC', fontSize: 15, lineHeight: 22, textAlign: 'left' },
});
