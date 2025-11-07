import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  HostListener,
  ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import {components} from "../../models/product-catalog";
import { faAtom, faClose, faEllipsis} from "@fortawesome/pro-solid-svg-icons";
type Product = components["schemas"]["ProductOffering"];
type ProductSpecification = components["schemas"]["ProductSpecification"];
type AttachmentRefOrValue = components["schemas"]["AttachmentRefOrValue"];
import {LocalStorageService} from "../../services/local-storage.service";
import {EventMessageService} from "../../services/event-message.service";
import { ApiServiceService } from 'src/app/services/product-service.service';
import { AccountServiceService } from 'src/app/services/account-service.service';
import { Modal } from 'flowbite';
import { Router } from '@angular/router';
import { PriceServiceService } from 'src/app/services/price-service.service';
import { initFlowbite } from 'flowbite';
import { LoginInfo, cartProduct,productSpecCharacteristicValueCart } from '../../models/interfaces';
import { ShoppingCartServiceService } from 'src/app/services/shopping-cart-service.service';
import * as moment from 'moment';
import { certifications } from 'src/app/models/certification-standards.const';
import { environment } from 'src/environments/environment';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { CartCardComponent } from '../cart-card/cart-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgClass } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { BadgeComponent } from '../badge/badge.component';
import { PricePlanDrawerComponent } from '../price-plan-drawer/price-plan-drawer.component';
import { AuthService } from 'src/app/guard/auth.service';
import { ProductDetailsComponent } from 'src/app/pages/product-details/product-details.component';

@Component({
    selector: 'bae-off-card',
    templateUrl: './card.component.html',
    styleUrl: './card.component.css',
    standalone: true,
    imports: [ProductDetailsComponent, ErrorMessageComponent, CartCardComponent, TranslateModule, NgClass, DatePipe, MarkdownComponent, FaIconComponent, BadgeComponent, PricePlanDrawerComponent]
})
export class CardComponent implements OnInit, AfterViewInit {

  @Input() productOff: Product | undefined;
  @Input() cardId: number;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  category: string = 'none';
  categories: any[] | undefined  = [];
  categoriesMore: any[] | undefined  = [];
  price: any = {price:0,priceType:'X'};
  images: AttachmentRefOrValue[]  = [];
  bgColor: string = '';
  toastVisibility: boolean = false;
  detailsModalVisibility: boolean = false;
  lastAddedProd:any | undefined;
  targetModal: any;
  modal: Modal;
  prodSpec:ProductSpecification = {};
  complianceProf:any[] = certifications;
  complianceLevel:string = 'NL';
  showModal:boolean=false;
  cartSelection:boolean=false;
  check_prices:boolean=false;
  selected_price:any;
  check_char:boolean=false;
  check_terms:boolean=false;
  selected_terms:boolean=false;
  selected_chars:productSpecCharacteristicValueCart[]=[];
  formattedPrices:any[]=[];
  @ViewChild('myProdImage') myProdImage!: ElementRef<HTMLImageElement>;
  check_logged:boolean=false;
  protected readonly faAtom = faAtom;
  protected readonly faClose = faClose;
  protected readonly faEllipsis = faEllipsis;
  PURCHASE_ENABLED: boolean = environment.PURCHASE_ENABLED;
  checkMoreCats:boolean=false;
  loadMoreCats:boolean=false;

  errorMessage:any='';
  showError:boolean=false;
  orgInfo:any=undefined;

  selectedPricePlanId: string | null = null;
  selectedPricePlan:any = null;
  productAlreadyInCart:boolean=false;



  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly auth: AuthService,
    private readonly eventMessage: EventMessageService,
    private readonly api: ApiServiceService,
    private readonly priceService: PriceServiceService,
    private readonly cartService: ShoppingCartServiceService,
    private readonly accService: AccountServiceService,
    private readonly router: Router
    ) {
      this.targetModal = document.getElementById('details-modal');
      this.modal = new Modal(this.targetModal);

      this.eventMessage.messages$.subscribe(ev => {
        if(ev.type === 'CloseCartCard') {
          this.hideCartSelection();
          //TOGGLE TOAST
          if(ev.value!=undefined){
            this.lastAddedProd=ev.value;
            this.toastVisibility=true;

            this.cdr.detectChanges();
            //document.getElementById("progress-bar")?.classList.toggle("hover:w-100");
            let element = document.getElementById("progress-bar")
            let parent = document.getElementById("toast-add-cart")
            if (element != null && parent != null) {
              element.style.width = '0%'
              element.offsetWidth
              element.style.width = '100%'
              setTimeout(() => {
                this.toastVisibility=false
              }, 3500);
            }
          }

          this.cdr.detectChanges();
        } else if (ev.type == 'RemovedCartItem'){
          this.cartService.getShoppingCart().then(data => {
            const exists = data.some((item: any) => item.id === this.productOff?.id);
            if (exists) {
              this.productAlreadyInCart=true;
            } else {
              this.productAlreadyInCart=false;
            }
          })
        } else if (ev.type == 'AddedCartItem'){
          this.cartService.getShoppingCart().then(data => {
            const exists = data.some((item: any) => item.id === this.productOff?.id);
            if (exists) {
              this.productAlreadyInCart=true;
            } else {
              this.productAlreadyInCart=false;
            }
          })
        }
      })
    }

  @HostListener('document:click')
  onClick() {
    if(this.showModal==true){
      this.showModal=false;
      if(this.productOff?.category)
      if(this.productOff?.category.length>5){
        this.loadMoreCats=false;
        this.checkMoreCats=true;
      }
      this.cdr.detectChanges();
    }
    if(this.cartSelection==true){
      this.cartSelection=false;
      this.check_char=false;
      this.check_terms=false;
      this.check_prices=false;
      this.selected_chars=[];
      this.selected_price={};
      this.selected_terms=false;
      this.cdr.detectChanges();
    }
  }


  ngOnInit() {
    this.auth.isAuthenticated$.subscribe(isAuth => {
      this.check_logged = isAuth;
      this.cdr.detectChanges();
    });

    this.category = this.productOff?.category?.at(0)?.name ?? 'none';
    if(this.productOff?.category!=undefined&&this.productOff?.category.length>5){
      this.categories = this.productOff?.category.slice(0, 4);
      this.categoriesMore = this.productOff?.category.slice(4);
      this.checkMoreCats=true;
    } else {
      this.categories = this.productOff?.category;
      this.checkMoreCats=false;
    }
    let profile = this.productOff?.attachment?.filter(item => item.name === 'Profile Picture') ?? [];
    if(profile.length==0){
      this.images = this.productOff?.attachment?.filter(item => item.attachmentType === 'Picture') ?? [];
    } else {
      this.images = profile;
    }
    let specId:any|undefined=this.productOff?.productSpecification?.id;
    if(specId != undefined){
      this.api.getProductSpecification(specId).then(spec => {
        this.prodSpec = spec;
        this.getOwner();
      })
    }

    let result:any = this.priceService.formatCheapestPricePlan(this.productOff);
    this.price = {
      "price": result.price,
      "unit": result.unit,
      "priceType": result.priceType,
      "text": result.text
    }

    this.prepareOffData();

    if(!this.IS_ISBE){
      this.cartService.getShoppingCart().then(data => {
        const exists = data.some((item: any) => item.id === this.productOff?.id);
        if (exists) {
          this.productAlreadyInCart=true;
        } else {
          this.productAlreadyInCart=false;
        }
      })
    }
    
    this.cdr.detectChanges();
  }

  getProductImage() {
    return this.images.length > 0 ? this.images?.at(0)?.url : 'https://placehold.co/600x400/svg';
  }

  ngAfterViewInit() {
    initFlowbite();
  }


  async addProductToCart(productOff: Product | undefined, options: boolean) {
    if (!productOff || !productOff.productOfferingPrice) return;

    const prodOptions = this.createProdOptions(productOff, options);
    this.lastAddedProd = prodOptions;

    try {
      // Añadir producto al carrito
      await this.cartService.addItemShoppingCart(prodOptions);

      // Mostrar el toast
      this.showToast();

      // Emitir evento de producto añadido
      this.eventMessage.emitAddedCartItem(productOff as cartProduct);
    } catch (error) {
      this.handleError(error, 'There was an error while adding item to the cart!');
    }

    // Restablecer selecciones si es necesario
    if (this.cartSelection) {
      this.resetSelections();
    }

    this.cdr.detectChanges();
  }

  private createProdOptions(productOff: Product, options: boolean) {
    return {
      id: productOff.id,
      name: productOff.name,
      image: this.getProductImage(),
      href: productOff.href,
      options: {
        characteristics: this.selected_chars,
        pricing: this.selected_price,
      },
      termsAccepted: options ? this.selected_terms : true,
    };
  }

  private showToast() {
    this.toastVisibility = true;
    this.cdr.detectChanges();

    const element = document.getElementById('progress-bar');
    const parent = document.getElementById('toast-add-cart');
    if (element && parent) {
      element.style.width = '0%'; // Reinicia el ancho
      element.offsetWidth; // Forzar el reflujo
      element.style.width = '100%'; // Llena la barra de progreso
      setTimeout(() => {
        this.toastVisibility = false; // Ocultar el toast tras 3.5 segundos
      }, 3500);
    }
  }

  private handleError(error: any, defaultMessage: string) {
    console.error(defaultMessage, error);
    this.errorMessage = error?.error?.error ? `Error: ${error.error.error}` : defaultMessage;
    this.showError = true;
    setTimeout(() => (this.showError = false), 3000);
  }

  private resetSelections() {
    this.cartSelection = false;
    this.check_char = false;
    this.check_terms = false;
    this.check_prices = false;
    this.selected_chars = [];
    this.selected_price = {};
    this.selected_terms = false;
    this.cdr.detectChanges();
  }


async deleteProduct(product: Product | undefined){
    if(product !== undefined) {
      //this.localStorage.removeCartItem(product);
      await this.cartService.removeItemShoppingCart(product.id);
      this.eventMessage.emitRemovedCartItem(product as Product);
    }
    this.toastVisibility=false;
  }

  toggleDetailsModal(){
    this.showModal=true;
    this.cdr.detectChanges();
  }

  toggleCartSelection(){
    if (this.productOff?.productOfferingPrice != undefined){
      if(this.productOff?.productOfferingPrice.length > 1){
        this.check_prices=true;
        this.selected_price=this.productOff?.productOfferingPrice[this.productOff?.productOfferingPrice.length-1]
      } else {
        this.selected_price=this.productOff?.productOfferingPrice[0]
      }
    }

    if(this.productOff?.productOfferingTerm != undefined){
      if(this.productOff.productOfferingTerm.length == 1 && this.productOff.productOfferingTerm[0].name == undefined){
        this.check_terms=false;
      } else {
        this.check_terms=true;
      }
    }
    //this.prepareOffData();

    if (this.check_prices==false && this.check_char == false && this.check_terms == false){
      this.addProductToCart(this.productOff,false);
    } else {
      this.cartSelection=true;
      this.cdr.detectChanges();
    }
  }

  prepareOffData() {
    if(this.prodSpec.productSpecCharacteristic != undefined){
      for(let i=0; i<this.prodSpec.productSpecCharacteristic.length; i++){
        let charvalue = this.prodSpec.productSpecCharacteristic[i].productSpecCharacteristicValue;
        if(charvalue != undefined){
          if(charvalue?.length>1){
            this.check_char = true;
          }
          for(let j=0; j<charvalue.length;j++){
            if(charvalue[j]?.isDefault == true){
              this.selected_chars.push(
                {
                  "characteristic": this.prodSpec.productSpecCharacteristic[i],
                  "value": charvalue[j]
                });
            }
          }
        }
      }
    }
  }

  hideCartSelection(){
    this.cartSelection=false;
    this.check_char=false;
    this.check_terms=false;
    this.check_prices=false;
    this.formattedPrices=[];
    this.selected_chars=[];
    this.selected_price={};
    this.selected_terms=false;
    this.cdr.detectChanges();
  }

  goToProductDetails(productOff:Product| undefined) {
    document.querySelector("body > div[modal-backdrop]")?.remove()
    this.router.navigate(['/search', productOff?.id]);
  }

  goToOrgDetails(id:any) {
    document.querySelector("body > div[modal-backdrop]")?.remove()
    this.router.navigate(['/org-details', id]);
  }

  getOwner(){
    let parties = this.prodSpec?.relatedParty;
    if(parties)
    for(let i=0; i<parties.length;i++){
      if(parties[i].role=='Owner'){
        if(parties[i].id.includes('organization')){
          this.accService.getOrgInfo(parties[i].id).then(org => {
            this.orgInfo=org;
          })
        }
      }
    }
  }

  onPricePlanSelected(pricePlan:any) {
    this.selectedPricePlanId = pricePlan.id;
    this.selectedPricePlan = pricePlan;
  }

  onValueChange(event: { characteristicId: string; selectedValue: any }): void {
    //this.form.get(event.characteristicId)?.setValue(event.selectedValue);
    console.log('Selected Value:', event);
  }

  isDrawerOpen = false;
  openDrawer(): void {
    if(this.showModal) this.showModal = false;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  protected readonly JSON = JSON;
}
