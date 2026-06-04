import { Component, OnInit, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, MonoTypeOperatorFunction, firstValueFrom } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { DeleteDialog } from './delete-dialog/delete-dialog';
import { SaveDialog } from './save-dialog/save-dialog';
import { MenuApiService, MenuItemDto, UpdateMenuItemRequest } from './menu-api.service';

interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId: number | null;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  inStock: boolean;
}

@Component({
  selector: 'app-edit-menu',
  imports: [FormField, FormRoot],
  templateUrl: './edit-menu.html',
  styleUrl: './edit-menu.css',
})
export class EditMenu implements OnInit {
  // Dialog Config to be reused for both Save and Delete confirmation dialog components
  private static readonly DIALOG_CONFIG = {
    width: '250px',
    enterAnimationDuration: '200ms',
    exitAnimationDuration: '150ms',
  };
  readonly dialog = inject(MatDialog);
  private readonly menuApiService = inject(MenuApiService);


  readonly isCreatingNew = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(true);
  readonly hasNoRestaurant = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly menuItems = signal<MenuItem[]>([]);
  private restaurantId: number | null = null;

  menuModel = signal<MenuItem>(this.createDraftItem());
  menuForm = form(
    this.menuModel,
    () => {},
    {
      submission: {
        action: async () => {
          this.errorMessage.set('');
          this.isSubmitting.set(true);

          try {
            const confirmed = await firstValueFrom(
              this.dialog.open(SaveDialog, EditMenu.DIALOG_CONFIG).afterClosed(),
            );

            if (!confirmed) {
              return null;
            }

            const updatedItem = this.menuModel();
            const isCreateMode = this.isCreatingNew() || updatedItem.id === 0;

            const restaurantId = this.requireRestaurantId();
            if (!restaurantId) {
              const message = 'Restaurant context is missing. Please refresh and try again.';
              return {
                kind: 'serverError' as const,
                message,
              };
            }

            const payload = this.toPayload(updatedItem, restaurantId);
            const saveRequest = isCreateMode
              ? this.menuApiService.create(payload)
              : this.menuApiService.update(updatedItem.id, payload);

            const saved = await firstValueFrom(saveRequest);
            this.applySavedItem(saved, isCreateMode);
            return null;
          } catch {
            const message = 'Could not save this menu item.';
            this.errorMessage.set(message);
            return {
              kind: 'serverError' as const,
              message,
            };
          } finally {
            this.isSubmitting.set(false);
          }
        },
      },
    },
  );

  selectedItem = signal<MenuItem | null>(null);


  ngOnInit(): void {
    this.loadMenuItems();
  }

private loadMenuItems(): void {
  this.isLoading.set(true);
  this.errorMessage.set('');

  this.menuApiService.getMyRestaurant().pipe(
    switchMap(restaurant => {
      this.restaurantId = restaurant.id;
      this.hasNoRestaurant.set(false);
      return this.menuApiService.getByRestaurant(restaurant.id);
    }),

    catchError((error: { status?: number }) => {
      if (error.status === 404) {
        this.hasNoRestaurant.set(true);
        this.menuItems.set([]);
      } else {
        this.errorMessage.set('Failed to load menu items. Please try again.');
      }
      // In case of error, return an empty observable.
      return EMPTY;
    }),

    finalize(() => {
      this.isLoading.set(false);
    }),
  ).subscribe((items: MenuItemDto[]) => {
    this.menuItems.set(items.map(item => this.fromDto(item)));
  });
}

  selectItem(item: MenuItem): void {
    this.selectedItem.set(item);
    this.menuModel.set(structuredClone(item));
  }

  deleteItem(): void {
    const selected = this.selectedItem();
    if (!selected) {
      return;
    }

    this.menuApiService.delete(selected.id).pipe(
      this.handleRequestError('Could not delete this menu item.'),
    ).subscribe(() => {
      const next = this.menuItems().filter(item => item.id !== selected.id);
      this.menuItems.set(next);
      this.selectedItem.set(null);
      this.isCreatingNew.set(false);
      this.menuModel.set(this.createDraftItem());
    });
  }

  startCreateItem(): void {
    const restaurantId = this.requireRestaurantId();
    if (!restaurantId) {
      return;
    }

    this.errorMessage.set('');
    this.selectedItem.set(null);
    this.isCreatingNew.set(true);

    this.menuModel.set(this.createDraftItem({
      restaurantId,
      categoryId: this.resolveCategoryId(null),
    }));
  }

  confirmDelete(): void {
    this.openConfirmationDialog(DeleteDialog, () => this.deleteItem());
  }

  private createDraftItem(overrides: Partial<MenuItem> = {}): MenuItem {
    return {
      id: 0,
      restaurantId: this.restaurantId ?? 0,
      categoryId: null,
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      currency: 'dkk',
      inStock: true,
      ...overrides,
    };
  }

  private requireRestaurantId(): number | null {
    if (!this.restaurantId) {
      this.errorMessage.set('Restaurant context is missing. Please refresh and try again.');
      return null;
    }

    return this.restaurantId;
  }

  private resolveCategoryId(currentCategoryId: number | null): number | null {
    return currentCategoryId
      ?? this.selectedItem()?.categoryId
      ?? this.menuItems()[0]?.categoryId
      ?? null;
  }

  private toPayload(item: MenuItem, restaurantId: number): UpdateMenuItemRequest {
    return {
      restaurantId,
      categoryId: this.resolveCategoryId(item.categoryId),
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: item.inStock,
    };
  }

  private handleRequestError<T>(message: string): MonoTypeOperatorFunction<T> {
    return catchError(() => {
      this.errorMessage.set(message);
      return EMPTY;
    });
  }

  private openConfirmationDialog(dialogComponent: typeof SaveDialog | typeof DeleteDialog, onConfirm: () => void): void {
    this.dialog.open(dialogComponent, EditMenu.DIALOG_CONFIG)
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          onConfirm();
        }
      });
  }

  private applySavedItem(saved: MenuItemDto, isCreateMode: boolean): void {
    const nextSaved = this.fromDto(saved);
    const next = isCreateMode
      ? [nextSaved, ...this.menuItems()]
      : this.menuItems().map(item => (item.id === saved.id ? nextSaved : item));

    this.menuItems.set(next);
    this.isCreatingNew.set(false);

    const nextSelected = next.find(item => item.id === saved.id) ?? null;
    this.selectedItem.set(nextSelected);
    if (nextSelected) {
      this.menuModel.set(structuredClone(nextSelected));
    }
  }

  // Utility method to convert MenuItemDto to MenuItem used in the component
  private fromDto(item: MenuItemDto): MenuItem {
    return {
      id: item.id,
      restaurantId: item.restaurantId,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      currency: 'dkk',
      inStock: item.isAvailable,
    };
  }
}