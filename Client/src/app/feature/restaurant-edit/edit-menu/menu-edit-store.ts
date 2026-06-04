import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { MenuItem, MenuEditMode, UpdateMenuItemRequest } from './edit-menu.models';
import {
  MenuApiService
} from './menu-api.service';

@Injectable()
export class MenuEditStore {
  private readonly menuApiService = inject(MenuApiService);
  private readonly translocoService = inject(TranslocoService);

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
    this.hasNoRestaurant.set(false);
    this.clearRestaurantState();

    this.menuApiService.getMyRestaurant().pipe(
      switchMap(restaurant => {
        this.restaurantId.set(restaurant.id);

        return this.menuApiService.getMenuItemsByRestaurant(restaurant.id);
      }),

      catchError((error: { status?: number }) => {
        if (error.status === 404) {
          this.hasNoRestaurant.set(true);
          this.clearRestaurantState();
        } else {
          this.errorMessage.set(this.t('error.loadFailed'));
        }
        // empty observable.
        return EMPTY;
      }),

      finalize(() => {
        this.isLoading.set(false);
      }),
    ).subscribe(items => {
      this.menuItems.set(items);
    });
  }

selectItem(item: MenuItem): MenuItem | null {
  const selected = this.selectedItem();

  // if the same item is selected again, deselect it and switch to edit mode.
  if (selected?.id === item.id) {
    this.selectedItem.set(null);
    this.mode.set('edit');
    this.errorMessage.set('');

    return null;
  }

  this.selectedItem.set(item);
  this.mode.set('edit');
  this.errorMessage.set('');

  return structuredClone(item);
}

  // A menu item can only be created when a restaurant has been loaded.
  startCreateItem(): MenuItem | null {
    const restaurantId = this.restaurantId();

    if (restaurantId == null) {
      this.errorMessage.set(this.t('error.missingRestaurant'));
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
      const message = this.t('error.missingRestaurant');
      this.errorMessage.set(message);
      return throwError(() => new Error(message));
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const isNewItem = this.mode() === 'create' || item.id === 0;
    // Convert the form item to the payload for API.
    const payload = this.toPayload(item, restaurantId);

    // Create or Update request
    const request = isNewItem
      ? this.menuApiService.create(payload)
      : this.menuApiService.update(item.id, payload);


    return request.pipe(
      map(saved => this.updateStateAfterSave(saved, isNewItem)),

      catchError(error => {
        this.errorMessage.set(this.t('error.saveFailed'));
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
        this.removeMenuItem(selected.id);
        this.selectedItem.set(null);
        this.mode.set('edit');

        return true;
      }),

      catchError(() => {
        this.errorMessage.set(this.t('error.deleteFailed'));
        return of(false);
      }),
    );
  }

  private t(key: string): string {
    return this.translocoService.translate(`menuEdit.${key}`);
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
      isAvailable: true,
      ...overrides,
    };
  }

  private updateStateAfterSave(
    savedItem: MenuItem,
    isNewItem: boolean
  ): MenuItem {
    if (isNewItem) {
      this.addMenuItem(savedItem);
    } else {
      this.updateMenuItem(savedItem);
    }

    this.selectedItem.set(savedItem);
    this.mode.set('edit');

    return structuredClone(savedItem);
  }

  private addMenuItem(item: MenuItem): void {
    this.menuItems.set([item, ...this.menuItems()]);
  }

  private updateMenuItem(item: MenuItem): void {
    this.menuItems.set(
      this.menuItems().map(existingItem =>
        existingItem.id === item.id ? item : existingItem
      )
    );
  }

  private removeMenuItem(itemId: number): void {
    this.menuItems.set(
      this.menuItems().filter(item => item.id !== itemId)
    );
  }

  private clearRestaurantState(): void {
    this.menuItems.set([]);
    this.selectedItem.set(null);
    this.restaurantId.set(null);
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
      isAvailable: item.isAvailable,
    };
  }
}