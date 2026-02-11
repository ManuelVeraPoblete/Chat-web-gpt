import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { WorkdayDto } from '../../domain/models/workday-dto.model';

/**
 * ✅ WorkdayRepositoryHttp
 * Adapter HTTP para estados laborales.
 *
 * Importante:
 * - El proyecto ya trae base-url + auth interceptor, por eso usamos rutas relativas.
 */
@Injectable({ providedIn: 'root' })
export class WorkdayRepositoryHttp {
  constructor(private readonly http: HttpClient) {}

  /**
   * ✅ Marca entrada (inicia jornada / reconecta)
   */
  start() {
    return this.http.post<WorkdayDto>('/workday/start', {});
  }

  /**
   * ✅ Marca desconexión
   */
  end() {
    return this.http.post<WorkdayDto>('/workday/end', {});
  }

  /**
   * ✅ Reanuda a ACTIVE desde PAUSED/LUNCH o reconecta desde ENDED
   */
  active() {
    return this.http.post<WorkdayDto>('/workday/active', {});
  }

  /**
   * ✅ Marca Pausa
   */
  pause() {
    return this.http.post<WorkdayDto>('/workday/pause', {});
  }

  /**
   * ✅ Marca Almuerzo / Colación
   */
  lunch() {
    return this.http.post<WorkdayDto>('/workday/lunch', {});
  }

  /**
   * ✅ Reset / recuperación (fuerza ACTIVE)
   */
  reset() {
    return this.http.post<WorkdayDto>('/workday/reset', {});
  }

  /**
   * ✅ Obtiene el estado del usuario autenticado para hoy (Chile)
   */
  today() {
    return this.http.get<WorkdayDto>('/workday/today');
  }

  /**
   * ✅ Obtiene estados de hoy (Chile) en masa para pintar la lista de usuarios.
   */
  todayStatuses(userIds: string[]) {
    return this.http.post<Record<string, WorkdayDto>>('/workday/today/statuses', { userIds });
  }
}
