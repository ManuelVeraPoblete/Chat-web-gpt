import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
 *UsersSidebarComponent (PRO)
 * - Presentacional: lista usuarios + unread
 * - NO navega: emite userSelected
 * -NUEVO: emite tabChanged (users | ai) para controlar visibilidad IA en responsive
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
  /**
   *currentPeerId (opcional)
   * - En /chat (shell) puede venir vacío.
   * - En /chat/:userId se pasa para resaltar.
   */
  @Input() currentPeerId: string = '';

  /**
   *Evento PRO: el contenedor decide navegación.
   */
  @Output() userSelected = new EventEmitter<AppUser>();

  /**
   *Evento PRO: el contenedor decide qué mostrar (users / ai)
   */
  @Output() tabChanged = new EventEmitter<'users' | 'ai'>();

  constructor(public readonly vm: UsersSidebarFacade) {}

  async ngOnInit(): Promise<void> {
    await this.vm.load();
  }

  /**
   * Emite selección (no navega).
   */
  selectUser(u: AppUser): void {
    if (!u?.id) return;
    this.userSelected.emit(u);
  }

  /**
   *Emitimos el modo según tab
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
