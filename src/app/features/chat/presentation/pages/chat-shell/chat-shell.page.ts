// src/app/features/chat/presentation/pages/chat-shell/chat-shell.page.ts

import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PageShellComponent } from '../../../../../shared/ui/page-shell/page-shell.component';
import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';

import { UsersSidebarComponent } from '../../components/users-sidebar/users-sidebar.component';
import { LiveChatPanelComponent } from '../../components/live-chat-panel/live-chat-panel.component';
import { AiAssistantPanelComponent } from '../../components/ai-assistant-panel/ai-assistant-panel.component';

import type { AppUser } from '../../../domain/models/app-user.model';
import { environment } from '../../../../../../environments/environment';

/**
 *ChatShellPage (PRO++)
 * - Desktop: IA siempre disponible en columna 3
 * - Responsive: tab "Chat IA" alterna vista
 * -Focus inteligente:
 *   - Tab IA => enfoca input IA
 *   - Selección usuario => enfoca input chat
 */
@Component({
  standalone: true,
  selector: 'cc-chat-shell-page',
  imports: [
    RouterModule,
    PageShellComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,

    UsersSidebarComponent,
    LiveChatPanelComponent,
    AiAssistantPanelComponent,
  ],
  templateUrl: './chat-shell.page.html',
  styleUrl: './chat-shell.page.scss',
})
export class ChatShellPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);

  title = 'Chat';
  readonly vm = inject(ChatShellFacade);

  currentPeerId = '';
  currentPeerName = 'Usuario';

  assistantUserId: string = environment.assistantUserId ?? '';

  /**
   *Control de vista (users | ai)
   */
  readonly viewMode = signal<'users' | 'ai'>('users');

  /**
   *Referencias a paneles para focus
   */
  @ViewChild(LiveChatPanelComponent) liveChatPanel?: LiveChatPanelComponent;
  @ViewChild(AiAssistantPanelComponent) aiPanel?: AiAssistantPanelComponent;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('userId') ?? '';
    if (id) {
      this.currentPeerId = id;

      //si ya hay userId en URL, dejamos modo users y enfocamos chat al render
      window.setTimeout(() => this.liveChatPanel?.focusInput(), 120);
    }
  }

  async back(): Promise<void> {
    try {
      await this.router.navigateByUrl('/home');
    } catch {
      this.snack.open('No fue posible volver', 'Cerrar', { duration: 2500 });
    }
  }

  async onUserSelected(u: AppUser): Promise<void> {
    try {
      this.currentPeerId = u.id;
      this.currentPeerName = u.displayName;

      //al elegir usuario, volvemos a modo users y enfocamos chat
      this.viewMode.set('users');

      await this.router.navigate(['/chat', u.id]);

      //focus pro
      window.setTimeout(() => this.liveChatPanel?.focusInput(), 120);
    } catch (e: any) {
      this.snack.open(e?.message ?? 'No fue posible abrir el chat', 'Cerrar', { duration: 3500 });
    }
  }

  /**
   *Cambio de tab desde sidebar
   * - Si es IA => foco al input del asistente
   * - Si es users => foco al input chat (si hay usuario seleccionado)
   */
  onTabChanged(mode: 'users' | 'ai'): void {
    this.viewMode.set(mode);

    if (mode === 'ai') {
      window.setTimeout(() => this.aiPanel?.focusInput(), 120);
      return;
    }

    if (mode === 'users' && this.currentPeerId) {
      window.setTimeout(() => this.liveChatPanel?.focusInput(), 120);
    }
  }
}
