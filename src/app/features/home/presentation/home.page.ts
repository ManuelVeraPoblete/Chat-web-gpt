import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { HomeFacade } from '../application/home.facade';
import { AuthFacade } from '../../auth/application/auth.facade';
import { PageShellComponent } from '../../../shared/ui/page-shell/page-shell.component';
import { SocketIoService } from '../../../core/realtime/socket-io.service';

import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'cc-home-page',
  imports: [
    RouterModule,
    NgIf,
    NgFor,
    PageShellComponent,
    MatListModule,
    MatBadgeModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
  private readonly facade = inject(HomeFacade);
  private readonly auth = inject(AuthFacade);
  private readonly socket = inject(SocketIoService);
  private readonly router = inject(Router);

  readonly vm = this.facade;

  async ngOnInit(): Promise<void> {
    await this.facade.load();
  }

  /**
   * ✅ Logout manual:
   * - Marca desconexión (workday/end) + revoca refresh token (auth/logout)
   * - Limpia estado del Front
   * - Cierra Socket.IO
   * - Vuelve a /login (listo para iniciar una nueva sesión)
   */
  async logout(): Promise<void> {
    await this.auth.logoutFull();

    //  Importante: socket mantiene conexión viva; lo cerramos explícitamente.
    this.socket.disconnect();

    await this.router.navigateByUrl('/login');
  }

  openChat(userId: string): void {
    this.router.navigate(['/chat', userId]);
  }
}
