import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistencia local (AsyncStorage).
 * Guarda el perfil del inversor en el dispositivo para que
 * la app salte el test en la próxima sesión.
 */

const PROFILE_KEY = '@financia/profile';
const THEME_KEY = '@financia/tema';
const TOKEN_KEY = '@financia/token';

/** Guarda el perfil del inversor localmente. */
export async function saveProfile(profile: string): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, profile);
}

/** Devuelve el perfil guardado, o null si no hay ninguno. */
export async function getProfile(): Promise<string | null> {
  return AsyncStorage.getItem(PROFILE_KEY);
}

/** Borra el perfil guardado (para permitir rehacer el test). */
export async function removeProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

/** Guarda el modo de tema elegido ('system' | 'light' | 'dark'). */
export async function saveTheme(tema: string): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, tema);
}

/** Devuelve el modo de tema guardado, o null si nunca se eligió. */
export async function getTheme(): Promise<string | null> {
  return AsyncStorage.getItem(THEME_KEY);
}

/** Guarda el token JWT de la sesión. */
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Devuelve el token JWT guardado, o null si no hay sesión. */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/** Borra el token (cerrar sesión). */
export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
