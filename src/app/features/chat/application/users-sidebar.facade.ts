import { Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { UsersRepositoryHttp } from '../data/users.repository.http';
import { UnreadRepositoryHttp } from '../data/unread.repository.http';

import { GetTodayWorkdayStatusesUseCase } from './use-cases/get-today-workday-statuses.usecase';

import type { AppUser } from '../domain/models/app-user.model';
import type { WorkdayDto } from '../domain/models/workday-dto.model';
import { WorkStatus } from '../domain/value-objects/work-status.vo';

/**
 * ✅ UsersSidebarFacade
 * - usuarios
 * - unread counts
 * - estados laborales por usuario (hoy)
 */
@Injectable({ providedIn: 'root' })
export class UsersSidebarFacade {
  private readonly usersSig = signal<AppUser[]>([]);
  private readonly unreadSig = signal<Record<string, number>>({});
  private readonly loadingSig = signal(false);

  private readonly statusSig = signal<Record<string, WorkStatus>>({});

  users = computed(() => this.usersSig());
  unread = computed(() => this.unreadSig());
  loading = computed(() => this.loadingSig());
  statuses = computed(() => this.statusSig());

  statusCounts = computed(() => {
    const users = this.usersSig();
    const map = this.statusSig();

    let active = 0;
    let paused = 0;
    let lunch = 0;
    let ended = 0;

    for (const u of users) {
      const st = map[u.id] ?? WorkStatus.NOT_STARTED;

      if (st === WorkStatus.ACTIVE) active++;
      else if (st === WorkStatus.PAUSED) paused++;
      else if (st === WorkStatus.LUNCH) lunch++;
      else if (st === WorkStatus.ENDED) ended++;
    }

    return { active, paused, lunch, ended };
  });

  constructor(
    private readonly usersRepo: UsersRepositoryHttp,
    private readonly unreadRepo: UnreadRepositoryHttp,
    private readonly statusesUC: GetTodayWorkdayStatusesUseCase,
  ) {}

  async load(): Promise<void> {
    this.loadingSig.set(true);

    try {
      const users = await this.usersRepo.getAll();
      this.usersSig.set(users ?? []);

      const ids = (users ?? []).map((u) => u.id).filter(Boolean);

      // unread
      try {
        const counts = await this.unreadRepo.getUnreadCounts(ids);
        this.unreadSig.set(counts ?? {});
      } catch (e) {
        console.warn('[UsersSidebarFacade] No se pudieron cargar unreadCounts', e);
        this.unreadSig.set({});
      }

      // statuses
      const statuses = await this.loadStatuses(ids);
      this.statusSig.set(statuses);
    } finally {
      this.loadingSig.set(false);
    }
  }

  getStatus(userId: string): WorkStatus {
    return this.statusSig()[userId] ?? WorkStatus.NOT_STARTED;
  }

  private async loadStatuses(userIds: string[]): Promise<Record<string, WorkStatus>> {
    if (!Array.isArray(userIds) || userIds.length === 0) return {};

    try {
      const raw = await firstValueFrom(this.statusesUC.execute(userIds));
      const map = this.normalizeStatusesResponse(raw);

      const res: Record<string, WorkStatus> = {};
      for (const [id, dto] of Object.entries(map)) {
        res[id] = this.coerceStatus(dto?.status);
      }

      for (const id of userIds) {
        if (!res[id]) res[id] = WorkStatus.NOT_STARTED;
      }

      return res;
    } catch (e) {
      console.warn('[UsersSidebarFacade] No se pudieron cargar estados /workday/today/statuses', e);
      const fallback: Record<string, WorkStatus> = {};
      for (const id of userIds) fallback[id] = WorkStatus.NOT_STARTED;
      return fallback;
    }
  }

  private normalizeStatusesResponse(raw: unknown): Record<string, WorkdayDto> {
    // { data: {...} }
    if (raw && typeof raw === 'object' && 'data' in (raw as any)) {
      const data = (raw as any).data;
      if (data && typeof data === 'object') return data as Record<string, WorkdayDto>;
    }

    // Record<string, WorkdayDto>
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, WorkdayDto>;
    }

    // Array<WorkdayDto>
    if (Array.isArray(raw)) {
      const out: Record<string, WorkdayDto> = {};
      for (const item of raw) {
        const dto = item as WorkdayDto;
        if (dto?.userId) out[dto.userId] = dto;
      }
      return out;
    }

    return {};
  }

  private coerceStatus(input: unknown): WorkStatus {
    const v = String(input ?? '').toUpperCase();

    if (v === WorkStatus.ACTIVE) return WorkStatus.ACTIVE;
    if (v === WorkStatus.PAUSED) return WorkStatus.PAUSED;
    if (v === WorkStatus.LUNCH) return WorkStatus.LUNCH;
    if (v === WorkStatus.ENDED) return WorkStatus.ENDED;

    return WorkStatus.NOT_STARTED;
  }

  /**
   * ✅ NUEVO: Resetea estado (para 401/logout)
   */
  resetState(): void {
    this.usersSig.set([]);
    this.unreadSig.set({});
    this.statusSig.set({});
    this.loadingSig.set(false);
  }
}
