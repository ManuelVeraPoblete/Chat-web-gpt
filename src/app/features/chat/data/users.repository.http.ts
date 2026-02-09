import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { AppUser } from '../domain/models/app-user.model';

/**
 *UsersRepositoryHttp (Chat Feature)
 * - GET /users (protegido)
 *
 * Importante:
 * - Tu proyecto ya tiene base-url.interceptor + auth.interceptor,
 *   así que aquí usamos rutas relativas "/users" sin hardcodear host.
 */
@Injectable({ providedIn: 'root' })
export class UsersRepositoryHttp {
  constructor(private readonly http: HttpClient) {}

  async getAll(): Promise<AppUser[]> {
    const res = await firstValueFrom(this.http.get<AppUser[]>('/users'));
    return Array.isArray(res) ? res : [];
  }
}
