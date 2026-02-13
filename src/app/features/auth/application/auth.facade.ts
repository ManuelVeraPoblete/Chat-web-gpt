import { Injectable, computed, signal } from '@angular/core';
import { from, Observable, shareReplay, tap, firstValueFrom } from 'rxjs';

import { AuthRepositoryHttp } from '../data/auth.repository.http';
import type { Session } from '../domain/models/session.model';
import type { RefreshResult } from '../domain/ports/auth.repository';

import { decodeJwt } from '../../../core/auth/utils/jwt.util';
import { SessionStateService } from '../../../core/state/session-state.service';
import { WorkdayRepositoryHttp } from '../../chat/infrastructure/http/workday.repository.http';

/**
 * ✅ AuthFacade
 * - Mantiene estado de sesión (signals)
 * - Login / Logout (local + remoto)
 * - Refresh tokens con control de concurrencia (1 refresh en vuelo)
 *
 * Nota:
 * - Guardamos sesión en localStorage para mantener compatibilidad con RN/Storage.
 * - A futuro, si el backend soporta refresh cookie httpOnly, se puede migrar.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly sessionSig = signal<Session | null>(null);
  private readonly bootstrappingSig = signal(true);

  // Control de refresh en vuelo
  private refreshInFlight$: Observable<RefreshResult> | null = null;

  constructor(
    private readonly repo: AuthRepositoryHttp,
    private readonly sessionState: SessionStateService,
    private readonly workdayRepo: WorkdayRepositoryHttp,
  ) {
    this.bootstrapFromStorage();
  }

  // -----------------------------
  // Selectores (signals)
  // -----------------------------
  session = computed(() => this.sessionSig());
  isBootstrapping = computed(() => this.bootstrappingSig());
  isAuthenticated = computed(() => !!this.sessionSig());

  accessToken = computed(() => this.sessionSig()?.accessToken ?? '');
  refreshToken = computed(() => this.sessionSig()?.refreshToken ?? '');

  roles = computed(() => {
    const token = this.sessionSig()?.accessToken;
    const payload = token ? decodeJwt(token) : null;
    return (payload?.roles as string[]) ?? this.sessionSig()?.user.roles ?? [];
  });

  // -----------------------------
  // Commands
  // -----------------------------
  async login(email: string, password: string): Promise<void> {
    const session = await this.repo.login(email, password);
    this.sessionSig.set(session);
    this.persistSession(session);
  }

  /**
   * ✅ Logout LOCAL (rápido y seguro)
   * - Se usa desde interceptors (401) para cortar sesión sin depender del backend.
   */
  logout(): void {
    this.sessionSig.set(null);
    localStorage.removeItem('corpchat.session');
  }

  /**
   * ✅ Logout COMPLETO (manual por usuario)
   * Requisitos del negocio:
   * - Llamar POST /auth/logout (revoca refresh token en BD)
   * - Marcar estado laboral como "desconectado" (POST /workday/end)
   * - Limpiar estado en memoria del Front (signals)
   * - Dejar lista la app para iniciar una nueva sesión "desde cero"
   *
   * Importante:
   * - La secuencia primero llama al backend (mientras tenemos token),
   *   luego limpia localStorage y estado en memoria.
   * - Si el backend falla, igual hacemos limpieza local (fail-safe).
   */
  async logoutFull(): Promise<void> {
    const current = this.sessionSig();

    try {
      // 1) Intentar marcar desconexión (estado laboral ENDED)
      //    - Si el usuario no inició jornada, el backend podría responder error.
      //    - Por eso es best-effort.
      if (current?.accessToken) {
        await firstValueFrom(this.workdayRepo.end());
      }

      // 2) Intentar logout backend (revoca refresh token)
      if (current?.accessToken) {
        await this.repo.logout();
      }
    } catch {
      // Best-effort: no bloqueamos el logout si el backend falla.
    } finally {
      // 3) Limpieza local + reseteo de estados en memoria
      this.logout();
      this.sessionState.clearAll();
    }
  }

  /**
   * Refresh con control de concurrencia:
   * - Si ya hay refresh en curso, se reutiliza.
   */
  refreshTokens$(): Observable<RefreshResult> {
    const current = this.sessionSig();
    if (!current?.refreshToken) {
      // No hay refresh token => forzar logout desde interceptor
      return from(Promise.reject(new Error('No refreshToken present')));
    }

    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = from(this.repo.refresh(current.refreshToken)).pipe(
        tap((tokens) => {
          // Actualizamos sesión local (mismo patrón que RN updateTokens)
          const next: Session = {
            ...current,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken ?? current.refreshToken,
          };
          this.sessionSig.set(next);
          this.persistSession(next);
        }),
        // shareReplay => todos esperan al mismo refresh
        shareReplay({ bufferSize: 1, refCount: true })
      );

      // Al terminar, liberamos el inFlight$
      this.refreshInFlight$ = this.refreshInFlight$.pipe(
        tap({
          finalize: () => {
            this.refreshInFlight$ = null;
          },
        } as any)
      );
    }

    return this.refreshInFlight$;
  }

  // -----------------------------
  // Storage
  // -----------------------------
  private bootstrapFromStorage(): void {
    try {
      const raw = localStorage.getItem('corpchat.session');
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        this.sessionSig.set(parsed);
      }
    } finally {
      this.bootstrappingSig.set(false);
    }
  }

  private persistSession(session: Session): void {
    localStorage.setItem('corpchat.session', JSON.stringify(session));
  }
}
