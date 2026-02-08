import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../../domain/value-objects/work-status.vo';

/**
 * ✅ ChatShellPage (Standalone)
 * Página principal tipo dashboard (3 columnas).
 *
 * IMPORTANTE:
 * - En standalone, para usar componentes en el HTML (tags <app-...>),
 *   debes agregarlos en `imports: []`.
 */
import { TopHeaderComponent } from '../../components/top-header.component';
import { UsersSidebarComponent } from '../../components/users-sidebar.component';
import { LiveChatPanelComponent } from '../../components/live-chat-panel.component';
import { AiAssistantPanelComponent } from '../../components/ai-assistant-panel.component';

@Component({
  standalone: true,
  selector: 'app-chat-shell',
  templateUrl: './chat-shell.page.html',
  styleUrls: ['./chat-shell.page.scss'],
  /**
   * ✅ Aquí está la corrección:
   * Registramos los componentes usados en el template HTML.
   */
  imports: [
    CommonModule,
    TopHeaderComponent,
    UsersSidebarComponent,
    LiveChatPanelComponent,
    AiAssistantPanelComponent,
  ],
})
export class ChatShellPage {
  /**
   * Exponemos el enum para el template (si lo necesitas).
   */
  WorkStatus = WorkStatus;

  constructor(public facade: ChatShellFacade) {}
}
