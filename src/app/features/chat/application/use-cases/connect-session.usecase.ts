import { Injectable } from '@angular/core';
import { WorkdayRepositoryHttp } from '../../infrastructure/http/workday.repository.http';

/**
 * Inicia jornada laboral.
 */
@Injectable({ providedIn: 'root' })
export class ConnectSessionUseCase {
  constructor(private repo: WorkdayRepositoryHttp) {}

  execute() {
    return this.repo.start();
  }
}
