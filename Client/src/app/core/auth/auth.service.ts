import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, tap } from 'rxjs';
import { AuthState } from '../../shared/models/user';
import { environment } from '../../../environments/environment';


interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  userId: number;
  name: string;
}

interface RegisterResponse {
  message: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authStateKey = 'authState';
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/Auth`;

  readonly user = signal<AuthState | null>(this.readAuthState());

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.url}/login`, data).pipe(
      tap({
        next: (response) => {
          this.setAuthState({
            userId: response.userId,
            name: response.name,
          });
        },
      })
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.url}/register`, data);
  }

  logout(): void {
    this.setAuthState(null);
  }

  private readAuthState(): AuthState | null {
    const storedState = localStorage.getItem(this.authStateKey);

    if (!storedState) {
      return null;
    }

    try {
      return JSON.parse(storedState) as AuthState;
    } catch {
      localStorage.removeItem(this.authStateKey);
      return null;
    }
  }

  private setAuthState(authState: AuthState | null): void {
    if (authState) {
      localStorage.setItem(this.authStateKey, JSON.stringify(authState));
    } else {
      localStorage.removeItem(this.authStateKey);
    }

    this.user.set(authState);
  }
}