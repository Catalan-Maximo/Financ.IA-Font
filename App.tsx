import React, { useState } from 'react';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SimuladorScreen from './src/screens/SimuladorScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';

export default function App() {
  // Manejamos el flujo mediante estados simples
  const [screen, setScreen] = useState<'test' | 'dashboard' | 'simulador' | 'asesor'>('test');
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setScreen('dashboard'); // Al terminar el test, saltamos automáticamente al dashboard
  };

  if (screen === 'test') {
    return <TestPerfilScreen onTestComplete={manejarTestCompleto} />;
  }

  if (screen === 'simulador') {
    return (
      <SimuladorScreen
        perfil={perfilUsuario}
        onVolver={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'asesor') {
    return (
      <AsesorVirtualScreen
        perfil={perfilUsuario}
        onVolver={() => setScreen('dashboard')}
      />
    );
  }

  return (
    <DashboardScreen
      perfil={perfilUsuario}
      onIrAlSimulador={() => setScreen('simulador')}
      onIrAlAsesor={() => setScreen('asesor')}
    />
  );
}
