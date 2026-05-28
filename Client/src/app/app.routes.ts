import { Routes } from '@angular/router';
import { TestComponent } from './feature/test/test';
import { Login } from './feature/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'login', component: Login }
];