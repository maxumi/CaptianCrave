import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { RestaurantApiService, RestaurantDto } from '../../shared/restaurant-api.service';
import { AuthService } from '../../core/auth/auth.service';

const MAX_DISTANCE_KM = 50;

@Component({
  selector: 'app-restaurants',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants implements OnInit {
  private readonly restaurantApiService = inject(RestaurantApiService);
  private readonly authService = inject(AuthService);

  readonly restaurants = signal<RestaurantDto[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.user();
    if (!user) {
      this.loadError.set('User not authenticated.');
      this.isLoading.set(false);
      return;
    }
    if (user.latitude == null || user.longitude == null) {
      this.loadError.set('User location not available. Please update your profile with a valid address.');
      this.isLoading.set(false);
      return;
    }
    else {
    this.restaurantApiService.getNearbyRestaurants(user.latitude, user?.longitude, MAX_DISTANCE_KM).subscribe({
      next: (restaurants) => {
        this.restaurants.set(restaurants);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Unable to load restaurants right now.');
        this.isLoading.set(false);
      },
    });
    }
  }

}
