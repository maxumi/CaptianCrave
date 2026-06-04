export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId: number | null;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
}

export type MenuEditMode = 'create' | 'edit';