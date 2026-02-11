// src/app/features/chat/application/use-cases/set-work-status.usecase.ts

import { Injectable } from '@angular/core';
import { WorkdayRepositoryHttp } from '../../infrastructure/http/workday.repository.http';
import { WorkdayAction } from '../../domain/value-objects/workday-action.vo';

/**
 * ✅ SetWorkStatusUseCase (en realidad: ejecutar acción de jornada)
 *
 * Nota:
 * Mantenemos el nombre del archivo/clase por compatibilidad con imports existentes,
 * pero su responsabilidad es ejecutar una *acción* (Command) y dejar que el backend
 * decida el estado resultante.
 */
@Injectable({ providedIn: 'root' })
export class SetWorkStatusUseCase {
  constructor(private readonly repo: WorkdayRepositoryHttp) {}

  execute(action: WorkdayAction) {
    switch (action) {
      case WorkdayAction.CONNECT:
        return this.repo.start();

      case WorkdayAction.PAUSE:
        return this.repo.pause();

      case WorkdayAction.LUNCH:
        return this.repo.lunch();

      case WorkdayAction.RESUME:
        return this.repo.active();

      case WorkdayAction.DISCONNECT:
        return this.repo.end();

      case WorkdayAction.RESET:
        return this.repo.reset();

      default:
        return this.repo.today();
    }
  }
}
