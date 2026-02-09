import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { inject } from '@angular/core';
import { API_CONFIG } from '../config/api-config.token';
import { AuthFacade } from '../../features/auth/application/auth.facade';

/**
 * SocketIoService
 * - Crea y mantiene conexión Socket.IO
 * - Reconexión automática
 * - Envía token JWT en auth (si el backend lo soporta)
 *
 * Importante:
 * - No emitimos "join" por defecto (para no romper compatibilidad).
 * - Solo nos conectamos y escuchamos eventos.
 */
@Injectable({ providedIn: 'root' })
export class SocketIoService {
  private socket: Socket | null = null;

  private readonly config = inject(API_CONFIG);
  private readonly auth = inject(AuthFacade);

  /**
   * Conecta si aún no está conectado.
   * Safe: si falla, no rompe la app (solo no hay realtime).
   */
  connect(): void {
    if (this.socket?.connected) return;

    const url = this.config.socketUrl ?? this.config.apiBaseUrl;

    //JWT: algunos backends lo leen en handshake.auth.token
    const token = this.auth.accessToken();

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 8000,
      auth: token ? { token } : undefined,
    });

    // Logs mínimos (si quieres, luego lo conectamos a tu Logging real)
    this.socket.on('connect', () => {
      // console.log('[socket] connected', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      // console.log('[socket] disconnected');
    });

    this.socket.on('connect_error', () => {
      // Evitar ruido. Si quieres debug, habilitamos logs.
      // console.warn('[socket] connect_error', err?.message);
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  /**
   * Registrar listener (idempotente por callback).
   */
  on<T = unknown>(event: string, cb: (payload: T) => void): void {
    this.connect();
    this.socket?.on(event, cb as any);
  }

  /**
   * Remover listener.
   */
  off<T = unknown>(event: string, cb: (payload: T) => void): void {
    this.socket?.off(event, cb as any);
  }

  /**
   * Emit opcional (no usado por defecto para evitar incompatibilidad).
   */
  emit(event: string, payload?: unknown): void {
    this.connect();
    this.socket?.emit(event, payload);
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}
