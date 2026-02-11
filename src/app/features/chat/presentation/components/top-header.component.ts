// src/app/features/chat/presentation/components/top-header.component.ts

import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ChatShellFacade } from '../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../domain/value-objects/work-status.vo';

/**
 * ✅ Header corporativo con acciones rápidas.
 * Standalone: se importa desde ChatShellPage.
 */
@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: `
    <header class="header">
      <div class="left">
        <div class="logo">Corp Chat</div>
        <div class="badge" [attr.data-status]="facade.status()">
          {{ labelFor(facade.status()) }}
        </div>
      </div>

      <div class="actions">
        <button class="btn primary" (click)="facade.connect()">Conectar</button>
        <button class="btn danger" (click)="facade.disconnect()">Desconectar</button>
        <button class="btn ghost" (click)="facade.reset()" title="Reiniciar estado (recuperación)">
          Reiniciar
        </button>
      </div>

      <div class="right-icons" aria-label="Acciones de usuario">
        <span class="icon" title="Notificaciones">🔔</span>
        <span class="icon" title="Mensajes">✉️</span>
        <span class="icon" title="Perfil">👤</span>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: #0b2a55;
      color: #fff;
      border-radius: 12px;
      box-shadow: 0 10px 26px rgba(0,0,0,0.18);
    }
    .left { display:flex; align-items:center; gap: 10px; }
    .logo { font-weight: 800; letter-spacing: 0.3px; }
    .badge {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.18);
    }
    .actions { display: flex; gap: 8px; }
    .btn {
      border: 0;
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      color: #fff;
      cursor: pointer;
      font-weight: 600;
    }
    .btn.primary { background: #1ea97c; }
    .btn.danger { background: #d9534f; }
    .btn.ghost { background: transparent; border: 1px solid rgba(255,255,255,0.22); }
    .right-icons { display: flex; gap: 10px; opacity: 0.95; }
    .icon { cursor: pointer; user-select: none; }
  `],
})
export class TopHeaderComponent {
  private readonly snack = inject(MatSnackBar);

  constructor(public facade: ChatShellFacade) {
    // ✅ UX: mostrar errores del facade como snackbar (presentación)
    effect(() => {
      const msg = this.facade.lastError();
      if (!msg) return;
      this.snack.open(String(msg), 'OK', { duration: 3500 });
    });
  }

  labelFor(status: WorkStatus): string {
    switch (status) {
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
  }
}
