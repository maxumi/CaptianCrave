import { Routes } from '@angular/router';
import { TestComponent } from './feature/test/test';
import { Login } from './feature/login/login';
import { Register } from './feature/register/register';
import { Restaurants } from './feature/restaurants/restaurants';
import { RestaurantInfo } from './feature/restaurant-info/restaurant-info';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'test', component: TestComponent },
  { path: 'login', component: Login },
  { path: "register", component: Register},
  { path: 'restaurants', component: Restaurants },
  { path: 'restaurantInfo', component: RestaurantInfo }
];