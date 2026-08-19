import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistencia local (AsyncStorage).
 * Guarda el perfil del inversor en el dispositivo para que
 * la app salte el test en la próxima sesión.
 */

const CLAVE_PERFIL = '@financia/perfil';

/** Guarda el perfil del inversor localmente. */
export async function guardarPerfil(perfil: string): Promise<void> {
  await AsyncStorage.setItem(CLAVE_PERFIL, perfil);
}

/** Devuelve el perfil guardado, o null si no hay ninguno. */
export async function obtenerPerfil(): Promise<string | null> {
  return AsyncStorage.getItem(CLAVE_PERFIL);
}

/** Borra el perfil guardado (para permitir rehacer el test). */
export async function borrarPerfil(): Promise<void> {
  await AsyncStorage.removeItem(CLAVE_PERFIL);
}
