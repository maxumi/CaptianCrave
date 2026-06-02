import { Routes } from '@angular/router';
import { TestComponent } from './feature/test/test';
import { Home } from './feature/home/home';
import { Login } from './feature/login/login';
import { Register } from './feature/register/register';
import { Restaurants } from './feature/restaurants/restaurants';
import { RestaurantInfo } from './feature/restaurant-info/restaurant-info';
import { authGuard, guestGuard } from './core/auth/auth-guard';
import { Profile } from './feature/profile/profile';
import { Cart } from './feature/cart/cart';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'test', component: TestComponent },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'cart', component: Cart, canActivate: [authGuard]  },
  { path: 'restaurants', component: Restaurants, canActivate: [authGuard]  },
  { path: 'restaurantInfo', component: RestaurantInfo, canActivate: [authGuard]  }

  
];