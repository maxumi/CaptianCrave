import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { RestaurantApiService, RestaurantDto } from '../../shared/restaurant-api.service';

@Component({
  selector: 'app-restaurants',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './restaurants.html',
  styleUrl: './restaurants.css',
})
export class Restaurants implements OnInit {
  private readonly restaurantApiService = inject(RestaurantApiService);

  readonly restaurants = signal<RestaurantDto[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    this.restaurantApiService.getRestaurants().subscribe({
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
