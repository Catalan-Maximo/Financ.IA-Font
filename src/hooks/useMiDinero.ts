import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import type { MetaAhorro, Posicion } from '../domain/midinero';

/**
 * Hook de Mi Dinero: posiciones del portafolio y metas de ahorro
 * con sus acciones (agregar, aportar, eliminar).
 */
export default function useMiDinero() {
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [metas, setMetas] = useState<MetaAhorro[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [pos, met] = await Promise.all([
        api.get<Posicion[]>('/midinero/posiciones'),
        api.get<MetaAhorro[]>('/midinero/metas'),
      ]);
      setPosiciones(pos.data);
      setMetas(met.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const agregarPosicion = async (activo: string, cantidad: number, precioCompra: number) => {
    await api.post('/midinero/posiciones', { activo, cantidad, precioCompra });
    await cargar();
  };

  const eliminarPosicion = async (id: number) => {
    await api.delete(`/midinero/posiciones/${id}`);
    await cargar();
  };

  const crearMeta = async (nombre: string, montoObjetivo: number, fechaLimite: string) => {
    await api.post('/midinero/metas', { nombre, montoObjetivo, fechaLimite });
    await cargar();
  };

  const aportarMeta = async (id: number, monto: number) => {
    await api.post(`/midinero/metas/${id}/aporte`, { monto });
    await cargar();
  };

  const eliminarMeta = async (id: number) => {
    await api.delete(`/midinero/metas/${id}`);
    await cargar();
  };

  return {
    posiciones, metas, loading,
    agregarPosicion, eliminarPosicion,
    crearMeta, aportarMeta, eliminarMeta,
  };
}
