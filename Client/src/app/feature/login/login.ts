import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import { getAuthErrorMessage } from '../../shared/getAuthErrorMessage';
import {
  form,
  required,
  email,
  FormField,
  FormRoot,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
interface LoginFormData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [TranslocoModule, RouterLink, FormField, FormRoot],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  authService = inject(AuthService);
  private readonly translocoService = inject(TranslocoService);
  readonly isSubmitting = signal(false);
  readonly loginError = signal<string | null>(null);
  private readonly router = inject(Router);

  loginModel = signal<LoginFormData>({
    email: '',
    password: '',
  });
loginForm = form(
  this.loginModel,
  (schemaPath) => {
    required(schemaPath.email, {
      message: this.translocoService.translate('login.validation.emailRequired'),
    });
    email(schemaPath.email, {
      message: this.translocoService.translate('login.validation.emailInvalid'),
    });

    required(schemaPath.password, {
      message: this.translocoService.translate('login.validation.passwordRequired'),
    });
  },
  {
    submission: {
      action: async () => {
        this.loginError.set(null);
        this.isSubmitting.set(true);

        try {
          await firstValueFrom(
            this.authService.login({
              email: this.loginForm.email().value(),
              password: this.loginForm.password().value(),
            }),
          );

          await this.router.navigate(['/']);

          return null;
        } catch (error) {
          const message = getAuthErrorMessage(
            error,
            this.translocoService.translate('login.error.signInFailed'),
          );

          this.loginError.set(message);

          return {
            kind: 'serverError' as const,
            message,
          };
        } finally {
          this.isSubmitting.set(false);
        }
      },
    },
  },
);
}