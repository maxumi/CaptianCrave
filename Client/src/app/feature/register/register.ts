import { Component, inject, signal } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/auth/auth.service';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-register',
  imports: [TranslocoModule, RouterLink, FormField,  FormRoot],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  authService = inject(AuthService);

  registerModel = signal<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
registerForm = form(
  this.registerModel,
  (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });

    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email, { message: 'Enter a valid email' });

    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 8, {
      message: 'Password must be at least 8 characters',
    });

    required(schemaPath.confirmPassword, {
      message: 'Please confirm your password',
    });

    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(schemaPath.password)) {
        return {
          kind: 'passwordMismatch',
          message: 'Passwords do not match',
        };
      }

      return null;
    });
  },
  {
    submission: {
      action: async (field) => {
        const value = field().value();

        this.authService.register({
          name: value.name,
          email: value.email,
          password: value.password,
        });
      },
    },
  },
);

  register() {
    this.authService.register({
      name: this.registerForm.name().value(),
      email: this.registerForm.email().value(),
      password: this.registerForm.password().value(),
    });
  }
}
