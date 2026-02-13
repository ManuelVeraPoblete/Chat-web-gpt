import type { Session } from '../models/session.model';

export type RefreshResult = {
  accessToken: string;
  refreshToken?: string;
};

/**
 * ✅ AuthRepository (Port)
 * Define las operaciones de autenticación que el Front necesita.
 */
export type AuthRepository = {
  /**
   * Inicia sesión y retorna tokens + usuario.
   */
  login(email: string, password: string): Promise<Session>;

  /**
   * Renueva tokens desde refreshToken.
   */
  refresh(refreshToken: string): Promise<RefreshResult>;

  /**
   * Cierra sesión en el backend (revoca refresh token en BD).
   * Requiere Authorization: Bearer <accessToken>.
   */
  logout(): Promise<void>;
};
