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

import { LiveChatFacade } from '../../../application/live-chat.facade';
import { ChatShellFacade } from '../../../application/facades/chat-shell.facade';
import { WorkStatus } from '../../../domain/value-objects/work-status.vo';

/**
 * ✅ LiveChatPanelComponent (PRO)
 * - Header con acciones
 * - Menú 3 puntos: limpiar pantalla / recargar historial
 * - Chip "Vista limpia"
 * - ✅ NUEVO: Deshabilita envío cuando NO está ACTIVE (pausa/almuerzo/desconectado/no iniciado)
 */
@Component({
  standalone: true,
  selector: 'cc-live-chat-panel',
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
  templateUrl: './live-chat-panel.component.html',
  styleUrl: './live-chat-panel.component.scss',
})
export class LiveChatPanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly chat = inject(LiveChatFacade);
  private readonly shell = inject(ChatShellFacade);
  private readonly snack = inject(MatSnackBar);

  @Input() peerId: string = '';
  @Input() peerName: string = 'Usuario';

  draft = signal('');

  @ViewChild('messagesBox') messagesBox?: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>;

  vm = this.chat;

  /**
   * ✅ Envío habilitado SOLO si el estado laboral es ACTIVE.
   * Nota: se valida robusto (enum o string), para soportar PAUSED/LUNCH si existen.
   */
  readonly canSend = computed(() => {
    const st = this.shell.status();
    return st === WorkStatus.ACTIVE || String(st) === 'ACTIVE';
  });

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['peerId']) {
      await this.chat.openConversation(this.peerId);
      this.scrollToBottom();
      if (this.peerId) this.focusInput();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.chat.stopPolling();
  }

  focusInput(): void {
    // ✅ No enfocar si está deshabilitado para no dar UX rara
    if (!this.canSend()) return;
    window.setTimeout(() => this.chatInput?.nativeElement?.focus(), 50);
  }

  async send(): Promise<void> {
    // ✅ Guard adicional (aunque el botón esté disabled)
    if (!this.canSend()) {
      this.snack.open('No puedes enviar mensajes en Pausa/Almuerzo/Desconectado.', 'OK', { duration: 2500 });
      return;
    }

    const text = this.draft().trim();
    if (!text) return;

    await this.chat.send(text);
    this.draft.set('');
    this.scrollToBottom();
    this.focusInput();
  }

  clearChatView(): void {
    if (!this.peerId) return;

    this.chat.clearView();
    this.snack.open('Pantalla del chat limpiada (no se eliminó el historial).', 'OK', {
      duration: 2500,
    });
  }

  async reloadChat(): Promise<void> {
    await this.chat.reload(true);
    this.scrollToBottom();
    this.snack.open('Historial recargado.', 'OK', { duration: 1800 });
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      const el = this.messagesBox?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 80);
  }
}
