

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { AiAssistantFacade } from '../../../application/ai-assistant.facade';
import type { ChatMessage } from '../../../domain/models/chat-message.model';

/**
 * ✅ AiAssistantPanelComponent (PRO)
 * - Menú (⋮): limpiar pantalla / recargar historial
 * - Chip "Vista limpia"
 * - Burbujas: usuario derecha/verde, IA izquierda/claro
 *
 * Importante:
 * - Angular template NO soporta (m as any).prop
 * - Usamos helpers getText/getCreatedAt para render seguro
 */
@Component({
  standalone: true,
  selector: 'cc-ai-assistant-panel',
  imports: [
    NgIf,
    NgFor,
    DatePipe,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './ai-assistant-panel.component.html',
  styleUrl: './ai-assistant-panel.component.scss',
})
export class AiAssistantPanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly ai = inject(AiAssistantFacade);
  private readonly snack = inject(MatSnackBar);

  @Input() assistantUserId: string = '';

  readonly draft = signal<string>('');

  @ViewChild('messagesBox') private messagesBox?: ElementRef<HTMLDivElement>;
  @ViewChild('assistantInput') private assistantInput?: ElementRef<HTMLInputElement>;

  readonly vm = this.ai;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['assistantUserId']) {
      await this.ai.init(this.assistantUserId);
      this.scrollToBottom();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.ai.stopPolling();
  }

  async send(): Promise<void> {
    const text = this.draft().trim();
    if (!text) return;

    await this.ai.ask(text);
    this.draft.set('');
    this.scrollToBottom();
    this.focusInput();
  }

  clearAiView(): void {
    if (!this.assistantUserId) return;

    this.ai.clearView();
    this.snack.open('Pantalla del asistente limpiada (no se eliminó el historial).', 'OK', {
      duration: 2500,
    });
  }

  async reloadAiHistory(): Promise<void> {
    await this.ai.reload(true);
    this.scrollToBottom();
    this.snack.open('Historial del asistente recargado.', 'OK', { duration: 1800 });
  }

  /**
   * ✅ Determina si el mensaje es del usuario (derecha/verde)
   */
  isUserMessage(m: ChatMessage): boolean {
    const anyMsg = m as unknown as Record<string, unknown>;

    const role = typeof anyMsg['role'] === 'string' ? (anyMsg['role'] as string) : '';
    if (role.toLowerCase() === 'user') return true;
    if (role.toLowerCase() === 'assistant') return false;

    const senderRole =
      typeof anyMsg['senderRole'] === 'string' ? (anyMsg['senderRole'] as string) : '';
    if (senderRole.toLowerCase() === 'user') return true;
    if (senderRole.toLowerCase() === 'assistant') return false;

    const senderId =
      (typeof anyMsg['senderId'] === 'string' && (anyMsg['senderId'] as string)) ||
      (typeof anyMsg['authorId'] === 'string' && (anyMsg['authorId'] as string)) ||
      (typeof anyMsg['fromUserId'] === 'string' && (anyMsg['fromUserId'] as string)) ||
      '';

    if (this.assistantUserId && senderId) {
      // si el autor NO es el asistente => es el usuario
      return senderId !== this.assistantUserId;
    }

    return false;
  }

  /**
   * ✅ Texto del mensaje (tolerante a variaciones del backend)
   */
  getText(m: ChatMessage): string {
    const anyMsg = m as unknown as Record<string, unknown>;

    const text = anyMsg['text'];
    if (typeof text === 'string') return text;

    const content = anyMsg['content'];
    if (typeof content === 'string') return content;

    const message = anyMsg['message'];
    if (typeof message === 'string') return message;

    return '';
  }

  /**
   * ✅ Fecha del mensaje (compatible con DatePipe)
   */
  getCreatedAt(m: ChatMessage): Date | string | null {
    const anyMsg = m as unknown as Record<string, unknown>;

    const createdAt = anyMsg['createdAt'];
    if (createdAt instanceof Date) return createdAt;
    if (typeof createdAt === 'string') return createdAt;

    const createdAtAlt = anyMsg['created_at'] ?? anyMsg['timestamp'];
    if (createdAtAlt instanceof Date) return createdAtAlt;
    if (typeof createdAtAlt === 'string') return createdAtAlt;

    return null;
  }

  /**
   * ✅ Public porque el shell puede invocarlo (ViewChild)
   */
  focusInput(): void {
    window.setTimeout(() => this.assistantInput?.nativeElement?.focus(), 50);
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      const el = this.messagesBox?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 80);
  }
}
