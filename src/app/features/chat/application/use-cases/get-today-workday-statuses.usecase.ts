import { Injectable } from '@angular/core';

import { WorkdayRepositoryHttp } from '../../infrastructure/http/workday.repository.http';
import type { WorkdayDto } from '../../domain/models/workday-dto.model';

/**
 * ✅ GetTodayWorkdayStatusesUseCase
 * Recupera estados de hoy (Chile) para múltiples usuarios.
 */
@Injectable({ providedIn: 'root' })
export class GetTodayWorkdayStatusesUseCase {
  constructor(private readonly repo: WorkdayRepositoryHttp) {}

  execute(userIds: string[]) {
    return this.repo.todayStatuses(userIds);
  }
}
