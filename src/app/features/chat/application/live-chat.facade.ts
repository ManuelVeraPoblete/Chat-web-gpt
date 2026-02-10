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

  /**
   * ✅ Si está en true:
   * - polling NO repone historial
   * - send() NO debe reactivar la vista (solo agrega el nuevo mensaje)
   * - solo reload(true) restaura historial
   */
  private readonly viewClearedSig = signal(false);

  readonly peerId = computed(() => this.peerIdSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());

  readonly viewCleared = computed(() => this.viewClearedSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  /**
   * ✅ Abre conversación:
   * - Cambia peer
   * - Permite carga normal (viewCleared=false)
   * - Carga historial (forzado)
   */
  async openConversation(peerId: string): Promise<void> {
    if (!peerId) {
      this.stopPolling();
      this.peerIdSig.set('');
      this.conversationIdSig.set(null);
      this.messagesSig.set([]);
      this.viewClearedSig.set(false);
      return;
    }

    if (this.peerIdSig() === peerId) return;

    this.peerIdSig.set(peerId);

    // ✅ Al cambiar de conversación, volvemos al modo normal (historial visible)
    this.viewClearedSig.set(false);

    await this.reload(true);
    this.startPolling();
  }

  /**
   * ✅ Envía mensaje
   * IMPORTANTE:
   * - Si viewCleared=true, NO reponemos historial.
   * - Solo agregamos el mensaje enviado a la vista actual.
   */
  async send(text: string): Promise<void> {
    const peerId = this.peerIdSig();
    const clean = text.trim();
    if (!peerId || !clean) return;

    this.sendingSig.set(true);
    try {
      const sent = await this.chatRepo.sendText(peerId, clean);

      // ✅ CLAVE:
      // NO cambiamos viewClearedSig aquí.
      // Si el usuario limpió la pantalla, se mantiene limpia, solo con nuevos mensajes.
      this.messagesSig.set([...this.messagesSig(), sent]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  /**
   * ✅ Recarga historial
   * @param force
   * - false: respeta viewCleared (polling NO repone)
   * - true : fuerza recarga y desactiva viewCleared (restaura historial completo)
   */
  async reload(force = false): Promise<void> {
    const peerId = this.peerIdSig();
    if (!peerId) return;

    // ✅ Si la vista está limpia por decisión del usuario,
    // no recargamos automáticamente (a menos que sea forzado).
    if (!force && this.viewClearedSig()) return;

    this.loadingSig.set(true);
    try {
      const { conversationId, messages } = await this.chatRepo.getHistory(peerId, 200);

      this.conversationIdSig.set(conversationId);

      // Backend suele venir newest-first -> invertimos para render natural
      const ordered = [...messages].reverse();
      this.messagesSig.set(ordered);

      // ✅ Solo cuando es recarga forzada restauramos comportamiento normal
      if (force) this.viewClearedSig.set(false);
    } finally {
      this.loadingSig.set(false);
    }
  }

  /**
   * ✅ Limpia SOLO la pantalla (UI)
   * - No borra backend
   * - Bloquea cualquier repoblación automática
   */
  clearView(): void {
    this.messagesSig.set([]);
    this.viewClearedSig.set(true);
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = window.setInterval(() => {
      // ✅ polling NO fuerza
      this.reload(false);
    }, 4000);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }
}
