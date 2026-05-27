import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

interface TestPerfilProps {
  onTestComplete: (perfil: string) => void;
}

export default function TestPerfilScreen({ onTestComplete }: TestPerfilProps) {
  const [loading, setLoading] = useState(false);
  const [pregunta1, setPregunta1] = useState<string | null>(null);

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
      <Text style={styles.step}>Paso 1 de 1</Text>
      <Text style={styles.question}>¿Qué harías si tus inversiones bajan un 10% en un mes?</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => finalizarTest('A')}>
          <Text style={styles.optionText}>A) Saco todo mi dinero inmediatamente para no perder más. (Evito el riesgo)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => finalizarTest('B')}>
          <Text style={styles.optionText}>B) Mantengo la calma y espero a que el mercado se recupere. (Riesgo medio)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => finalizarTest('C')}>
          <Text style={styles.optionText}>C) Invierto más dinero aprovechando que está barato. (Busco máximo rendimiento)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214', justifyContent: 'center', padding: 20 },
  step: { color: '#00B37E', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  question: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 30, lineHeight: 32 },
  optionsContainer: { gap: 15 },
  optionButton: { backgroundColor: '#202024', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#323238' },
  optionText: { color: '#C4C4CC', fontSize: 15, lineHeight: 22 }
});
