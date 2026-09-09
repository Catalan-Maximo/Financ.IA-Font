import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistencia local (AsyncStorage).
 * Guarda el perfil del inversor en el dispositivo para que
 * la app salte el test en la próxima sesión.
 */

const CLAVE_PERFIL = '@financia/perfil';
const CLAVE_TEMA = '@financia/tema';

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

/** Guarda el modo de tema elegido ('system' | 'light' | 'dark'). */
export async function guardarTema(tema: string): Promise<void> {
  await AsyncStorage.setItem(CLAVE_TEMA, tema);
}

/** Devuelve el modo de tema guardado, o null si nunca se eligió. */
export async function obtenerTema(): Promise<string | null> {
  return AsyncStorage.getItem(CLAVE_TEMA);
}
