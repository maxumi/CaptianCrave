import { AfterViewInit, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import {
  LocationResult,
  LocationService,
  Restaurant,
} from '../../shared/LocationService';

/**
 * WIP: This component is still under development and may contain incomplete features or placeholder code.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements AfterViewInit {
  name = signal('Max');
  address = signal('Copenhagen, Denmark');
  addressInput = signal(this.address());

  private map!: L.Map;
  private marker!: L.Marker;
  private restaurantMarkers: L.Marker[] = [];

  private readonly defaultLocation: LocationResult;

  constructor(private locationService: LocationService) {
    this.defaultLocation = this.locationService.defaultLocation;
  }

  ngAfterViewInit(): void {
    const location: L.LatLngExpression = [
      this.defaultLocation.lat,
      this.defaultLocation.lng,
    ];

    this.map = L.map('profile-map').setView(location, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker(location)
      .addTo(this.map)
      .bindPopup(`Default location: ${this.defaultLocation.label}`);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  saveAddress(): void {
    const trimmedAddress = this.addressInput().trim();

    if (!trimmedAddress) {
      return;
    }

    this.locationService.geocodeAddress(trimmedAddress).subscribe({
      next: (location) => {
        if (!location) {
          console.error('No address found.');
          return;
        }

        this.address.set(trimmedAddress);
        this.addressInput.set(trimmedAddress);

        this.updateLocation(location, location.label);
      },
      error: (error) => {
        console.error('Error saving address:', error);
      },
    });
  }

  private updateLocation(
    location: LocationResult,
    popupText: string
  ): void {
    const latLng: L.LatLngExpression = [location.lat, location.lng];

    this.marker.setLatLng(latLng);
    this.marker.bindPopup(popupText).openPopup();

    this.map.setView(latLng, 15);

    this.loadRestaurants(location.lat, location.lng);
  }

private loadRestaurants(lat: number, lng: number): void {
  this.clearRestaurantMarkers();

  this.locationService.getNearbyRestaurants(lat, lng).subscribe({
    next: (restaurants) => {
      restaurants.forEach((restaurant) => {
        const restaurantPopupText = this.getRestaurantPopupText(restaurant);

        const restaurantMarker = L.marker([restaurant.lat, restaurant.lng])
          .addTo(this.map)
          .bindPopup(restaurantPopupText);

        this.restaurantMarkers.push(restaurantMarker);
      });
    },
    error: (error) => {
      console.error('Error loading restaurants:', error);
    },
  });
}

  private getRestaurantPopupText(restaurant: Restaurant): string {
    return restaurant.cuisine
      ? `<strong>${restaurant.name}</strong><br>${restaurant.cuisine}`
      : `<strong>${restaurant.name}</strong>`;
  }

  private clearRestaurantMarkers(): void {
    this.restaurantMarkers.forEach((marker) => {
      marker.remove();
    });

    this.restaurantMarkers = [];
  }
}