import { Injectable } from '@angular/core';
import { WorkdayRepositoryHttp } from '../../infrastructure/http/workday.repository.http';
import type { WorkdayDto } from '../../domain/models/workday-dto.model';

/**
 * ✅ GetTodayWorkdayUseCase
 * Recupera el estado laboral "hoy" del usuario autenticado.
 */
@Injectable({ providedIn: 'root' })
export class GetTodayWorkdayUseCase {
  constructor(private readonly repo: WorkdayRepositoryHttp) {}

  execute() {
    return this.repo.today();
  }
}
