import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from './src/services/api';

export default function App() {
  const [loading, setLoading] = useState(false);

  const probarConexionBackend = async () => {
    setLoading(true);
    try {
      // Llamamos al Endpoint 1 de Spring Boot (Health Check)
      const response = await api.get('/health');
      
      // Si responde, mostramos el mensaje que viene del servidor
      Alert.alert('¡Conexión Exitosa! 🚀', response.data.message);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Error de Conexión ❌',
        'No se pudo conectar con el Backend. Verifica que Spring Boot esté corriendo y que la IP en api.ts sea la correcta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FinancIA 🚀</Text>
      <Text style={styles.subtitle}>Ecosistema de Inversión Inteligente</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardText}>Entorno de Desarrollo: OK</Text>
        <Text style={styles.cardText}>Frontend: React Native + Expo</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={probarConexionBackend}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Probar Conexión con Backend</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B37E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8D8D99',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#202024',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#323238',
  },
  cardText: {
    color: '#C4C4CC',
    fontSize: 14,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00B37E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
