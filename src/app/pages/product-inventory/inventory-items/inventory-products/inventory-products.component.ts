import { Component, OnInit, ChangeDetectorRef, HostListener, Input, inject } from '@angular/core';
import { LoginInfo } from 'src/app/models/interfaces';
import { ProductInventoryServiceService } from 'src/app/services/product-inventory-service.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {EventMessageService} from "src/app/services/event-message.service";
import {components} from "src/app/models/product-catalog";
import { Router } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { environment } from 'src/environments/environment';
type ProductOffering = components["schemas"]["ProductOffering"];
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {faIdCard, faSort, faSwatchbook} from "@fortawesome/pro-solid-svg-icons";
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { BadgeComponent } from 'src/app/shared/badge/badge.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';
import { AttachmentServiceService } from 'src/app/services/attachment-service.service';
@Component({
    selector: 'inventory-products',
    templateUrl: './inventory-products.component.html',
    styleUrl: './inventory-products.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, NgClass, MarkdownComponent, BadgeComponent, FaIconComponent]
})
export class InventoryProductsComponent implements OnInit {

  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;

  @Input() prodId: any = undefined;

  inventory:any[] = [];
  nextInventory:any[] =[];
  seller:any='';
  loading: boolean = false;
  bgColor: string[] = [];
  products: ProductOffering[]=[];
  unsubscribeModal:boolean=false;
  renewModal:boolean=false;
  prodToRenew:any;
  prodToUnsubscribe:any;
  prices: any[]=[];
  filters: any[]=['active','created'];
  loading_more: boolean = false;
  page_check:boolean = true;
  page: number=0;
  INVENTORY_LIMIT: number = environment.INVENTORY_LIMIT;
  searchField = new FormControl();
  keywordFilter:any=undefined;
  selectedProduct:any;
  selectedInv:any;
  selectedResources:any[]=[];
  selectedServices:any[]=[];

  errorMessage:any='';
  showError:boolean=false;
  showDetails:boolean=false;
  checkCustom:boolean=false;
  checkFrom:boolean=true;  
  
  private readonly attachmentService = inject(AttachmentServiceService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject( ApiServiceService);
  private readonly inventoryService = inject(ProductInventoryServiceService);
  private readonly router= inject(Router);
  private readonly eventMessage= inject(EventMessageService);
  private readonly paginationService= inject(PaginationService);

  constructor() {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initInventory();
      }
    })
  }

  ngOnInit() {
    if(this.prodId==undefined){
      this.checkFrom=false;
    }
    this.initInventory();
  }

  initInventory(){
    this.loading = true;
    this.auth.sellerId$
      .pipe(take(1))
      .subscribe(id => {
        this.seller = id || '';
        this.getInventory(false);
    });
    
    let input = document.querySelector('[type=search]')
    if(input!=undefined){
      input.addEventListener('input', e => {
        if(this.searchField.value==''){
          this.keywordFilter=undefined;
          this.getInventory(false);
        }
      });
    }
    initFlowbite();
  }

  @HostListener('document:click')
  onClick() {
    if(this.unsubscribeModal){
      this.unsubscribeModal=false;
      this.cdr.detectChanges();
    }
    if(this.prodToRenew){
      this.prodToRenew=false;
      this.cdr.detectChanges();
    }   
  }
  
  getProductImage(prod:ProductOffering) {
    let images: any[] = []
    if(prod?.attachment){
      let profile = prod?.attachment?.filter(item => item.name === 'Profile Picture') ?? [];
      images = prod.attachment?.filter(item => item.attachmentType === 'Picture') ?? [];
      if(profile.length!=0){
        images = profile;
      } 
    }
    return this.attachmentService.getProductImage(images);
  }

  goToProductDetails(productOff:ProductOffering| undefined) {
    document.querySelector("body > div[modal-backdrop]")?.remove()
    this.router.navigate(['product-inventory', productOff?.id]);
  }

  async getInventory(next:boolean){
    if(!next){
      this.loading = true;
    }

    let options = {
      "keywords": this.keywordFilter,
      "filters": this.filters,
      "seller": "did:elsi:"+this.seller
    }
    
    await this.paginationService.getItemsPaginated(this.page, this.INVENTORY_LIMIT, next, this.inventory, this.nextInventory, options,
      this.paginationService.getInventory.bind(this.paginationService)).then(data => {
        this.page_check = data.page_check;
        this.inventory = data.items;
        this.nextInventory = data.nextItems;
        this.page = data.page;
        this.loading = false;
        this.loading_more = false;
        initFlowbite();
        if(this.prodId!=undefined && this.checkFrom){
          let idx = this.inventory.findIndex(element => element.id == this.prodId)
          this.selectProduct(this.inventory[idx])
          this.checkFrom=false;
        }
    })
  }

  onStateFilterChange(filter:string){
    const index = this.filters.findIndex(item => item === filter);
    if (index !== -1) {
      this.filters.splice(index, 1);
    } else {
      this.filters.push(filter)
    }
    this.getInventory(false);
  }

  async next(){
    await this.getInventory(true);
  }

  filterInventoryByKeywords(){
    this.keywordFilter=this.searchField.value;
    this.getInventory(false);
  }

  unsubscribeProduct(id:any){
    this.inventoryService.updateProduct({status: "suspended"},id).subscribe({
      next: data => {
        this.unsubscribeModal=false;
        this.getInventory(false);
      },
      error: error => {
          console.error('There was an error while updating!', error);
          if(error.error.error){
            console.error(error)
            this.errorMessage='Error: '+error.error.error;
          } else {
            this.errorMessage='¡Hubo un error al cancelar la suscripción!';
          }
          this.showError=true;
          setTimeout(() => {
            this.showError = false;
          }, 3000);
      }
    });
  }

  showUnsubscribeModal(inv:any){
    this.unsubscribeModal=true;
    this.prodToUnsubscribe=inv;
  }

  showRenewModal(inv:any){
    this.renewModal=true;
    this.prodToRenew=inv;
  }
  
  renewProduct(id:any){
    console.log(id)
  }

  selectProduct(prod:any){
    this.selectedProduct=prod;
    this.selectedResources=[];
    this.selectedServices=[];
    for(let i=0; i<this.selectedProduct.productPrice?.length;i++){
      if(this.selectedProduct.productPrice[i].priceType == 'custom'){
        this.checkCustom=true;
      }
    }
    this.api.getProductSpecification(this.selectedProduct.product.productSpecification.id).then(spec => {
      if(spec.serviceSpecification != undefined){
        for(let j=0; j < spec.serviceSpecification.length; j++){
          this.api.getServiceSpec(spec.serviceSpecification[j].id).then(serv => {
            this.selectedServices.push(serv);
          })
        }
      }
      if(spec.resourceSpecification != undefined){
        for(let j=0; j < spec.resourceSpecification.length; j++){
          this.api.getResourceSpec(spec.resourceSpecification[j].id).then(res => {
            this.selectedResources.push(res);
          })
        }
      }
    })

    this.showDetails=true;
  }

  back(){
    this.showDetails=false;
  }

  selectService(id:any){
    this.eventMessage.emitOpenServiceDetails({serviceId: id, prodId: this.selectedProduct.id});
  }

  selectResource(id:any){
    this.eventMessage.emitOpenResourceDetails({resourceId: id, prodId: this.selectedProduct.id});
  }

}
