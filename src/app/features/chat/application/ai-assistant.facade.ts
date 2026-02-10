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
 * ✅ UX (igual que Chat en Vivo):
 * - "Limpiar pantalla" limpia solo UI y bloquea repoblación automática
 *   (polling NO debe traer historial)
 * - Enviar mensajes mientras está limpio:
 *   -> se muestran SOLO los mensajes nuevos (no vuelve el historial)
 * - Solo "Recargar historial" restaura todo el historial
 *
 * ✅ Limpio, tipado, sin any.
 */
@Injectable({ providedIn: 'root' })
export class AiAssistantFacade {
  private readonly assistantIdSig = signal<string>('');

  private readonly messagesSig = signal<ChatMessage[]>([]);
  private readonly loadingSig = signal(false);
  private readonly sendingSig = signal(false);

  /**
   * ✅ Bandera: cuando el usuario limpia la vista,
   * bloqueamos la recarga automática para que no reaparezcan mensajes.
   */
  private readonly viewClearedSig = signal(false);

  /**
   * ✅ Conversación del asistente (informativo)
   * (viene en GET /chat/:peerId/messages)
   */
  private readonly conversationIdSig = signal<string | null>(null);

  readonly assistantUserId = computed(() => this.assistantIdSig());
  readonly messages = computed(() => this.messagesSig());
  readonly loading = computed(() => this.loadingSig());
  readonly sending = computed(() => this.sendingSig());
  readonly viewCleared = computed(() => this.viewClearedSig());
  readonly conversationId = computed(() => this.conversationIdSig());

  private pollTimer?: number;

  constructor(private readonly chatRepo: ChatRepositoryHttp) {}

  /**
   * ✅ Inicializa el chat del asistente.
   * - Cambia assistantUserId
   * - Habilita modo normal (historial visible)
   * - Carga historial forzado y parte polling
   */
  async init(assistantUserId: string): Promise<void> {
    if (!assistantUserId) {
      this.stopPolling();
      this.assistantIdSig.set('');
      this.messagesSig.set([]);
      this.conversationIdSig.set(null);
      this.viewClearedSig.set(false);
      return;
    }

    if (this.assistantIdSig() === assistantUserId) return;

    this.assistantIdSig.set(assistantUserId);

    // ✅ Al cambiar asistente, volvemos a comportamiento normal
    this.viewClearedSig.set(false);

    await this.reload(true);
    this.startPolling();
  }

  /**
   * ✅ Envía pregunta a la IA
   * IMPORTANTE:
   * - Si viewCleared=true, NO reponemos historial.
   * - Solo agregamos el mensaje retornado por POST (lo que el backend retorne como ChatMessage).
   * - La respuesta del asistente puede llegar por polling (GET),
   *   pero si viewCleared=true, el polling NO traerá nada hasta que recargues manualmente.
   */
  async ask(text: string): Promise<void> {
    const assistantId = this.assistantIdSig();
    const clean = text.trim();
    if (!assistantId || !clean) return;

    this.sendingSig.set(true);
    try {
      const created = await this.chatRepo.sendText(assistantId, clean);

      // ✅ CLAVE: NO cambiamos viewClearedSig aquí.
      // Si el usuario limpió, se mantiene limpio, y solo aparecen mensajes nuevos.
      this.messagesSig.set([...this.messagesSig(), created]);
    } finally {
      this.sendingSig.set(false);
    }
  }

  /**
   * ✅ Recarga historial desde backend
   * @param force
   * - false: respeta viewCleared (polling NO repone)
   * - true : fuerza recarga y desactiva viewCleared (restaura historial completo)
   */
  async reload(force = false): Promise<void> {
    const assistantId = this.assistantIdSig();
    if (!assistantId) return;

    // ✅ si está limpio, no repoblar automáticamente
    if (!force && this.viewClearedSig()) return;

    this.loadingSig.set(true);
    try {
      const res = await this.chatRepo.getHistory(assistantId, 200);

      this.conversationIdSig.set(res.conversationId ?? null);

      // ✅ Deja el orden como tu UI lo necesite.
      // Si tu backend ya viene en orden cronológico, elimina el reverse.
      const ordered = [...res.messages].reverse();

      this.messagesSig.set(ordered);

      if (force) this.viewClearedSig.set(false);
    } finally {
      this.loadingSig.set(false);
    }
  }

  /**
   * ✅ Limpia SOLO la pantalla (UI)
   * - No borra backend
   * - Bloquea repoblación automática
   */
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
}
