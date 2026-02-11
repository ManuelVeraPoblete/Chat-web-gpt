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
  computed,
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
import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../../domain/value-objects/work-status.vo';
import type { ChatMessage } from '../../../domain/models/chat-message.model';

/**
 * ✅ AiAssistantPanelComponent
 * ✅ NUEVO: Deshabilita envío cuando NO está ACTIVE
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
  private readonly shell = inject(ChatShellFacade);
  private readonly snack = inject(MatSnackBar);

  @Input() assistantUserId: string = '';

  readonly draft = signal<string>('');

  @ViewChild('messagesBox') private messagesBox?: ElementRef<HTMLDivElement>;
  @ViewChild('assistantInput') private assistantInput?: ElementRef<HTMLInputElement>;

  readonly vm = this.ai;

  /**
   * ✅ Envío habilitado SOLO si estado laboral es ACTIVE
   */
  readonly canSend = computed(() => {
    const st = this.shell.status();
    return st === WorkStatus.ACTIVE || String(st) === 'ACTIVE';
  });

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
    if (!this.canSend()) {
      this.snack.open('No puedes enviar mensajes al asistente en Pausa/Almuerzo/Desconectado.', 'OK', {
        duration: 2500,
      });
      return;
    }

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

  isUserMessage(m: ChatMessage): boolean {
    const anyMsg = m as unknown as Record<string, unknown>;

    const role = typeof anyMsg['role'] === 'string' ? (anyMsg['role'] as string) : '';
    if (role.toLowerCase() === 'user') return true;
    if (role.toLowerCase() === 'assistant') return false;

    const senderRole = typeof anyMsg['senderRole'] === 'string' ? (anyMsg['senderRole'] as string) : '';
    if (senderRole.toLowerCase() === 'user') return true;
    if (senderRole.toLowerCase() === 'assistant') return false;

    const senderId =
      (typeof anyMsg['senderId'] === 'string' && (anyMsg['senderId'] as string)) ||
      (typeof anyMsg['authorId'] === 'string' && (anyMsg['authorId'] as string)) ||
      (typeof anyMsg['fromUserId'] === 'string' && (anyMsg['fromUserId'] as string)) ||
      '';

    if (this.assistantUserId && senderId) {
      return senderId !== this.assistantUserId;
    }

    return false;
  }

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

  getCreatedAt(m: ChatMessage): Date | string | null {
    const anyMsg = m as unknown as Record<string, unknown>;

    const createdAt = anyMsg['createdAt'];
    if (createdAt instanceof Date) return createdAt;
    if (typeof createdAt === 'string') return createdAt;

    const createdAtAlt = (anyMsg['created_at'] as any) ?? (anyMsg['timestamp'] as any);
    if (createdAtAlt instanceof Date) return createdAtAlt;
    if (typeof createdAtAlt === 'string') return createdAtAlt;

    return null;
  }

  focusInput(): void {
    if (!this.canSend()) return;
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
