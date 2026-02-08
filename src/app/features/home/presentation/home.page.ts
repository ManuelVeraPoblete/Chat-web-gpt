import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

import { HomeFacade } from '../application/home.facade';
import { AuthFacade } from '../../auth/application/auth.facade';
import { PageShellComponent } from '../../../shared/ui/page-shell/page-shell.component';

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
  private readonly router = inject(Router);

  readonly vm = this.facade;

  async ngOnInit(): Promise<void> {
    await this.facade.load();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  openChat(userId: string): void {
    this.router.navigate(['/chat', userId]);
  }
}
