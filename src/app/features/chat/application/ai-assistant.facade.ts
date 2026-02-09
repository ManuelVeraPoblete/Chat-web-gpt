import { Injectable, computed, signal } from '@angular/core';
import type { ChatMessage } from '../domain/models/chat-message.model';
import { ChatRepositoryHttp } from '../data/chat.repository.http';

/**
 *AiAssistantFacade
 * SRP:
 * - Maneja conversación con el asistente (peer = assistantUserId)
 * - Carga historial
 * - Envia pregunta (POST /chat/:assistantId/messages)
 * - Polling para refrescar (cada 4s)
 *
 * Nota:
 * - Reutiliza el mismo repo del chat, porque el backend expone la IA como "usuario asistente".
 */
@Injectable({ providedIn: 'root' })
export class AiAssistantFacade {
  private readonly assistantIdSig = signal<string>('');
  private readonly conversationIdSig = signal<string | null>(null);

  private readonly messagesSig = signal<ChatMessage[]>([]);
  private readonly loadingSig = signal(false);
  private readonly sendingSig = signal(false);

  readonly assistantId = computed(() => this.assistantIdSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  /**
   *Inicializa conversación con el asistente y empieza polling.
   */
  async init(assistantUserId: string): Promise<void> {
    if (!assistantUserId) {
      this.stopPolling();
      this.assistantIdSig.set('');
      this.conversationIdSig.set(null);
      this.messagesSig.set([]);
      return;
    }

    if (this.assistantIdSig() === assistantUserId) return;

    this.assistantIdSig.set(assistantUserId);

    await this.refresh();
    this.startPolling();
  }

  /**
   *Envía una pregunta al asistente.
   * Backend: POST /chat/:assistantId/messages { text }
   */
  async ask(text: string): Promise<void> {
    const assistantId = this.assistantIdSig();
    const clean = text.trim();
    if (!assistantId || !clean) return;

    this.sendingSig.set(true);
    try {
      const sent = await this.chatRepo.sendText(assistantId, clean);

      // Append optimista
      this.messagesSig.set([...this.messagesSig(), sent]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  /**
   *Refresca historial desde backend.
   * Backend: GET /chat/:assistantId/messages -> { conversationId, messages }
   */
  async refresh(): Promise<void> {
    const assistantId = this.assistantIdSig();
    if (!assistantId) return;

    this.loadingSig.set(true);
    try {
      const { conversationId, messages } = await this.chatRepo.getHistory(assistantId, 200);

      this.conversationIdSig.set(conversationId);

      // Backend viene newest-first => lo invertimos para render natural
      const ordered = [...messages].reverse();
      this.messagesSig.set(ordered);
    } finally {
      this.loadingSig.set(false);
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = window.setInterval(() => {
      this.refresh();
    }, 4000);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
}
