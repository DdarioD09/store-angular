import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { ShoppingCartService } from 'src/app/shared/services/shopping-cart.service';
import { Product } from './interfaces/product.interface';
import { ProductsService } from './services/products.service';

@Component({
  selector: 'app-products',
  template: `
  <section class="products">
    <app-product 
      (addToCartClick)="addToCart($event)"
      [product]="product"
      *ngFor="let product of products"
    ></app-product>
  </section>
  `,
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products!: Product[];
  constructor(private productSvc: ProductsService, private shoppingCartSvs: ShoppingCartService) { }

  ngOnInit(): void {
    this.productSvc.getProducts()
      .pipe(
        tap((res: Product[]) => this.products = res)
      )
      .subscribe();
  }

  addToCart(product: Product): void {
    console.log('Add to cart ', product);
    this.shoppingCartSvs.updateCart(product)
  }

}
