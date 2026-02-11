import { Injectable, computed, signal } from '@angular/core';

import { ChatRepositoryHttp } from '../data/chat.repository.http';
import type { ChatMessage } from '../domain/models/chat-message.model';

/**
 * ✅ AiAssistantFacade (PRO)
 *
 * - Usa el MISMO repositorio HTTP que el chat normal:
 *   GET  /chat/:peerId/messages?limit=200  -> getHistory(peerId)
 *   POST /chat/:peerId/messages           -> sendText(peerId, text)
 *
 * ✅ UX:
 * - "Limpiar pantalla" limpia solo UI y bloquea repoblación automática
 * - Enviar mientras está limpio: solo aparecen mensajes nuevos
 * - Solo "Recargar historial" restaura historial
 */
@Injectable({ providedIn: 'root' })
export class AiAssistantFacade {
  private readonly assistantIdSig = signal<string>('');

  private readonly messagesSig = signal<ChatMessage[]>([]);
  private readonly loadingSig = signal(false);
  private readonly sendingSig = signal(false);

  private readonly viewClearedSig = signal(false);
  private readonly conversationIdSig = signal<string | null>(null);

  readonly assistantUserId = computed(() => this.assistantIdSig());
  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());
  readonly viewCleared = computed(() => this.viewClearedSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  async init(assistantUserId: string): Promise<void> {
    if (!assistantUserId) {
      this.resetState();
      return;
    }

    if (this.assistantIdSig() === assistantUserId) return;

    this.assistantIdSig.set(assistantUserId);
    this.viewClearedSig.set(false);

    await this.reload(true);
    this.startPolling();
  }

  async ask(text: string): Promise<void> {
    const assistantId = this.assistantIdSig();
    const clean = text.trim();
    if (!assistantId || !clean) return;

    this.sendingSig.set(true);
    try {
      const created = await this.chatRepo.sendText(assistantId, clean);

      // ✅ Si estaba "limpio", se mantiene limpio; solo agregamos lo nuevo.
      this.messagesSig.set([...this.messagesSig(), created]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  async reload(force = false): Promise<void> {
    const assistantId = this.assistantIdSig();
    if (!assistantId) return;

    // Si el usuario limpió la vista, NO repoblar automáticamente (a menos que sea forzado)
    if (!force && this.viewClearedSig()) return;

    this.loadingSig.set(true);
    try {
      const res = await this.chatRepo.getHistory(assistantId, 200);

      this.conversationIdSig.set(res.conversationId ?? null);

      // backend suele venir newest-first, invertimos para render natural
      const ordered = [...res.messages].reverse();
      this.messagesSig.set(ordered);

      if (force) this.viewClearedSig.set(false);
    } finally {
      this.loadingSig.set(false);
    }
  }

  clearView(): void {
    this.messagesSig.set([]);
    this.viewClearedSig.set(true);
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = window.setInterval(() => {
      this.reload(false);
    }, 4000);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  /**
   * ✅ NUEVO: Resetea estado en memoria (para 401/logout)
   */
  resetState(): void {
    this.stopPolling();
    this.assistantIdSig.set('');
    this.messagesSig.set([]);
    this.loadingSig.set(false);
    this.sendingSig.set(false);
    this.viewClearedSig.set(false);
    this.conversationIdSig.set(null);
  }
}
