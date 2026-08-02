import axios from 'axios';

// REEMPLAZA ACA CON LA IP DE TU MAC QUE BUSCASTE EN EL PASO 8
const MAC_IP = '192.168.100.99'; 

const api = axios.create({
  baseURL: `http://${MAC_IP}:8080/api/v1`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
