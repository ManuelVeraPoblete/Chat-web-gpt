import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Shell simple para páginas (toolbar + contenido).
 */
@Component({
  standalone: true,
  selector: 'cc-page-shell',
  imports: [NgIf, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="title">{{ title }}</span>

      <span class="spacer"></span>

      <button *ngIf="showLogout" mat-icon-button (click)="onLogout?.()">
        <mat-icon>logout</mat-icon>
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
  @Input() onLogout?: () => void;
}
