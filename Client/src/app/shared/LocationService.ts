import { Injectable } from '@angular/core';

export interface LocationResult {
  lat: number;
  lng: number;
  label: string;
}

export interface Restaurant {
  id: number;
  lat: number;
  lng: number;
  name: string;
  cuisine?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    cuisine?: string;
    amenity?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  readonly defaultLocation: LocationResult = {
    lat: 55.6541,
    lng: 12.4166,
    label: 'Brøndby, Denmark',
  };

  getCurrentLocation(): Promise<LocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(this.defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: 'Your current location',
          });
        },
        () => {
          resolve(this.defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async geocodeAddress(address: string): Promise<LocationResult | null> {
    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      return null;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmedAddress
    )}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Could not find address.');
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      return null;
    }

    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
      label: results[0].display_name,
    };
  }

  /** Test method to fetch nearby restaurants using Overpass API */
  async getNearbyRestaurants(
    lat: number,
    lng: number,
    radius = 1000
  ): Promise<Restaurant[]> {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radius},${lat},${lng});
      );
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error('Could not fetch restaurants.');
    }

    const data: { elements: OverpassElement[] } = await response.json();

    return data.elements
      .filter((restaurant) => restaurant.lat && restaurant.lon)
      .map((restaurant) => ({
        id: restaurant.id,
        lat: restaurant.lat as number,
        lng: restaurant.lon as number,
        name: restaurant.tags?.name ?? 'Unnamed restaurant',
        cuisine: restaurant.tags?.cuisine,
      }));
  }
}