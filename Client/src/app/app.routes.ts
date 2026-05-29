import { Routes } from '@angular/router';
import { TestComponent } from './feature/test/test';
import { Login } from './feature/login/login';
import { Register } from './feature/register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'login', component: Login },
  { path: "register", component: Register}
];