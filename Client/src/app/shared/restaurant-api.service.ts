import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateRestaurantRequest {
  userId: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface RestaurantDto {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantApiService {
  private readonly http = inject(HttpClient);
  private readonly restaurantsUrl = `${environment.apiUrl}/Restaurants`;

  createRestaurant(payload: CreateRestaurantRequest): Observable<RestaurantDto> {
    return this.http.post<RestaurantDto>(this.restaurantsUrl, payload);
  }

  getMyRestaurant(): Observable<RestaurantDto> {
    return this.http.get<RestaurantDto>(`${this.restaurantsUrl}/me`);
  }
}