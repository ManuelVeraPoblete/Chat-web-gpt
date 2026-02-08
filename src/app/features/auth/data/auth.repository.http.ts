import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { firstValueFrom } from 'rxjs';
import { firstValueFrom as rxFirstValueFrom } from 'rxjs';

import type { AuthRepository, RefreshResult } from '../domain/ports/auth.repository';
import type { Session } from '../domain/models/session.model';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
  RefreshResponseDto,
} from './dtos/login.dto';

@Injectable({ providedIn: 'root' })
export class AuthRepositoryHttp implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<Session> {
    const body: LoginRequestDto = { email, password };

    // RN: POST /auth/login
    const res = await rxFirstValueFrom(
      this.http.post<LoginResponseDto>('/auth/login', body)
    );

    return {
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const body: RefreshRequestDto = { refreshToken };

    // RN: POST /auth/refresh
    const res = await rxFirstValueFrom(
      this.http.post<RefreshResponseDto>('/auth/refresh', body)
    );

    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
  }
}
