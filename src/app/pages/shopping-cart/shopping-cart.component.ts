import { Component, OnInit, ChangeDetectorRef, HostListener, AfterViewInit } from '@angular/core';
import {
  faCartShopping
} from "@fortawesome/sharp-solid-svg-icons";
import {EventMessageService} from "../../services/event-message.service";
import { ApiServiceService } from 'src/app/services/product-service.service';
import { AccountServiceService } from 'src/app/services/account-service.service';
import { ShoppingCartServiceService } from 'src/app/services/shopping-cart-service.service';
import { ProductOrderService } from 'src/app/services/product-order-service.service';
import { cartProduct, billingAccountCart, LoginInfo } from '../../models/interfaces';
import { TYPES } from 'src/app/models/types.const';
import { initFlowbite } from 'flowbite';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import {LocalStorageService} from "../../services/local-storage.service";
import { Router } from '@angular/router';
import {firstValueFrom, take} from "rxjs";
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'app-shopping-cart',
    templateUrl: './shopping-cart.component.html',
    styleUrl: './shopping-cart.component.css',
    standalone: true,
    imports: [TranslateModule, NgClass]
})
export class ShoppingCartComponent implements OnInit, AfterViewInit{
  protected readonly faCartShopping = faCartShopping;
  public static BASE_URL: String = environment.BASE_URL;
  TAX_RATE: number = environment.TAX_RATE;
  items: cartProduct[] = [];
  totalPrice:any;
  showBackDrop:boolean=true;
  billing_accounts: billingAccountCart[] =[];
  selectedBilling:any;
  loading: boolean = false;
  seller:string='';

  constructor(
    private readonly eventMessage: EventMessageService,
    private readonly auth: AuthService,
    private readonly account: AccountServiceService,
    private readonly cartService: ShoppingCartServiceService,
    private readonly cdr: ChangeDetectorRef,
    private readonly orderService: ProductOrderService,
    private readonly router: Router) {

  }

  ngOnInit(): void {
    this.auth.sellerId$.pipe(take(1)).subscribe(id => {
      this.seller = id ?? '';
    });
    this.loading=true;
    this.showBackDrop=true;
    this.cartService.getShoppingCart().then(data => {
      this.items=data;
      this.cdr.detectChanges();
      this.getTotalPrice();
      initFlowbite();
    })
    this.account.getBillingAccount().then(data => {
      for(let i=0; i< data.length;i++){
        let email =''
        let phone=''
        let phoneType = ''
        let address = {
          "city": '',
          "country": '',
          "postCode": '',
          "stateOrProvince": '',
          "street": ''
        }
        for(let j=0; j<data[i].contact[0].contactMedium.length;j++){
          if(data[i].contact[0].contactMedium[j].mediumType == 'Email'){
            email = data[i].contact[0].contactMedium[j].characteristic.emailAddress
          } else if (data[i].contact[0].contactMedium[j].mediumType == 'PostalAddress'){
            address = {
              "city": data[i].contact[0].contactMedium[j].characteristic.city,
              "country": data[i].contact[0].contactMedium[j].characteristic.country,
              "postCode": data[i].contact[0].contactMedium[j].characteristic.postCode,
              "stateOrProvince": data[i].contact[0].contactMedium[j].characteristic.stateOrProvince,
              "street": data[i].contact[0].contactMedium[j].characteristic.street1
            }
          } else if (data[i].contact[0].contactMedium[j].mediumType == 'TelephoneNumber'){
            phone = data[i].contact[0].contactMedium[j].characteristic.phoneNumber
            phoneType = data[i].contact[0].contactMedium[j].characteristic.contactType
          }
        }
        this.billing_accounts.push({
          "id": data[i].id,
          "href": data[i].href,
          "name": data[i].name,
          "email": email,
          "postalAddress": address,
          "telephoneNumber": phone,
          "telephoneType": phoneType,
          "selected": i==0 ? true : false
        })
        if(i==0){
          this.selectedBilling={
            "id": data[i].id,
            "href": data[i].href,
            "name": data[i].name,
            "email": email,
            "postalAddress": address,
            "telephoneNumber": phone,
            "selected": true
          }
        }
      }
      this.loading=false;
      this.cdr.detectChanges();
    })
  }

  ngAfterViewInit() {
    initFlowbite();
  }

  goTo(path:string) {
    this.router.navigate([path]);
  }

  getPrice(item:any){
    return {
      'priceType': item.options.pricing.priceType,
      'price': item.options.pricing.price?.value,
      'unit': item.options.pricing.price?.unit,
      'text': item.options.pricing.priceType?.toLocaleLowerCase() == TYPES.PRICE.RECURRING ? item.options.pricing.recurringChargePeriodType : item.options.pricing.priceType?.toLocaleLowerCase() == TYPES.PRICE.USAGE ? '/ '+ item.options.pricing?.unitOfMeasure?.units : ''
    }
  }

  getTotalPrice(){
    this.totalPrice=[];
    let insertCheck = false;
    let priceInfo:any  ={};
    for(let i=0; i<this.items.length; i++){
      insertCheck = false;
      if(this.totalPrice.length == 0){
        priceInfo = this.getPrice(this.items[i]);
        this.totalPrice.push(priceInfo);
      } else {
        for(let j=0; j<this.totalPrice.length; j++){
          priceInfo = this.getPrice(this.items[i]);
          if(priceInfo.priceType == this.totalPrice[j].priceType && priceInfo.unit == this.totalPrice[j].unit && priceInfo.text == this.totalPrice[j].text){
            this.totalPrice[j].price=this.totalPrice[j].price+priceInfo.price;
            insertCheck=true;
          }
        }
        if(insertCheck==false){
          this.totalPrice.push(priceInfo);
          insertCheck=true;
        }
      }
    }
  }

  async deleteProduct(product: cartProduct){
    await this.cartService.removeItemShoppingCart(product.id);
    this.eventMessage.emitRemovedCartItem(product as cartProduct);
  }

  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  clickDropdown(id:any){
    let elem = document.getElementById(id)
    if(elem != null){
      if(elem.className.match('hidden') ) {
        this.removeClass(elem,"hidden")
      } else {
        this.addClass(elem,"hidden")
      }
    }
  }

  selectBill(idx:number){
    for(let i = 0; i<this.billing_accounts.length; i++){
      if(idx==i){
        this.billing_accounts[i].selected=true;
        this.selectedBilling=this.billing_accounts[i];
        this.cdr.detectChanges();
      } else {
        this.billing_accounts[i].selected=false;
        this.cdr.detectChanges();
      }
    }
    this.cdr.detectChanges();
  }

  async orderProduct() {

    try {
      // Construir la lista de productos
      const products = this.items.map(item => this.buildProductPayload(item));

      // Crear el objeto del pedido
      const productOrder = this.buildProductOrder(products);

      // Enviar el pedido
      const response = await firstValueFrom(this.orderService.postProductOrder(productOrder));

      // Vaciar el carrito
      await this.emptyShoppingCart();

      // Redirigir al inventario
      this.goToInventory();
    } catch (error) {
      console.error('There was an error while processing the order:', error);
    }
  }

  private buildProductPayload(item: any) {
    const characteristics = this.buildProductCharacteristics(item.options.characteristics);

    return {
      id: item.id,
      action: 'add',
      state: 'acknowledged',
      itemTotalPrice: [
        {
          productOfferingPrice: {
            id: item.options.pricing?.id,
            href: item.options.pricing?.href,
          },
        },
      ],
      productOffering: {
        id: item.id,
        href: item.id,
      },
      product: {
        productCharacteristic: characteristics,
      },
    };
  }

  private buildProductCharacteristics(opChars: any[]) {
    if (!opChars) return [];
    return opChars.map(char => ({
      name: char.characteristic.name,
      value: char.value?.value,
      valueType: char.characteristic.valueType,
    }));
  }

  private buildProductOrder(products: any[]) {
    return {
      state: 'acknowledged',
      productOrderItem: products,
      seller: [
        {
          id: this.seller,
          href: this.seller,
          role: 'Customer',
        },
      ],
      priority: '4',
      billingAccount: {
        id: this.selectedBilling.id,
        href: this.selectedBilling.id,
      },
      orderDate: moment().utc(),
      notificationContact: this.selectedBilling.email,
    };
  }

  private async emptyShoppingCart() {
    try {
      const response = await this.cartService.emptyShoppingCart();
    } catch (error) {
      console.error('There was an error while emptying the cart:', error);
    }
  }


goToInventory() {
    //this.router.navigate(['/product-inventory']);
    this.router.navigate(['/product-orders']);
  }
}
