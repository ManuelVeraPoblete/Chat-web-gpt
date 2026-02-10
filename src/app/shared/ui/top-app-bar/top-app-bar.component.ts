import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * ✅ TopAppBarComponent
 * Barra superior corporativa:
 * - Izquierda: Logo + nombre app
 * - Centro: botones de estado (solo UI, sin lógica)
 * - Derecha: íconos (notificaciones, mensajes, perfil)
 *
 * Nota:
 * - No implementa funcionalidades, solo UI.
 * - Está listo para conectar eventos después (outputs).
 */
@Component({
  standalone: true,
  selector: 'cc-top-app-bar',
  imports: [NgIf, MatToolbarModule, MatButtonModule, MatIconModule],
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
}
