import { Component, computed, effect, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../../domain/value-objects/work-status.vo';
import { WorkdayAction } from '../../../domain/value-objects/workday-action.vo';

/**
 * ✅ Panel de estados laborales
 * - UI tolerante: habilita/deshabilita según estado actual
 * - Incluye acción de recuperación (RESET) para "errores humanos"
 */
@Component({
  standalone: true,
  selector: 'cc-work-status-panel',
  imports: [NgIf, NgFor, MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule],
  templateUrl: './work-status-panel.component.html',
  styleUrl: './work-status-panel.component.scss',
})
export class WorkStatusPanelComponent {
  readonly vm = inject(ChatShellFacade);
  private readonly snack = inject(MatSnackBar);

  readonly WorkStatus = WorkStatus;
  readonly WorkdayAction = WorkdayAction;

  /**
   * ✅ Label human friendly
   */
  readonly statusLabel = computed(() => {
    switch (this.vm.status()) {
      case WorkStatus.ACTIVE:
        return 'Conectado';
      case WorkStatus.PAUSED:
        return 'En pausa';
      case WorkStatus.LUNCH:
        return 'En almuerzo';
      case WorkStatus.ENDED:
        return 'Desconectado';
      default:
        return 'Sin iniciar';
    }
  });

  /**
   * ✅ Reglas de UI: qué acciones mostrar por estado (no reemplaza backend, solo guía UX)
   */
  readonly allowedActions = computed<WorkdayAction[]>(() => {
    const st = this.vm.status();

    switch (st) {
      case WorkStatus.NOT_STARTED:
        return [WorkdayAction.CONNECT, WorkdayAction.RESET];

      case WorkStatus.ACTIVE:
        return [WorkdayAction.PAUSE, WorkdayAction.LUNCH, WorkdayAction.DISCONNECT, WorkdayAction.RESET];

      case WorkStatus.PAUSED:
        return [WorkdayAction.RESUME, WorkdayAction.DISCONNECT, WorkdayAction.RESET];

      case WorkStatus.LUNCH:
        return [WorkdayAction.RESUME, WorkdayAction.DISCONNECT, WorkdayAction.RESET];

      case WorkStatus.ENDED:
        return [WorkdayAction.CONNECT, WorkdayAction.RESET];

      default:
        return [WorkdayAction.RESET];
    }
  });

  constructor() {
    // ✅ UX: errores como snackbar. (Presentación; no ensucia el dominio)
    effect(() => {
      const msg = this.vm.lastError();
      if (!msg) return;
      this.snack.open(String(msg), 'OK', { duration: 3500 });
    });
  }

  /**
   * Ejecuta la acción a través del facade.
   */
  run(action: WorkdayAction): void {
    this.vm.perform(action);
  }

  /**
   * ✅ Etiquetas por acción (UI)
   */
  labelFor(action: WorkdayAction): string {
    switch (action) {
      case WorkdayAction.CONNECT:
        return this.vm.status() === WorkStatus.ENDED ? 'Reconectar' : 'Registrar entrada';
      case WorkdayAction.PAUSE:
        return 'Registrar pausa';
      case WorkdayAction.LUNCH:
        return 'Registrar almuerzo';
      case WorkdayAction.RESUME:
        return this.vm.status() === WorkStatus.LUNCH ? 'Terminar almuerzo' : 'Reanudar';
      case WorkdayAction.DISCONNECT:
        return 'Registrar desconexión';
      case WorkdayAction.RESET:
        return 'Reiniciar estado';
      default:
        return 'Acción';
    }
  }

  iconFor(action: WorkdayAction): string {
    switch (action) {
      case WorkdayAction.CONNECT:
        return 'login';
      case WorkdayAction.PAUSE:
        return 'pause_circle';
      case WorkdayAction.LUNCH:
        return 'restaurant';
      case WorkdayAction.RESUME:
        return 'play_circle';
      case WorkdayAction.DISCONNECT:
        return 'logout';
      case WorkdayAction.RESET:
        return 'restart_alt';
      default:
        return 'bolt';
    }
  }
}
