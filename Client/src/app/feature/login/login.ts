import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  login(){
    this.authService.login({
      email: this.loginForm.email().value(),
      password: this.loginForm.password().value(),
    });
  }
}
