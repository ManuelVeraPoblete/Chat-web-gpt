import { Component, EventEmitter, Input, OnInit, Output, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { UsersSidebarFacade } from '../../../application/users-sidebar.facade';
import type { AppUser } from '../../../domain/models/app-user.model';

/**
 * ✅ UsersSidebarComponent (PRO)
 * - Tab "Usuarios": muestra usuarios REALES (excluye asistente IA)
 * - Tab "Chat IA": muestra SOLO el Asistente IA como “usuario”
 * - NO navega: emite eventos al contenedor (ChatShell)
 */
@Component({
  standalone: true,
  selector: 'cc-users-sidebar',
  imports: [
    NgIf,
    NgFor,
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
   * - Si el backend lo trae en la lista, lo usamos
   * - Si no, mostramos un placeholder decente
   */
  readonly assistantUser = computed<AppUser | null>(() => {
    const assistantId = this.assistantUserId;
    if (!assistantId) return null;

    const found = this.vm.users().find((u) => u.id === assistantId);
    if (found) return found;

    // Fallback (por si el backend no devuelve el asistente dentro del listado)
    return {
      id: assistantId,
      displayName: 'Asistente IA',
      jobTitle: 'Asistente Corporativo',
      companySection: '',
      // Si tu AppUser tiene más campos obligatorios, los dejas en blanco/undefined.
    } as unknown as AppUser;
  });

  async ngOnInit(): Promise<void> {
    await this.vm.load();
  }

  /**
   * ✅ Selección usuario real (no IA)
   */
  selectUser(u: AppUser): void {
    if (!u?.id) return;
    this.userSelected.emit(u);
  }

  /**
   * ✅ Selección del asistente IA (no navega a /chat/:id)
   * Solo cambia el modo a IA para que el panel derecho aparezca y se enfoque.
   */
  openAssistant(): void {
    this.tabChanged.emit('ai');
  }

  /**
   * ✅ Emitimos modo según tab
   * index 0 = Usuarios, index 1 = Chat IA
   */
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
}
