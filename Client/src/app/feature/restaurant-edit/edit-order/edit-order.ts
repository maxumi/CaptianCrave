import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';

interface Order {
  id: number;
  code: string;
  customer: string;
  date: string;
  total: number;
  currency: string;
  status: 'Pending' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-edit-order',
  imports: [FormField, FormRoot],
  templateUrl: './edit-order.html',
  styleUrl: './edit-order.css',
})
export class EditOrder {
  selectedOrder = signal<Order | null>(null);

  orderModel = signal<Order>({
    id: 0,
    code: '',
    customer: '',
    date: '',
    total: 0,
    currency: 'dkk',
    status: 'Pending',
    items: [],
  });

  orderForm = form(this.orderModel);

  readonly orders: Order[] = [
    {
      id: 1,
      code: 'CCID524',
      customer: 'Max Felding',
      date: 'May 21, 2026 - 12:30 pm',
      total: 159,
      currency: 'dkk',
      status: 'On the way',
      items: [
        { name: 'Burger Menu', quantity: 1, price: 119 },
        { name: 'Fries', quantity: 1, price: 40 },
      ],
    },
    {
      id: 2,
      code: 'CCID525',
      customer: 'Anna Hansen',
      date: 'May 21, 2026 - 12:45 pm',
      total: 249,
      currency: 'dkk',
      status: 'Preparing',
      items: [
        { name: 'Pizza', quantity: 1, price: 149 },
        { name: 'Cola', quantity: 2, price: 50 },
      ],
    },
  ];

  selectOrder(order: Order): void {
    const copy = structuredClone(order);

    this.selectedOrder.set(order);
    this.orderModel.set(copy);
  }

  saveOrder(): void {
    const updatedOrder = this.orderModel();
    const index = this.orders.findIndex(order => order.id === updatedOrder.id);

    if (index !== -1) {
      this.orders[index] = structuredClone(updatedOrder);
      this.selectedOrder.set(this.orders[index]);
    }
  }
}