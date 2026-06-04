import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs';
import { MenuItem, MenuEditMode } from './edit-menu.models';
import {
  MenuApiService,
  MenuItemDto,
  UpdateMenuItemRequest,
} from './menu-api.service';

@Injectable()
export class MenuEditStore {
  private readonly menuApiService = inject(MenuApiService);

  readonly mode = signal<MenuEditMode>('edit');
  readonly isSubmitting = signal(false);
  readonly isLoading = signal(true);
  readonly hasNoRestaurant = signal(false);
  readonly errorMessage = signal('');

  readonly menuItems = signal<MenuItem[]>([]);
  readonly selectedItem = signal<MenuItem | null>(null);

  readonly restaurantId = signal<number | null>(null);

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // First get the restaurant of the current user
    // then load the menu items for that restaurant in switchmap and subscribe.

    this.menuApiService.getMyRestaurant().pipe(
      switchMap(restaurant => {
        this.restaurantId.set(restaurant.id);
        this.hasNoRestaurant.set(false);

        return this.menuApiService.getMenuItemsByRestaurant(restaurant.id);
      }),

      catchError((error: { status?: number }) => {
        if (error.status === 404) {
          this.hasNoRestaurant.set(true);
          this.menuItems.set([]);
        } else {
          this.errorMessage.set('Failed to load menu items. Please try again.');
        }

        return EMPTY;
      }),

      finalize(() => {
        this.isLoading.set(false);
      }),
    ).subscribe((items: MenuItemDto[]) => {
      this.menuItems.set(items.map(item => this.fromDto(item)));
    });
  }

  selectItem(item: MenuItem): MenuItem {
    this.selectedItem.set(item);
    this.mode.set('edit');
    this.errorMessage.set('');

    return structuredClone(item);
  }

  startCreateItem(): MenuItem | null {
    const restaurantId = this.restaurantId();

    if (restaurantId == null) {
      return null;
    }

    this.errorMessage.set('');
    this.selectedItem.set(null);
    this.mode.set('create');

    return this.createDraftItem({
      restaurantId,
      categoryId: null,
    });
  }

  saveItem(item: MenuItem): Observable<MenuItem> {
    const restaurantId = this.restaurantId();

    if (restaurantId == null) {
      return throwError(() => new Error(this.errorMessage()));
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const isCreateMode = this.mode() === 'create' || item.id === 0;
    const payload = this.toPayload(item, restaurantId);

    const request = isCreateMode
      ? this.menuApiService.create(payload)
      : this.menuApiService.update(item.id, payload);

    return request.pipe(
      map(saved => this.applySavedItem(saved, isCreateMode)),

      catchError(error => {
        this.errorMessage.set('Could not save this menu item.');
        return throwError(() => error);
      }),

      finalize(() => {
        this.isSubmitting.set(false);
      }),
    );
  }

  deleteSelected(): Observable<boolean> {
    const selected = this.selectedItem();

    if (!selected) {
      return of(false);
    }

    this.errorMessage.set('');

    return this.menuApiService.delete(selected.id).pipe(
      map(() => {
        this.menuItems.set(
          this.menuItems().filter(item => item.id !== selected.id)
        );

        this.selectedItem.set(null);
        this.mode.set('edit');

        return true;
      }),

      catchError(() => {
        this.errorMessage.set('Could not delete this menu item.');
        return of(false);
      }),
    );
  }

  createDraftItem(overrides: Partial<MenuItem> = {}): MenuItem {
    return {
      id: 0,
      restaurantId: this.restaurantId() ?? 0,
      categoryId: null,
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      inStock: true,
      ...overrides,
    };
  }

  private toPayload(
    item: MenuItem,
    restaurantId: number
  ): UpdateMenuItemRequest {
    return {
      restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.inStock,
    };
  }

  private applySavedItem(
    saved: MenuItemDto,
    isCreateMode: boolean
  ): MenuItem {
    const nextSaved = this.fromDto(saved);

    const next = isCreateMode
      ? [nextSaved, ...this.menuItems()]
      : this.menuItems().map(item =>
          item.id === saved.id ? nextSaved : item
        );

    this.menuItems.set(next);
    this.selectedItem.set(nextSaved);
    this.mode.set('edit');

    return structuredClone(nextSaved);
  }

  private fromDto(item: MenuItemDto): MenuItem {
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      inStock: item.isAvailable,
    };
  }
}