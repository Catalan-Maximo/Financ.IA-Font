import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';

export default function App() {
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');
  const [testCompletado, setTestCompletado] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setTestCompletado(true); // A partir de acá, mostramos las pestañas
  };

  // El test es onboarding: pantalla única, sin pestañas.
  // Las pestañas aparecen recién cuando el usuario completa el test.
  if (!testCompletado) {
    return <TestPerfilScreen onTestComplete={manejarTestCompleto} />;
  }

  const renderPantalla = () => {
    switch (activeTab) {
      case 'simulador':
        return <SimuladorScreen perfil={perfilUsuario} />;
      case 'asesor':
        return <AsesorVirtualScreen perfil={perfilUsuario} />;
      default:
        return (
          <DashboardScreen
            perfil={perfilUsuario}
            onIrAlSimulador={() => setActiveTab('simulador')}
            onIrAlAsesor={() => setActiveTab('asesor')}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>{renderPantalla()}</View>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121214' },
  contenido: { flex: 1 },
});
