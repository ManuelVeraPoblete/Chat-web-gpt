import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';
import { UsersSidebarComponent } from '../../components/users-sidebar/users-sidebar.component';
import { LiveChatPanelComponent } from '../../components/live-chat-panel/live-chat-panel.component';
import { AiAssistantPanelComponent } from '../../components/ai-assistant-panel/ai-assistant-panel.component';
import { WorkStatusPanelComponent } from '../../components/work-status-panel/work-status-panel.component';

import type { AppUser } from '../../../domain/models/app-user.model';
import { environment } from '../../../../../../environments/environment';

// ✅ Barra superior corporativa
import { TopAppBarComponent } from '../../../../../shared/ui/top-app-bar/top-app-bar.component';

/**
 * ✅ ChatShellPage
 * - Contenedor UI del dashboard 3 columnas
 * - Controla el modo (Usuarios vs IA) para responsive
 * - Sin lógica de negocio: usa Facades
 */
@Component({
  standalone: true,
  selector: 'cc-chat-shell-page',
  imports: [
    RouterModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,

    // Top bar corporativa
    TopAppBarComponent,

    // Feature components
    UsersSidebarComponent,
    LiveChatPanelComponent,
    AiAssistantPanelComponent,
    WorkStatusPanelComponent,
  ],
  templateUrl: './chat-shell.page.html',
  styleUrl: './chat-shell.page.scss',
})
export class ChatShellPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(MatSnackBar);

  readonly vm = inject(ChatShellFacade);

  currentPeerId = '';
  currentPeerName = 'Usuario';

  assistantUserId: string = environment.assistantUserId ?? '';

  /**
   * ✅ En móvil:
   * - "users" muestra chat clásico
   * - "ai" muestra panel IA (y mantiene el panel de estados abajo)
   */
  readonly viewMode = signal<'users' | 'ai'>('users');

  @ViewChild(LiveChatPanelComponent) liveChatPanel?: LiveChatPanelComponent;
  @ViewChild(AiAssistantPanelComponent) aiPanel?: AiAssistantPanelComponent;

  ngOnInit(): void {
    // ✅ Sincroniza estado laboral desde backend al entrar
    this.vm.loadToday();

    const id = this.route.snapshot.paramMap.get('userId') ?? '';
    if (id) {
      this.currentPeerId = id;
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

      this.viewMode.set('users');
      await this.router.navigate(['/chat', u.id]);

      window.setTimeout(() => this.liveChatPanel?.focusInput(), 120);
    } catch (e: any) {
      this.snack.open(e?.message ?? 'No fue posible abrir el chat', 'Cerrar', { duration: 3500 });
    }
  }

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
