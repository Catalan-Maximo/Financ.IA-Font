import axios from 'axios';
import Constants from 'expo-constants';

// Auto-detecta la IP de la Mac donde corre Expo (y el backend).
// El celular se conecta al servidor de Expo por esa IP, así que
// usamos la misma para llegar al backend en el puerto 8080.
// Fallback: 192.168.100.103 por si hostUri no está disponible.
const hostUri = Constants.expoConfig?.hostUri;
const MAC_IP = hostUri ? hostUri.split(':')[0] : '192.168.100.103';

const api = axios.create({
  baseURL: `http://${MAC_IP}:8080/api/v1`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
