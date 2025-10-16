import {ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import {combineLatest, firstValueFrom, take} from 'rxjs';
import {TranslateModule} from "@ngx-translate/core";
import {LocalStorageService} from "../../services/local-storage.service";
import {EventMessageService} from "../../services/event-message.service";
import {PriceServiceService} from "../../services/price-service.service";
import {ShoppingCartServiceService} from "../../services/shopping-cart-service.service";
import {ApiServiceService} from "../../services/product-service.service";
import {ActivatedRoute, Router} from "@angular/router";
import {billingAccountCart, cartProduct, LoginInfo} from "../../models/interfaces";
import {faCartShopping} from "@fortawesome/sharp-solid-svg-icons";
import {environment} from "../../../environments/environment";
import {TYPES} from "../../models/types.const";
import {AccountServiceService} from "../../services/account-service.service";
import * as moment from "moment/moment";
import {ProductOrderService} from "../../services/product-order-service.service";
import {BillingAccountFormComponent} from "../../shared/billing-account-form/billing-account-form.component";
import { PaymentService } from 'src/app/services/payment.service';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { NgClass } from '@angular/common';
import { BillingAddressComponent } from './billing-address/billing-address.component';
import { AuthService } from 'src/app/guard/auth.service';


@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, BillingAccountFormComponent, BillingAccountFormComponent, TranslateModule, NgClass, BillingAddressComponent]
})
export class CheckoutComponent implements OnInit {
  protected readonly faCartShopping = faCartShopping;
  public static BASE_URL: String = environment.BASE_URL;
  PURCHASE_ENABLED: boolean = environment.PURCHASE_ENABLED;
  TAX_RATE: number = environment.TAX_RATE;
  items: any[] = [];
  totalPrice: any;
  showBackDrop: boolean = true;
  billingAddresses: billingAccountCart[] = [];
  selectedBillingAddress: any;
  loading: boolean = false;
  loading_baddrs: boolean = false;
  addBill: boolean = false;
  seller: string = '';
  contact = {email: '', username: ''};
  formatter: any;
  preferred: boolean = false;
  loading_purchase: boolean = false;
  check_custom: boolean = false;

  errorMessage: any = '';
  showError: boolean = false;

  constructor(
    private readonly account: AccountServiceService,
    private readonly orderService: ProductOrderService,
    private readonly eventMessage: EventMessageService,
    private readonly cartService: ShoppingCartServiceService,
    private readonly paymentService: PaymentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService
  ) {
    // Bind the method to preserve context
    this.orderProduct = this.orderProduct.bind(this);
    this.eventMessage.messages$.subscribe(ev => {
      if (ev.type === 'BillAccChanged') {
        this.getBilling();
      }
      if (ev.value) {
        this.addBill = false;
      }
      if (ev.type === 'ChangedSession') {
        this.initCheckoutData();
      }
      if(ev.type === 'AddedCartItem') {
        this.cartService.getShoppingCart().then(data => {
          this.items=data;
          this.cdr.detectChanges();
          this.getTotalPrice();
        })
      }
      if(ev.type === 'RemovedCartItem') {
        this.cartService.getShoppingCart().then(data => {
          this.items=data;
          this.cdr.detectChanges();
          this.getTotalPrice();
        })
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if (this.addBill) {
      this.addBill = false;
      this.cdr.detectChanges();
    }
  }

  hasKey(obj: any, key: string): boolean {
    return key in obj;
  }

  getPrice(item: any) {
    if (item.options.pricing != undefined) {
      if (item.options.pricing.priceType == 'custom') {
        this.check_custom = true;
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

  getTotalPrice() {
    this.totalPrice = [];
    let insertCheck = false;
    this.check_custom = false;
    this.cdr.detectChanges();
    let priceInfo: any = {};
    for (const element of this.items) {
      insertCheck = false;
      if (this.totalPrice.length == 0) {
        priceInfo = this.getPrice(element);
        if (priceInfo != null) {
          this.totalPrice.push(priceInfo);
        }
      } else {
        for (let j = 0; j < this.totalPrice.length; j++) {
          priceInfo = this.getPrice(element);
          if (priceInfo != null) {
            if (priceInfo.priceType == this.totalPrice[j].priceType && priceInfo.unit == this.totalPrice[j].unit && priceInfo.text == this.totalPrice[j].text) {
              this.totalPrice[j].price = this.totalPrice[j].price + priceInfo.price;
              insertCheck = true;
            }
          }
        }
        if (insertCheck == false && priceInfo != null) {
          this.totalPrice.push(priceInfo);
          insertCheck = true;
        }
      }
    }
  }

  goToInventory() {
    this.router.navigate(['/product-orders']);
  }

  async orderProduct() {
    this.loading_purchase = true;

    const products = this.items
      .filter(item => item.options.pricing)
      .map(item => this.createProductPayload(item));

    const productOrder = this.createProductOrder(products);

    try {
      const response = await firstValueFrom(this.orderService.postProductOrder(productOrder));
      const redirectUrl = response.headers.get('X-redirect-url');

      if (redirectUrl) {
        // Going to the payment gateway
        window.location.href = redirectUrl;
      } else {
        // we clear the shopping cart only if no redirection is applied
        await this.emptyShoppingCart();
        this.goToInventory();
      }
    } catch (error) {
      this.handleError(error, 'There was an error during purchase!');
    } finally {
      this.loading_purchase = false;
      this.cdr.detectChanges();
    }
  }

  private createProductPayload(item: any) {
    let itemTotalPrice: any = [];
    if (item.options.pricing.length > 0) {
      itemTotalPrice = [{
        productOfferingPrice: {
          id: item.options.pricing[0].id,
          href: item.options.pricing[0].id
        }
      }]
    }

    return {
      id: item.id,
      action: 'add',
      productOffering: {
        id: item.id,
        href: item.id
      },
      itemTotalPrice: itemTotalPrice,
      product: {
        productCharacteristic: item.options.characteristics
      }
    };
  }

  private createProductOrder(products: any[]) {
    return {
      productOrderItem: products,
      seller: [
        {
          id: this.seller,
          href: this.seller,
          role: 'Customer'
        }
      ],
      priority: '4',
      billingAccount: {
        id: this.selectedBillingAddress.id,
        href: this.selectedBillingAddress.id
      },
      notificationContact: this.selectedBillingAddress.email
    };
  }

  private async emptyShoppingCart() {
    try {
      const response = await this.cartService.emptyShoppingCart();
    } catch (error) {
      this.handleError(error, 'There was an error while emptying the cart!');
    }
  }

  private handleError(error: any, defaultMessage: string) {
    console.error(defaultMessage, error);
    this.errorMessage = error?.error?.error
      ? `Error: ${error.error.error}`
      : defaultMessage;
    this.showError = true;
    setTimeout(() => (this.showError = false), 3000);
  }


  ngOnInit(): void {

    this.formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',

      // These options are needed to round to whole numbers if that's what you want.
      //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    });

    // Check if we are comming from a purchase
    const qParams:any = this.route.snapshot.queryParams;
    if (qParams.client && qParams.action && qParams.ref) {
      // All the payment basic params are here

      let params = {...qParams}
      // They are adding the jwt incorrect within the ref, so check for it
      if (params.ref.includes('?jwt')) {
        let ref = params.ref.split('?jwt');
        params.ref = ref[0];
        params.jwt = ref[1];
      }

      this.loading_purchase = true;
      firstValueFrom(this.paymentService.completePayment(params)).then((response) => {
        this.loading_purchase = false;

        if (qParams.action == 'accept' && response.status == 200) {
          // Success request
          this.emptyShoppingCart().then(() => this.goToInventory());
          // Redirect to the inventory page
        } else {
          // Call the cancel endpoint
          // We had an error, so we reload the checkout page
          this.initCheckoutData();
        }  
      }).catch((error) => {
        this.loading_purchase = true;
        this.initCheckoutData();
      });

    } else {
      this.initCheckoutData();
    }
  }

  initCheckoutData(): void {
    combineLatest([this.auth.loginInfo$, this.auth.sellerId$])
      .pipe(take(1))
      .subscribe(([li, sellerId]) => {
        if (li) {
          this.contact.email = li.email || '';
          this.contact.username = li.username || li.user || '';
        } else {
          this.contact.email = '';
          this.contact.username = '';
        }
        this.seller = sellerId || '';

        this.cartService.getShoppingCart().then(data => {
          this.items = data;
          this.cdr.detectChanges();
          this.getTotalPrice();
        });

        this.loading_baddrs = true;
        this.getBilling();
      });
  }

  getBilling() {
    let isBillSelected = false;
    this.billingAddresses = [];
    this.account.getBillingAccount().then(data => {
      for (const element of data) {
        isBillSelected = false;
        let email = ''
        let phone = ''
        let phoneType = ''
        let address = {
          "city": '',
          "country": '',
          "postCode": '',
          "stateOrProvince": '',
          "street": ''
        }
        if (element.contact) {
          for (let j = 0; j < element.contact[0].contactMedium.length; j++) {
            if (element.contact[0].contactMedium[j].mediumType == 'Email') {
              email = element.contact[0].contactMedium[j].characteristic.emailAddress
            } else if (element.contact[0].contactMedium[j].mediumType == 'PostalAddress') {
              address = {
                "city": element.contact[0].contactMedium[j].characteristic.city,
                "country": element.contact[0].contactMedium[j].characteristic.country,
                "postCode": element.contact[0].contactMedium[j].characteristic.postCode,
                "stateOrProvince": element.contact[0].contactMedium[j].characteristic.stateOrProvince,
                "street": element.contact[0].contactMedium[j].characteristic.street1
              }
            } else if (element.contact[0].contactMedium[j].mediumType == 'TelephoneNumber') {
              phone = element.contact[0].contactMedium[j].characteristic.phoneNumber
              phoneType = element.contact[0].contactMedium[j].characteristic.contactType
            }
            if (element.contact[0].contactMedium[j].preferred == true) {
              isBillSelected = true;
            }
          }
        }
        const baddr = {
          "id": element.id,
          "href": element.href,
          "name": element.name,
          "email": email ?? '',
          "postalAddress": address ?? {},
          "telephoneNumber": phone ?? '',
          "telephoneType": phoneType ?? '',
          "selected": isBillSelected
        }
        this.billingAddresses.push(baddr)
        if (isBillSelected) {
          this.selectedBillingAddress = baddr
        }
      }
      this.loading_baddrs = false;
      if (this.billingAddresses.length > 0) {
        this.preferred = false;
      } else {
        this.preferred = true;
      }
    })
  }

  onSelected(baddr: billingAccountCart) {
    for (let ba of this.billingAddresses) {
      ba.selected = false;
    }
    this.selectedBillingAddress = baddr;
  }

  onDeleted(baddr: billingAccountCart) {
    console.log('Deleting billing account')
  }

  async deleteProduct(product: cartProduct) {
    await this.cartService.removeItemShoppingCart(product.id)
    this.eventMessage.emitRemovedCartItem(product as cartProduct);
    this.cartService.getShoppingCart().then(data => {
      this.items = data;
      this.cdr.detectChanges();
      this.getTotalPrice();
    })
  }

  goToProdDetails(product: cartProduct){
    this.router.navigate(['/search/', product.id]);
  }
}
