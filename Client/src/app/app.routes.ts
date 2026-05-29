import { Routes } from '@angular/router';
import { TestComponent } from './feature/test/test';
import { Login } from './feature/login/login';
import { Register } from './feature/register/register';
import { Restaurants } from './feature/restaurants/restaurants';
import { RestaurantInfo } from './feature/restaurant-info/restaurant-info';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'restaurants', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'login', component: Login },
  { path: "register", component: Register},
  { path: 'restaurants', component: Restaurants, canActivate: [authGuard]  },
  { path: 'restaurantInfo', component: RestaurantInfo, canActivate: [authGuard]  }

  
];