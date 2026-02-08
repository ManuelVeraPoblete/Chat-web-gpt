/**
 * Contrato de config para el Core.
 * Evita usar environment directamente en features (mejor para testing).
 */
export type ApiConfig = {
  apiBaseUrl: string;

  /**
   * URL del servidor Socket.IO (normalmente misma que apiBaseUrl).
   * Si el backend usa otro host/puerto, se define acá.
   */
  socketUrl?: string;
};
