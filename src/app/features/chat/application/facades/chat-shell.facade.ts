import { Injectable, signal } from '@angular/core';
import { ConnectSessionUseCase } from '../use-cases/connect-session.usecase';
import { SetWorkStatusUseCase } from '../use-cases/set-work-status.usecase';
import { SendMessageUseCase } from '../use-cases/send-message.usecase';
import { WorkStatus } from '../../domain/value-objects/work-status.vo';

/**
 * Facade central del dashboard.
 * Coordina UI + UseCases.
 */
@Injectable({ providedIn: 'root' })
export class ChatShellFacade {
  status = signal<WorkStatus>(WorkStatus.NOT_STARTED);

  constructor(
    private connectUC: ConnectSessionUseCase,
    private statusUC: SetWorkStatusUseCase,
    private sendUC: SendMessageUseCase
  ) {}

  connect() {
    this.connectUC.execute().subscribe(() => {
      this.status.set(WorkStatus.ACTIVE);
    });
  }

  setStatus(status: WorkStatus) {
    this.statusUC.execute(status).subscribe(() => {
      this.status.set(status);
    });
  }

  sendMessage(peerId: string, content: string) {
    return this.sendUC.execute(peerId, content);
  }
}
