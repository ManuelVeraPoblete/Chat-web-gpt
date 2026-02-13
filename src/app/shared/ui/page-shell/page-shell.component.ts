import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Shell simple para páginas (toolbar + contenido).
 * Incluye opción de Logout (ícono en toolbar).
 */
@Component({
  standalone: true,
  selector: 'cc-page-shell',
  imports: [
    NgIf,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="title">{{ title }}</span>

      <span class="spacer"></span>

      <!-- ✅ Botón Logout con ícono + tooltip -->
      <button
        *ngIf="showLogout"
        mat-icon-button
        type="button"
        aria-label="Cerrar sesión"
        matTooltip="Cerrar sesión"
        (click)="onLogout?.()"
      >
        <!-- Ícono muy compatible en Material Icons -->
        <mat-icon>exit_to_app</mat-icon>
      </button>
    </mat-toolbar>

    <main class="content">
      <ng-content></ng-content>
    </main>
  `,
  styleUrl: './page-shell.component.scss',
})
export class PageShellComponent {
  @Input({ required: true }) title!: string;
  @Input() showLogout = false;

  /**
   * Callback ejecutado al presionar logout.
   * Se inyecta desde la página (ej: HomePage).
   */
  @Input() onLogout?: () => void;
}
