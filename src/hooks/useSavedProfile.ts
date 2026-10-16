import { useEffect, useState } from 'react';
import { getProfile } from '../lib/storage';

/**
 * Hook de arranque: lee el perfil guardado en AsyncStorage.
 * Mientras carga, `cargando` es true (la app muestra un spinner).
 * Si existe un perfil de una sesión anterior, `perfilGuardado`
 * lo contiene y App salta el test directamente.
 */
export default function useSavedProfile() {
  const [savedProfile, setSavedProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let asset = true;

    getProfile()
      .then((profile) => {
        if (asset) setSavedProfile(profile);
      })
      .catch((error) => {
        // Si el storage falla, arrancamos como si no hubiera perfil
        console.warn('No se pudo leer el perfil guardado', error);
      })
      .finally(() => {
        if (asset) setLoading(false);
      });

    return () => {
      asset = false;
    };
  }, []);

  return { savedProfile, loading };
}
