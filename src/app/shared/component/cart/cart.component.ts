import { Component } from "@angular/core";
import { ShoppingCartService } from '../../services/shopping-cart.service';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html'
})

export class CartComponent {
    quantity$ = this.shoppingCartSvs.quantityAction$;
    total$ = this.shoppingCartSvs.totalAction$;

    constructor(private shoppingCartSvs: ShoppingCartService) { }

}