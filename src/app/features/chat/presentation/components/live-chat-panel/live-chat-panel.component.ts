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

import { LiveChatFacade } from '../../../application/live-chat.facade';

/**
 *LiveChatPanelComponent (PRO)
 * - Columna central
 * -Expone focusInput() para UX pro (enfoque al seleccionar usuario)
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
  ],
  templateUrl: './live-chat-panel.component.html',
  styleUrl: './live-chat-panel.component.scss',
})
export class LiveChatPanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly chat = inject(LiveChatFacade);

  @Input() peerId: string = '';
  @Input() peerName: string = 'Usuario';

  draft = signal('');

  @ViewChild('messagesBox') messagesBox?: ElementRef<HTMLDivElement>;

  /**
   *Ref del input del chat (para focus desde shell)
   */
  @ViewChild('chatInput') chatInput?: ElementRef<HTMLInputElement>;

  vm = this.chat;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['peerId']) {
      await this.chat.openConversation(this.peerId);
      this.scrollToBottom();

      //si ya hay peer seleccionado, enfocamos el input
      if (this.peerId) this.focusInput();
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.chat.stopPolling();
  }

  /**
   *Método público (pro)
   */
  focusInput(): void {
    window.setTimeout(() => this.chatInput?.nativeElement?.focus(), 50);
  }

  async send(): Promise<void> {
    const text = this.draft();
    await this.chat.send(text);
    this.draft.set('');
    this.scrollToBottom();
    this.focusInput();
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      const el = this.messagesBox?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 80);
  }
}
