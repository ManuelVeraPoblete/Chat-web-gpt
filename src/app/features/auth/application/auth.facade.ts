import { Injectable, computed, signal } from '@angular/core';
import { AuthRepositoryHttp } from '../data/auth.repository.http';
import type { Session } from '../domain/models/session.model';
import type { RefreshResult } from '../domain/ports/auth.repository';
import { decodeJwt } from '../../../core/auth/utils/jwt.util';
import { from, Observable, shareReplay, switchMap, tap } from 'rxjs';

/**
 * AuthFacade:
 * - Estado de sesión (signals)
 * - login/logout
 * - refreshTokens$ con 1 refresh en vuelo (shareReplay)
 *
 * Nota: almacenamiento de tokens:
 * - Ideal: access en memoria + refresh en cookie httpOnly (si backend lo soporta).
 * - Como RN usa refreshToken en storage, aquí replicamos mínimo con localStorage.
 *   (Te dejo listo para migrar a cookie si el backend lo permite).
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly sessionSig = signal<Session | null>(null);
  private readonly bootstrappingSig = signal(true);

  // Control de refresh en vuelo
  private refreshInFlight$: Observable<RefreshResult> | null = null;

  constructor(private readonly repo: AuthRepositoryHttp) {
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

  logout(): void {
    this.sessionSig.set(null);
    localStorage.removeItem('corpchat.session');
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
