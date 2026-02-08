import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Adapter HTTP usuarios.
 */
@Injectable({ providedIn: 'root' })
export class UsersRepositoryHttp {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get('/users');
  }
}
