import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';
import Entrada from './src/components/Entrada';
import PanelPerfil from './src/components/PanelPerfil';
import FaqSheet from './src/components/FaqSheet';
import TopBar from './src/components/TopBar';
import usePerfilGuardado from './src/hooks/usePerfilGuardado';
import { borrarPerfil } from './src/lib/storage';
import { useTheme } from './src/theme/colors';

export default function App() {
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');
  const [testCompletado, setTestCompletado] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(false);
  const { perfilGuardado, cargando } = usePerfilGuardado();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setTestCompletado(true); // A partir de acá, mostramos las pestañas
  };

  // Vuelve al onboarding para rehacer el test del inversor
  const rehacerTest = async () => {
    await borrarPerfil();
    setPanelAbierto(false);
    setActiveTab('dashboard');
    setTestCompletado(false);
  };

  // Si hay un perfil guardado de una sesión anterior, saltamos el test
  useEffect(() => {
    if (perfilGuardado) {
      setPerfilUsuario(perfilGuardado);
      setTestCompletado(true);
    }
  }, [perfilGuardado]);

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

  // Splash de arranque mientras leemos el storage
  if (cargando) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={s.splash}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaProvider>
    );
  }

  // El test es onboarding: pantalla única, sin pestañas.
  // Las pestañas aparecen recién cuando el usuario completa el test.
  if (!testCompletado) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <TestPerfilScreen onTestComplete={manejarTestCompleto} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={s.container}>
        <TopBar
          onAbrirPanel={() => setPanelAbierto(true)}
          onAbrirFaq={() => setFaqAbierto(true)}
        />
        <Entrada key={activeTab} style={s.contenido}>
          {renderPantalla()}
        </Entrada>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        <PanelPerfil
          visible={panelAbierto}
          perfil={perfilUsuario}
          onClose={() => setPanelAbierto(false)}
          onRehacerTest={rehacerTest}
        />
        <FaqSheet visible={faqAbierto} onClose={() => setFaqAbierto(false)} />
      </View>
    </SafeAreaProvider>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.systemBackground },
    contenido: { flex: 1 },
    splash: { flex: 1, backgroundColor: colors.systemBackground, alignItems: 'center', justifyContent: 'center' },
  });
