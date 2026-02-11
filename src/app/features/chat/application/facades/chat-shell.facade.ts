import { Injectable, signal } from '@angular/core';

import { WorkStatus } from '../../domain/value-objects/work-status.vo';
import { WorkdayAction } from '../../domain/value-objects/workday-action.vo';
import type { WorkdayDto } from '../../domain/models/workday-dto.model';

import { ConnectSessionUseCase } from '../use-cases/connect-session.usecase';
import { SetWorkStatusUseCase } from '../use-cases/set-work-status.usecase';
import { SendMessageUseCase } from '../use-cases/send-message.usecase';
import { GetTodayWorkdayUseCase } from '../use-cases/get-today-workday.usecase';

/**
 * ✅ ChatShellFacade
 * - Sincroniza estado laboral con backend
 * - Expone signals para UI (status, loading, lastError)
 * - Permite acciones tolerantes a errores (RESET)
 */
@Injectable({ providedIn: 'root' })
export class ChatShellFacade {
  readonly status = signal<WorkStatus>(WorkStatus.NOT_STARTED);
  readonly loadingWorkday = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);

  constructor(
    private readonly connectUC: ConnectSessionUseCase,
    private readonly actionUC: SetWorkStatusUseCase,
    private readonly sendUC: SendMessageUseCase,
    private readonly todayUC: GetTodayWorkdayUseCase,
  ) {}

  loadToday(): void {
    this.loadingWorkday.set(true);
    this.lastError.set(null);

    this.todayUC.execute().subscribe({
      next: (dto: WorkdayDto) => {
        this.status.set((dto?.status as WorkStatus) ?? WorkStatus.NOT_STARTED);
      },
      error: (err) => {
        console.warn('[ChatShellFacade] loadToday error:', err);
        this.status.set(WorkStatus.NOT_STARTED);
        this.lastError.set('No se pudo cargar tu estado laboral de hoy.');
      },
      complete: () => this.loadingWorkday.set(false),
    });
  }

  connect(): void {
    this.perform(WorkdayAction.CONNECT);
  }

  pause(): void {
    this.perform(WorkdayAction.PAUSE);
  }

  lunch(): void {
    this.perform(WorkdayAction.LUNCH);
  }

  resume(): void {
    this.perform(WorkdayAction.RESUME);
  }

  disconnect(): void {
    this.perform(WorkdayAction.DISCONNECT);
  }

  reset(): void {
    this.perform(WorkdayAction.RESET);
  }

  perform(action: WorkdayAction): void {
    this.lastError.set(null);

    const obs =
      action === WorkdayAction.CONNECT
        ? this.connectUC.execute()
        : this.actionUC.execute(action);

    obs.subscribe({
      next: (dto: WorkdayDto) => {
        this.status.set((dto?.status as WorkStatus) ?? this.status());
      },
      error: (err) => {
        console.warn('[ChatShellFacade] perform error:', err);

        const msg =
          err?.error?.message ||
          err?.message ||
          'No se pudo ejecutar la acción.';

        this.lastError.set(String(msg));
      },
    });
  }

  sendMessage(peerId: string, content: string) {
    return this.sendUC.execute(peerId, content);
  }

  /**
   * ✅ NUEVO: Resetea estado en memoria (para 401/logout)
   */
  resetState(): void {
    this.status.set(WorkStatus.NOT_STARTED);
    this.loadingWorkday.set(false);
    this.lastError.set(null);
  }
}
