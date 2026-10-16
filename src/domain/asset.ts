/**
 * Activo del mercado devuelto por GET /activos/tasas.
 * Mapea 1:1 con la respuesta del backend (ActivoService).
 */
export interface Asset {
  /** Entidad que ofrece el instrumento (ej. "BCRA", "Mercado Pago"). */
  entity: string;
  /** Tasa Nominal Anual en % (ej. 23.31). */
  tna: number;
  /** Tipo de instrumento (ej. "Plazo Fijo Tradicional", "Billetera Virtual"). */
  type: string;
}
