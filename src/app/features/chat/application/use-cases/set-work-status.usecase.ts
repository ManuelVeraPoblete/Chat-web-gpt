import { Injectable } from '@angular/core';
import { WorkdayRepositoryHttp } from '../../infrastructure/http/workday.repository.http';
import { WorkStatus } from '../../domain/value-objects/work-status.vo';

/**
 * Cambia estado laboral.
 */
@Injectable({ providedIn: 'root' })
export class SetWorkStatusUseCase {
  constructor(private repo: WorkdayRepositoryHttp) {}

  execute(status: WorkStatus) {
    switch (status) {
      case WorkStatus.PAUSED:
        return this.repo.pause();

      case WorkStatus.LUNCH:
        return this.repo.lunch();

      case WorkStatus.ENDED:
        return this.repo.end();

      default:
        return this.repo.active();
    }
  }
}
