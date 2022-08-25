import { Component, OnInit } from '@angular/core';
import { delay, switchMap, tap } from 'rxjs';
import { DataService } from 'src/app/shared/services/data.services';
import { Store } from 'src/app/shared/interfaces/store.interface';
import { NgForm } from '@angular/forms';
import { Details, DetailsOrder, Order } from 'src/app/shared/interfaces/order.interface';
import { Product } from '../products/interfaces/product.interface';
import { ShoppingCartService } from 'src/app/shared/services/shopping-cart.service';
import { Router } from '@angular/router';
import { ProductsService } from '../products/services/products.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  model = {
    name: '',
    store: '',
    shippingAddress: '',
    city: ''
  }
  isDelivery: boolean = true;
  cart: Product[] = [];
  stores: Store[] = [];

  constructor(
    private dataSvs: DataService,
    private shoppingCartSvs: ShoppingCartService,
    private productsSvs: ProductsService,
    private router: Router
  ) {
    this.checkIfCartIsEmpty();
  }

  ngOnInit(): void {
    this.getStores();
    this.getDataCart();
  }

  onPickupOrDelivery(value: boolean): void {
    this.isDelivery = value;
  }

  onSubmit({ value: formData }: NgForm): void {
    console.log('Saved∆', formData);
    const data: Order = {
      ...formData,
      date: this.getCurrentDate(),
      isDelivery: this.isDelivery
    }
    this.dataSvs.saveOrder(data)
      .pipe(
        tap(res => console.log('Order ->', res)),
        switchMap(({ id: orderNumber }) => {
          const details = this.prepareDetails();
          return this.dataSvs.saveDetailsOrder({ details, orderNumber });
        }),
        tap(() => this.router.navigate(['/checkout/thank-you-page'])),
        delay(2000),
        tap(() => this.shoppingCartSvs.resetShoppingCart())
      )
      .subscribe();
  }

  // TODO: como suscribirse a un observable y como funcionan
  private getStores(): void {
    this.dataSvs.getStores()
      .pipe(tap((res: Store[]) => this.stores = res))
      .subscribe();
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  private prepareDetails(): Details[] {
    const details: Details[] = [];
    this.cart.forEach((product: Product) => {
      const { id: productId, name: productName, quantity, stock } = product;
      const updateStock = (stock - quantity);
      this.productsSvs.updateStock(productId, updateStock)
        .pipe(
          tap(() => details.push({ productId, productName, quantity }))
        )
        .subscribe();
      details.push({ productId, productName, quantity });
    })
    return details;
  }

  private getDataCart(): void {
    this.shoppingCartSvs.cartAction$
      .pipe(
        tap((products: Product[]) => this.cart = products))
      .subscribe()
  }

  private checkIfCartIsEmpty(): void {
    this.shoppingCartSvs.cartAction$
      .pipe(
        tap((products: Product[]) => {
          if (Array.isArray(products) && !products.length) {
            this.router.navigate(['/products']);
          }
        })
      ).subscribe();
  }
}
