import { Component, EventEmitter, Input, OnInit, Output, computed } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { UsersSidebarFacade } from '../../../application/users-sidebar.facade';
import type { AppUser } from '../../../domain/models/app-user.model';
import { WorkStatus } from '../../../domain/value-objects/work-status.vo';

/**
 * ✅ UsersSidebarComponent
 * - Tab "Usuarios": muestra usuarios reales (excluye Asistente IA)
 * - Tab "Chat IA": muestra SOLO el Asistente IA como “usuario”
 * - NO navega: emite eventos al contenedor (ChatShell)
 */
@Component({
  standalone: true,
  selector: 'cc-users-sidebar',
  imports: [
    // ✅ Angular
    NgIf,
    NgFor,
    NgClass,

    // ✅ Material
    MatTabsModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './users-sidebar.component.html',
  styleUrl: './users-sidebar.component.scss',
})
export class UsersSidebarComponent implements OnInit {
  @Input() currentPeerId: string = '';

  /**
   * ✅ ID del “usuario” Asistente IA (desde environment)
   */
  @Input() assistantUserId: string = '';

  @Output() userSelected = new EventEmitter<AppUser>();

  /**
   * ✅ Tab-mode: el shell decide vista (users | ai)
   */
  @Output() tabChanged = new EventEmitter<'users' | 'ai'>();

  readonly WorkStatus = WorkStatus;

  constructor(public readonly vm: UsersSidebarFacade) {}

  /**
   * ✅ Usuarios reales (sin IA)
   */
  readonly usersFiltered = computed(() => {
    const users = this.vm.users();
    const assistantId = this.assistantUserId;

    if (!assistantId) return users;
    return users.filter((u) => u.id !== assistantId);
  });

  /**
   * ✅ “Usuario” asistente para el tab Chat IA
   */
  readonly assistantUser = computed<AppUser | null>(() => {
    const assistantId = this.assistantUserId;
    if (!assistantId) return null;

    const found = this.vm.users().find((u) => u.id === assistantId);
    if (found) return found;

    // Fallback si el asistente no viene desde backend
    return {
      id: assistantId,
      displayName: 'Asistente IA',
      jobTitle: 'Asistente Corporativo',
      companySection: '',
    } as unknown as AppUser;
  });

  async ngOnInit(): Promise<void> {
    await this.vm.load();
  }

  selectUser(u: AppUser): void {
    if (!u?.id) return;
    this.userSelected.emit(u);
  }

  openAssistant(): void {
    this.tabChanged.emit('ai');
  }

  onTabIndexChange(index: number): void {
    this.tabChanged.emit(index === 1 ? 'ai' : 'users');
  }

  trackById(_: number, u: AppUser): string {
    return u.id;
  }

  isSelected(u: AppUser): boolean {
    return !!u?.id && u.id === this.currentPeerId;
  }

  unreadCount(u: AppUser): number {
    const counts = this.vm.unread();
    return counts?.[u.id] ?? 0;
  }

  /**
   * ✅ Estado laboral del usuario (para dot + tooltip)
   */
  statusOf(u: AppUser): WorkStatus {
    return this.vm.getStatus(u.id);
  }

  /**
   * ✅ Clase CSS para el dot de estado
   * (los colores reales se definen en SCSS)
   */
  statusDotClass(st: WorkStatus): string {
    if (st === WorkStatus.ACTIVE) return 'green';
    if (st === WorkStatus.PAUSED) return 'yellow';
    if (st === WorkStatus.LUNCH) return 'orange';
    if (st === WorkStatus.ENDED) return 'gray';
    return 'gray';
  }

  /**
   * ✅ Texto humano para tooltip del estado
   */
  statusLabel(st: WorkStatus): string {
    if (st === WorkStatus.ACTIVE) return 'Conectado';
    if (st === WorkStatus.PAUSED) return 'En pausa';
    if (st === WorkStatus.LUNCH) return 'En almuerzo';
    if (st === WorkStatus.ENDED) return 'Desconectado';
    return 'Sin iniciar';
  }
}
