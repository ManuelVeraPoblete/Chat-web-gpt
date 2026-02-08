import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Adapter HTTP para estados laborales.
 */
@Injectable({ providedIn: 'root' })
export class WorkdayRepositoryHttp {
  constructor(private http: HttpClient) {}

  start() {
    return this.http.post('/workday/start', {});
  }

  pause() {
    return this.http.post('/workday/pause', {});
  }

  lunch() {
    return this.http.post('/workday/lunch', {});
  }

  end() {
    return this.http.post('/workday/end', {});
  }

  active() {
    return this.http.post('/workday/active', {});
  }

  today() {
    return this.http.get('/workday/today');
  }
}
