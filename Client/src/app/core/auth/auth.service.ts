import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/models/user';
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


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiUrl + '/auth';
  user = signal<User | null>(null);

  login(data: LoginRequest){
    console.log('Login request:', data);
  }

  register(data: RegisterRequest): void {
    console.log('Register request:', data);
  }
}
