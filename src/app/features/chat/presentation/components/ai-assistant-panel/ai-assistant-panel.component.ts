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

import { AiAssistantFacade } from '../../../application/ai-assistant.facade';

/**
 *AiAssistantPanelComponent (PRO)
 * - Columna derecha (asistente)
 * - Carga historial y permite enviar preguntas
 * - Scroll interno (no rompe altura)
 * -Expone focusInput() para UX pro (enfoque automático al cambiar tab)
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
  ],
  templateUrl: './ai-assistant-panel.component.html',
  styleUrl: './ai-assistant-panel.component.scss',
})
export class AiAssistantPanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly ai = inject(AiAssistantFacade);

  @Input() assistantUserId: string = '';

  draft = signal('');

  @ViewChild('messagesBox') messagesBox?: ElementRef<HTMLDivElement>;

  /**
   *Ref al input para poder enfocar desde el shell
   */
  @ViewChild('assistantInput') assistantInput?: ElementRef<HTMLInputElement>;

  vm = this.ai;

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

  /**
   *Método público (pro)
   * - Permite que el contenedor enfoque el input al cambiar tab.
   */
  focusInput(): void {
    window.setTimeout(() => this.assistantInput?.nativeElement?.focus(), 50);
  }

  async send(): Promise<void> {
    const text = this.draft();
    await this.ai.ask(text);
    this.draft.set('');
    this.scrollToBottom();
    this.focusInput(); //mantiene ritmo de escritura
  }

  private scrollToBottom(): void {
    window.setTimeout(() => {
      const el = this.messagesBox?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 80);
  }
}
