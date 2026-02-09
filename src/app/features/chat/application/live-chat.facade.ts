import { Injectable, computed, signal } from '@angular/core';
import { ChatRepositoryHttp } from '../data/chat.repository.http';
import type { ChatMessage } from '../domain/models/chat-message.model';

/**
 *LiveChatFacade
 * - Maneja conversación actual
 * - Carga historial real (según backend)
 * - Polling para refrescar
 */
@Injectable({ providedIn: 'root' })
export class LiveChatFacade {
  private readonly peerIdSig = signal<string>('');
  private readonly conversationIdSig = signal<string | null>(null);

  private readonly messagesSig = signal<ChatMessage[]>([]);
  private readonly loadingSig = signal(false);
  private readonly sendingSig = signal(false);

  readonly peerId = computed(() => this.peerIdSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  /**
   *Abre conversación y carga historial
   */
  async openConversation(peerId: string): Promise<void> {
    if (!peerId) {
      this.stopPolling();
      this.peerIdSig.set('');
      this.conversationIdSig.set(null);
      this.messagesSig.set([]);
      return;
    }

    if (this.peerIdSig() === peerId) return;

    this.peerIdSig.set(peerId);
    await this.refreshMessages();
    this.startPolling();
  }

  /**
   *Envía mensaje de texto al backend
   */
  async send(text: string): Promise<void> {
    const peerId = this.peerIdSig();
    const clean = text.trim();
    if (!peerId || !clean) return;

    this.sendingSig.set(true);
    try {
      const sent = await this.chatRepo.sendText(peerId, clean);

      // Append optimista
      this.messagesSig.set([...this.messagesSig(), sent]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  /**
   *Refresca historial desde backend
   */
  async refreshMessages(): Promise<void> {
    const peerId = this.peerIdSig();
    if (!peerId) return;

    this.loadingSig.set(true);
    try {
      const { conversationId, messages } = await this.chatRepo.getHistory(peerId, 200);

      this.conversationIdSig.set(conversationId);

      // OJO: backend devuelve newest first (sort desc) — lo invertimos para mostrar natural arriba->abajo
      const ordered = [...messages].reverse();

      this.messagesSig.set(ordered);
    } finally {
      this.loadingSig.set(false);
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = window.setInterval(() => {
      this.refreshMessages();
    }, 3000);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
}
