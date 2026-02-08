import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Equivalente a ChatRepositoryHttp RN:
 * POST /chat/unread-counts  { peerIds: [] } -> { counts: { [id]: number } }
 */
@Injectable({ providedIn: 'root' })
export class ChatRepositoryHttp {
  constructor(private readonly http: HttpClient) {}

  async getUnreadCounts(peerIds: string[]): Promise<Record<string, number>> {
    const payload = { peerIds: Array.from(new Set(peerIds)).filter(Boolean) };

    const res = await firstValueFrom(
      this.http.post<{ counts: Record<string, number> }>('/chat/unread-counts', payload)
    );

    return res?.counts ?? {};
  }
}
