import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import {
  faCartShopping
} from "@fortawesome/sharp-solid-svg-icons";
import {components} from "../../models/product-catalog";
import {LocalStorageService} from "../../services/local-storage.service";
import { ShoppingCartServiceService } from 'src/app/services/shopping-cart-service.service';
import {EventMessageService} from "../../services/event-message.service";
import { Drawer } from 'flowbite';
import { PriceServiceService } from 'src/app/services/price-service.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { cartProduct } from '../../models/interfaces';
import { TYPES } from 'src/app/models/types.const';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-cart-drawer',
    templateUrl: './cart-drawer.component.html',
    styleUrl: './cart-drawer.component.css',
    standalone: true,
    imports: [FaIconComponent, NgClass, TranslateModule]
})
export class CartDrawerComponent implements OnInit{
  protected readonly faCartShopping = faCartShopping;
  items: any[] = [];
  totalPrice:any;
  showBackDrop:boolean=true;
  check_custom:boolean=false;

  constructor(
    private localStorage: LocalStorageService,
    private eventMessage: EventMessageService,
    private priceService: PriceServiceService,
    private cartService: ShoppingCartServiceService,
    private api: ApiServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,) {

  }

  /*@HostListener('document:click')
  onClick() {
    document.querySelector("body > div[drawer-backdrop]")?.remove()
  }*/

  ngOnInit(): void {
    this.showBackDrop=true;
    this.cartService.getShoppingCart().then(data => {
      this.items=data;
      this.cdr.detectChanges();
      this.getTotalPrice();
    })
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'AddedCartItem') {
        this.cartService.getShoppingCart().then(data => {
          this.items=data;
          this.cdr.detectChanges();
          this.getTotalPrice();
        })
      } else if(ev.type === 'RemovedCartItem') {
        this.cartService.getShoppingCart().then(data => {
          this.items=data;
          this.cdr.detectChanges();
          this.getTotalPrice();
        })
      }
    })
  }

  getPrice(item: any) {
    if(item.options.pricing != undefined){
      if(item.options.pricing.priceType=='custom'){
        this.check_custom=true;
        return null
      } else {
        return {
          'priceType': item.options.pricing.priceType,
          'price': item.options.pricing.price?.value,
          'unit': item.options.pricing.price?.unit,
          'text': item.options.pricing.priceType?.toLocaleLowerCase() == TYPES.PRICE.RECURRING ? item.options.pricing.recurringChargePeriodType : item.options.pricing.priceType?.toLocaleLowerCase() == TYPES.PRICE.USAGE ? '/ ' + item.options.pricing?.unitOfMeasure?.units : ''
        }
      }
    } else {
      return null
    }
  }

  get objectKeys() {
    return Object.keys;
  }

  getPricingValue(pricing: Record<string, any>, key: string): any {
    return pricing[key];
  }


  hasKey(obj: any, key: string): boolean {
    return key in obj;
  }

  getTotalPrice() {
    this.totalPrice = [];
    let insertCheck = false;
    this.check_custom=false;
    this.cdr.detectChanges();
    for (let i = 0; i < this.items.length; i++) {
      let price = this.items[i].options.pricing
      if(price != undefined){
        this.totalPrice=price;
      }
    }
  }

  async deleteProduct(product: cartProduct){
    await this.cartService.removeItemShoppingCart(product.id);
    this.eventMessage.emitRemovedCartItem(product as cartProduct);
  }

  goToProdDetails(product: cartProduct){
    this.hideCart();
    this.router.navigate(['/search/', product.id]);
  }

  hideCart(){
    this.eventMessage.emitToggleDrawer(false);
  }


  goToShoppingCart() {
    this.hideCart();
    this.router.navigate(['/checkout']);
  }
}
