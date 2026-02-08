import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthFacade } from '../../application/auth.facade';

/**
 * LoginPage (standalone)
 */
@Component({
  standalone: true,
  selector: 'cc-login-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigateByUrl('/home');
    } catch (e: any) {
      this.snack.open(e?.message ?? 'No fue posible iniciar sesión', 'Cerrar', { duration: 3500 });
    } finally {
      this.loading.set(false);
    }
  }
}
