import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { ChatMessage } from '../domain/models/chat-message.model';

/**
 *ChatRepositoryHttp (Dashboard)
 * - GET  /chat/:peerId/messages?limit=200
 *   Backend devuelve: { conversationId: string | null, messages: ChatMessage[] }
 *
 * - POST /chat/:peerId/messages
 *   Backend devuelve: mensaje creado (o {created: []} si soporta IA, etc)
 *
 * Nota:
 * - base-url.interceptor + auth.interceptor ya aplican
 */
@Injectable({ providedIn: 'root' })
export class ChatRepositoryHttp {
  constructor(private readonly http: HttpClient) {}

  async getHistory(peerId: string, limit = 200): Promise<{ conversationId: string | null; messages: ChatMessage[] }> {
    const res = await firstValueFrom(
      this.http.get<{ conversationId: string | null; messages: ChatMessage[] }>(
        `/chat/${peerId}/messages?limit=${limit}`
      )
    );

    return {
      conversationId: res?.conversationId ?? null,
      messages: Array.isArray(res?.messages) ? res.messages : [],
    };
  }

  async sendText(peerId: string, text: string): Promise<ChatMessage> {
    // Backend espera { text: "hola" }
    return await firstValueFrom(
      this.http.post<ChatMessage>(`/chat/${peerId}/messages`, { text })
    );
  }
}
