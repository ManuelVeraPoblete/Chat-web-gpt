import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatShellFacade } from '../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../domain/value-objects/work-status.vo';

/**
 *Header corporativo con estados laborales.
 * Standalone: se importa desde ChatShellPage.
 */
@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="logo">ConnectHub</div>

      <div class="actions">
        <button class="btn primary" (click)="facade.connect()">Iniciar conexión</button>
        <button class="btn" (click)="facade.setStatus(WorkStatus.PAUSED)">Pausa</button>
        <button class="btn" (click)="facade.setStatus(WorkStatus.LUNCH)">Almuerzo</button>
        <button class="btn danger" (click)="facade.setStatus(WorkStatus.ENDED)">Desconectar</button>
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
    }
    .logo { font-weight: 700; letter-spacing: 0.3px; }
    .actions { display: flex; gap: 8px; }
    .btn {
      border: 0;
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      color: #fff;
      cursor: pointer;
    }
    .btn.primary { background: #1ea97c; }
    .btn.danger { background: #d9534f; }
    .right-icons { display: flex; gap: 10px; opacity: 0.95; }
    .icon { cursor: pointer; user-select: none; }
  `],
})
export class TopHeaderComponent {
  WorkStatus = WorkStatus;

  constructor(public facade: ChatShellFacade) {}
}
