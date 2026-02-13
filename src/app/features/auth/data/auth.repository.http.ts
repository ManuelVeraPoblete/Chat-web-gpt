import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { AuthRepository, RefreshResult } from '../domain/ports/auth.repository';
import type { Session } from '../domain/models/session.model';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
} from './dtos/login.dto';

/**
 * ✅ AuthRepositoryHttp (Adapter)
 * Implementación HTTP del puerto AuthRepository.
 *
 * Nota:
 * - El proyecto ya trae interceptors:
 *   - base-url interceptor => prefija apiBaseUrl
 *   - auth interceptor => agrega Authorization: Bearer <accessToken>
 */
@Injectable({ providedIn: 'root' })
export class AuthRepositoryHttp implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<Session> {
    const body: LoginRequestDto = { email, password };

    // POST /auth/login
    const res = await firstValueFrom(
      this.http.post<LoginResponseDto>('/auth/login', body),
    );

    return {
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const body: RefreshRequestDto = { refreshToken };

    // POST /auth/refresh
    const res = await firstValueFrom(
      this.http.post<RefreshResponseDto>('/auth/refresh', body),
    );

    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  /**
   * ✅ Logout backend
   * - Revoca refresh token en BD.
   * - Requiere JWT (access token) en header Authorization.
   */
  async logout(): Promise<void> {
    // POST /auth/logout
    await firstValueFrom(this.http.post<{ ok: boolean }>('/auth/logout', {}));
  }
}
