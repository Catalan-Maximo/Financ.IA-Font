import React, { useState } from 'react';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  // Manejamos el flujo mediante estados simples
  const [screen, setScreen] = useState<'test' | 'dashboard'>('test');
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setScreen('dashboard'); // Al terminar el test, saltamos automáticamente al dashboard
  };

  return screen === 'test' ? (
    <TestPerfilScreen onTestComplete={manejarTestCompleto} />
  ) : (
    <DashboardScreen perfil={perfilUsuario} />
  );
}
