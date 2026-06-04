import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MenuItem, RestaurantDto, UpdateMenuItemRequest } from './edit-menu.models';


@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly restaurantsUrl = `${environment.apiUrl}/Restaurants`;
  private readonly menuItemsUrl = `${environment.apiUrl}/MenuItems`;

  getMyRestaurant(): Observable<RestaurantDto> {
    return this.http.get<RestaurantDto>(`${this.restaurantsUrl}/me`);
  }

  getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.menuItemsUrl}/restaurant/${restaurantId}`);
  }

  create(payload: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.menuItemsUrl, payload);
  }

  update(itemId: number, payload: UpdateMenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.menuItemsUrl}/${itemId}`, payload);
  }

  delete(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.menuItemsUrl}/${itemId}`);
  }
}