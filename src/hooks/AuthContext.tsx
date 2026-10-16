import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api, { setOnUnauthorized } from '../lib/api';
import { removeProfile, removeToken, saveProfile, saveToken, getToken } from '../lib/storage';

interface AuthState {
  /** Token JWT de la sesión (null = no logueado). */
  token: string | null;
  /** Email del usuario logueado (null si no hay sesión). */
  email: string | null;
  /** Perfil inversor del usuario logueado (null si todavía no hizo el test). */
  investorProfile: string | null;
  /** true mientras se restaura la sesión guardada al arrancar. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Estado global de sesión (Context API).
 * Envuelve la app en index.tsx; los componentes usan useAuth().
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [investorProfile, setInvestorProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión al arrancar (si hay token guardado)
  useEffect(() => {
    getToken()
      .then((saved) => {
        if (saved) setToken(saved);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Si una petición recibe 401, el interceptor borra el token guardado
  // y nos avisa acá para volver al login (si no, la app queda en loop).
  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setEmail(null);
      setInvestorProfile(null);
    });
    return () => setOnUnauthorized(null);
  }, []);

  /** El backend devuelve el perfil en el login: lo cacheamos localmente. */
  const sincronizarProfile = async (profile: string | null) => {
    setInvestorProfile(profile ?? null);
    if (profile) {
      await saveProfile(profile);
    } else {
      await removeProfile();
    }
  };

  const login = async (mail: string, password: string) => {
    const response = await api.post('/auth/login', { email: mail, password });
    setToken(response.data.token);
    setEmail(response.data.email);
    await saveToken(response.data.token);
    await sincronizarProfile(response.data.investorProfile ?? null);
  };

  const register = async (name: string, mail: string, password: string) => {
    const response = await api.post('/auth/register', { name, email: mail, password });
    setToken(response.data.token);
    setEmail(response.data.email);
    await saveToken(response.data.token);
    // Usuario nuevo: nunca tiene perfil todavía
    await sincronizarProfile(response.data.investorProfile ?? null);
  };

  const logout = async () => {
    await removeToken();
    await removeProfile();
    setToken(null);
    setEmail(null);
    setInvestorProfile(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, investorProfile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
