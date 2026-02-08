import { Injectable, computed, signal } from '@angular/core';
import { UsersRepositoryHttp } from '../data/users.repository.http';
import { ChatRepositoryHttp } from '../data/chat.repository.http';
import type { AppUser } from '../domain/models/app-user.model';

/**
 * HomeFacade:
 * - carga usuarios
 * - carga unread counts
 */
@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly usersSig = signal<AppUser[]>([]);
  private readonly unreadSig = signal<Record<string, number>>({});
  private readonly loadingSig = signal(false);

  users = computed(() => this.usersSig());
  unread = computed(() => this.unreadSig());
  loading = computed(() => this.loadingSig());

  constructor(
    private readonly usersRepo: UsersRepositoryHttp,
    private readonly chatRepo: ChatRepositoryHttp
  ) {}

  async load(): Promise<void> {
    this.loadingSig.set(true);
    try {
      const users = await this.usersRepo.getAll();
      this.usersSig.set(users);

      const ids = users.map((u) => u.id);
      const counts = await this.chatRepo.getUnreadCounts(ids);
      this.unreadSig.set(counts);
    } finally {
      this.loadingSig.set(false);
    }
  }
}
