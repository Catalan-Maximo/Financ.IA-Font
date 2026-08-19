import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';
import usePerfilGuardado from './src/hooks/usePerfilGuardado';
import { colors } from './src/theme/colors';

export default function App() {
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');
  const [testCompletado, setTestCompletado] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const { perfilGuardado, cargando } = usePerfilGuardado();

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setTestCompletado(true); // A partir de acá, mostramos las pestañas
  };

  // Si hay un perfil guardado de una sesión anterior, saltamos el test
  useEffect(() => {
    if (perfilGuardado) {
      setPerfilUsuario(perfilGuardado);
      setTestCompletado(true);
    }
  }, [perfilGuardado]);

  // Splash de arranque mientras leemos el storage
  if (cargando) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
  container: { flex: 1, backgroundColor: colors.background },
  contenido: { flex: 1 },
  splash: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
