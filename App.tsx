import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CriptoDetalleScreen from './src/screens/CriptoDetalleScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';
import Entrada from './src/components/Entrada';
import PanelPerfil from './src/components/PanelPerfil';
import FaqSheet from './src/components/FaqSheet';
import TopBar from './src/components/TopBar';
import usePerfilGuardado from './src/hooks/usePerfilGuardado';
import { useAuth } from './src/hooks/AuthContext';
import { borrarPerfil } from './src/lib/storage';
import { registrarNotificaciones } from './src/lib/notificaciones';
import { useTheme } from './src/theme/colors';
import type { CriptoEstado } from './src/domain/cripto';

export default function App() {
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');
  const [testCompletado, setTestCompletado] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'register'>('login');
  const [criptoDetalle, setCriptoDetalle] = useState<CriptoEstado | null>(null);
  const { token, perfilInversor, cargando: cargandoAuth, logout } = useAuth();
  const { perfilGuardado, cargando: cargandoPerfil } = usePerfilGuardado();
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

  // Cierra sesión: borra token y perfil, vuelve al login
  const cerrarSesion = async () => {
    await logout();
    await borrarPerfil();
    setPanelAbierto(false);
    setActiveTab('dashboard');
    setTestCompletado(false);
    setPerfilUsuario('Moderado');
  };

  // Si hay un perfil guardado de una sesión anterior, saltamos el test
  useEffect(() => {
    if (perfilGuardado) {
      setPerfilUsuario(perfilGuardado);
      setTestCompletado(true);
    }
  }, [perfilGuardado]);

  // Si el usuario logueado ya tiene perfil en el backend (vino en el login),
  // saltamos el test — así no hay que rehacerlo en cada login
  useEffect(() => {
    if (perfilInversor) {
      setPerfilUsuario(perfilInversor);
      setTestCompletado(true);
    }
  }, [perfilInversor]);

  // Registrar notificaciones push una vez logueado
  useEffect(() => {
    if (token) {
      registrarNotificaciones();
    }
  }, [token]);

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
            onAbrirDetalleCripto={setCriptoDetalle}
          />
        );
    }
  };

  // Detalle de cripto: pantalla completa encima del flujo con pestañas
  if (criptoDetalle) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CriptoDetalleScreen estado={criptoDetalle} onVolver={() => setCriptoDetalle(null)} />
      </SafeAreaProvider>
    );
  }

  // Splash de arranque mientras leemos el storage (token + perfil)
  if (cargandoAuth || cargandoPerfil) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={s.splash}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sin token → flujo de autenticación (login/registro)
  if (!token) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {modoAuth === 'login' ? (
          <LoginScreen onIrARegistro={() => setModoAuth('register')} />
        ) : (
          <RegisterScreen onIrALogin={() => setModoAuth('login')} />
        )}
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
          onLogout={cerrarSesion}
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
