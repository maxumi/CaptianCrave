import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';
import {
  form,
  required,
  email,
  minLength,
  validate,
  submit,
  FormField,
  FormRoot,
} from '@angular/forms/signals';
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
      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Enter a valid email address' });

      required(schemaPath.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async (field) => {
          await this.authService.login({
            email: field().value().email,
            password: field().value().password,
          });
        },
      },
    },
  );

  login(): void {
    if (this.loginForm().invalid()) {
      this.loginForm().markAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.loginError.set(null);

    this.authService.login(this.loginModel()).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.loginError.set('Invalid email or password');
        this.isSubmitting.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      },
    });
  }
}