import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialog } from './delete-dialog/delete-dialog';
import { SaveDialog } from './save-dialog/save-dialog';

interface MenuItem {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
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
export class EditMenu {
  selectedItem = signal<MenuItem | null>(null);
  readonly dialog = inject(MatDialog);

  menuModel = signal<MenuItem>({
    id: 0,
    name: '',
    imageUrl: '',
    category: '',
    price: 0,
    currency: 'dkk',
    inStock: true,
  });

  menuForm = form(this.menuModel);

  readonly menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Palace Burger Menu',
      imageUrl: 'burger-king.png',
      category: 'Main Course',
      price: 159,
      currency: 'dkk',
      inStock: true,
    },
    {
      id: 2,
      name: 'Pizza Menu',
      imageUrl: 'burger-king.png',
      category: 'Main Course',
      price: 129,
      currency: 'dkk',
      inStock: true,
    },
    {
      id: 3,
      name: 'Fries',
      imageUrl: 'burger-king.png',
      category: 'Side',
      price: 39,
      currency: 'dkk',
      inStock: false,
    },
  ];

  selectItem(item: MenuItem): void {
    this.selectedItem.set(item);
    this.menuModel.set(structuredClone(item));
  }

  saveItem(): void {
    const updatedItem = this.menuModel();
    const index = this.menuItems.findIndex(item => item.id === updatedItem.id);

    if (index !== -1) {
      this.menuItems[index] = structuredClone(updatedItem);
      this.selectedItem.set(this.menuItems[index]);
    }
  }
  openDialog(dialog: string): void {
    if (dialog === 'delete') {
      this.dialog.open(DeleteDialog, {
        width: '250px',
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '150ms',
      });
    }
    else if (dialog === "save"){
      this.dialog.open(SaveDialog, {
        width: '250px',
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '150ms',
      });
    }
  }
}