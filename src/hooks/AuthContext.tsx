import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../lib/api';
import { borrarPerfil, borrarToken, guardarPerfil, guardarToken, obtenerToken } from '../lib/storage';

interface AuthState {
  /** Token JWT de la sesión (null = no logueado). */
  token: string | null;
  /** Perfil inversor del usuario logueado (null si todavía no hizo el test). */
  perfilInversor: string | null;
  /** true mientras se restaura la sesión guardada al arrancar. */
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Estado global de sesión (Context API).
 * Envuelve la app en index.tsx; los componentes usan useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [perfilInversor, setPerfilInversor] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Restaurar sesión al arrancar (si hay token guardado)
  useEffect(() => {
    obtenerToken()
      .then((guardado) => {
        if (guardado) setToken(guardado);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  /** El backend devuelve el perfil en el login: lo cacheamos localmente. */
  const sincronizarPerfil = async (perfil: string | null) => {
    setPerfilInversor(perfil ?? null);
    if (perfil) {
      await guardarPerfil(perfil);
    } else {
      await borrarPerfil();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    await guardarToken(response.data.token);
    await sincronizarPerfil(response.data.perfilInversor ?? null);
  };

  const register = async (nombre: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    setToken(response.data.token);
    await guardarToken(response.data.token);
    // Usuario nuevo: nunca tiene perfil todavía
    await sincronizarPerfil(response.data.perfilInversor ?? null);
  };

  const logout = async () => {
    await borrarToken();
    await borrarPerfil();
    setToken(null);
    setPerfilInversor(null);
  };

  return (
    <AuthContext.Provider value={{ token, perfilInversor, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
