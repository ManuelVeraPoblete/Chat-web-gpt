import { Injectable, computed, signal } from '@angular/core';

import { UsersRepositoryHttp } from '../data/users.repository.http';
import { UnreadRepositoryHttp } from '../data/unread.repository.http';
import type { AppUser } from '../domain/models/app-user.model';

/**
 *UsersSidebarFacade
 * Responsabilidad única (SRP):
 * - Cargar usuarios
 * - Cargar contadores unread
 *
 * Notas:
 * - Signals = estado UI limpio
 * - Sin lógica en templates
 */
@Injectable({ providedIn: 'root' })
export class UsersSidebarFacade {
  private readonly usersSig = signal<AppUser[]>([]);
  private readonly unreadSig = signal<Record<string, number>>({});
  private readonly loadingSig = signal(false);

  users = computed(() => this.usersSig());
  unread = computed(() => this.unreadSig());
  loading = computed(() => this.loadingSig());

  constructor(
    private readonly usersRepo: UsersRepositoryHttp,
    private readonly unreadRepo: UnreadRepositoryHttp
  ) {}

  async load(): Promise<void> {
    this.loadingSig.set(true);

    try {
      const users = await this.usersRepo.getAll();
      this.usersSig.set(users);

      // Contadores unread por peerId
      const ids = users.map((u) => u.id);
      const counts = await this.unreadRepo.getUnreadCounts(ids);
      this.unreadSig.set(counts);
    } finally {
      this.loadingSig.set(false);
    }
  }
}
