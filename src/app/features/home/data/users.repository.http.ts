import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AppUser } from '../domain/models/app-user.model';

/**
 * GET /users
 */
@Injectable({ providedIn: 'root' })
export class UsersRepositoryHttp {
  constructor(private readonly http: HttpClient) {}

  async getAll(): Promise<AppUser[]> {
    return firstValueFrom(this.http.get<AppUser[]>('/users'));
  }
}
