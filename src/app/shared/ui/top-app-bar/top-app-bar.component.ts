import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * ✅ TopAppBarComponent
 * Barra superior corporativa:
 * - Izquierda: Logo + nombre app
 * - Derecha: íconos (notificaciones, mensajes, perfil) + logout opcional
 */
@Component({
  standalone: true,
  selector: 'cc-top-app-bar',
  imports: [NgIf, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './top-app-bar.component.html',
  styleUrl: './top-app-bar.component.scss',
})
export class TopAppBarComponent {
  /**
   * Nombre de la aplicación (branding)
   */
  @Input() appName = 'CorpChat';

  /**
   * (Opcional) Mostrar/ocultar iconos de la derecha
   */
  @Input() showRightIcons = true;

  /**
   * ✅ Mostrar/ocultar botón de logout
   */
  @Input() showLogout = false;

  /**
   * ✅ Evento cuando el usuario presiona logout
   */
  @Output() logoutClicked = new EventEmitter<void>();

  /**
   * Emite el evento de logout hacia el contenedor (ej: ChatShellPage)
   */
  onLogoutClick(): void {
    this.logoutClicked.emit();
  }
}
