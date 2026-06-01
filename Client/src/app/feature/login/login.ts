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
  action: async () => {
    this.loginError.set(null);

    try {
      // Convert the login Observable to a Promise so we can await it.
      await firstValueFrom(
        this.authService.login(this.loginModel()),
      );

      await this.router.navigate(['/']);
      
       // No submission error.
      return null;
    } catch {
      this.loginError.set('Invalid email or password');

      return {
        kind: 'serverError' as const,
        message: 'Invalid email or password',
      };
    }
  },
},
  },
);
}