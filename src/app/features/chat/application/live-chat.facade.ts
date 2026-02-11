import { Injectable, computed, signal } from '@angular/core';
import type { ChatMessage } from '../domain/models/chat-message.model';
import { ChatRepositoryHttp } from '../data/chat.repository.http';

/**
 * ✅ LiveChatFacade
 * - Maneja conversación con peer (usuario)
 * - Historial + polling
 * - Envío
 *
 * ✅ Regla UX:
 * - Si el usuario presiona "Limpiar pantalla", la vista queda limpia
 *   y NO debe repoblarse automáticamente (ni por polling ni por send).
 * - Solo "Recargar historial" (force=true) vuelve a traer todo.
 */
@Injectable({ providedIn: 'root' })
export class LiveChatFacade {
  private readonly peerIdSig = signal<string>('');
  private readonly conversationIdSig = signal<string | null>(null);

  private readonly messagesSig = signal<ChatMessage[]>([]);
  private readonly loadingSig = signal(false);
  private readonly sendingSig = signal(false);

  private readonly viewClearedSig = signal(false);

  readonly peerId = computed(() => this.peerIdSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());

  readonly viewCleared = computed(() => this.viewClearedSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  async openConversation(peerId: string): Promise<void> {
    if (!peerId) {
      this.resetState();
      return;
    }

    if (this.peerIdSig() === peerId) return;

    this.peerIdSig.set(peerId);
    this.viewClearedSig.set(false);

    await this.reload(true);
    this.startPolling();
  }

  async send(text: string): Promise<void> {
    const peerId = this.peerIdSig();
    const clean = text.trim();
    if (!peerId || !clean) return;

    this.sendingSig.set(true);
    try {
      const sent = await this.chatRepo.sendText(peerId, clean);

      // ✅ No reactivamos historial si estaba limpio
      this.messagesSig.set([...this.messagesSig(), sent]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  async reload(force = false): Promise<void> {
    const peerId = this.peerIdSig();
    if (!peerId) return;

    if (!force && this.viewClearedSig()) return;

    this.loadingSig.set(true);
    try {
      const { conversationId, messages } = await this.chatRepo.getHistory(peerId, 200);

      this.conversationIdSig.set(conversationId);

      const ordered = [...messages].reverse();
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
    this.peerIdSig.set('');
    this.conversationIdSig.set(null);
    this.messagesSig.set([]);
    this.loadingSig.set(false);
    this.sendingSig.set(false);
    this.viewClearedSig.set(false);
  }
}
