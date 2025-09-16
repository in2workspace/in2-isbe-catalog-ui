import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {components} from "src/app/models/product-catalog";
type Catalog = components["schemas"]["Catalog"];
import {LocalStorageService} from "src/app/services/local-storage.service";
import { LoginInfo } from 'src/app/models/interfaces';
import {EventMessageService} from "../../services/event-message.service";
import * as moment from 'moment';
import { FeedbackModalComponent } from 'src/app/shared/feedback-modal/feedback-modal.component';
import { UpdateCatalogComponent } from './offerings/seller-catalogs/update-catalog/update-catalog.component';
import { UpdateOfferComponent } from './offerings/seller-offer/update-offer/update-offer.component';
import { UpdateResourceSpecComponent } from './offerings/seller-resource-spec/update-resource-spec/update-resource-spec.component';
import { UpdateServiceSpecComponent } from './offerings/seller-service-spec/update-service-spec/update-service-spec.component';
import { UpdateProductSpecComponent } from './offerings/seller-product-spec/update-product-spec/update-product-spec.component';
import { CreateCatalogComponent } from './offerings/seller-catalogs/create-catalog/create-catalog.component';
import { CreateOfferComponent } from './offerings/seller-offer/create-offer/create-offer.component';
import { CreateResourceSpecComponent } from './offerings/seller-resource-spec/create-resource-spec/create-resource-spec.component';
import { CreateServiceSpecComponent } from './offerings/seller-service-spec/create-service-spec/create-service-spec.component';
import { CreateProductSpecComponent } from './offerings/seller-product-spec/create-product-spec/create-product-spec.component';
import { SellerOfferComponent } from './offerings/seller-offer/seller-offer.component';
import { SellerResourceSpecComponent } from './offerings/seller-resource-spec/seller-resource-spec.component';
import { SellerServiceSpecComponent } from './offerings/seller-service-spec/seller-service-spec.component';
import { SellerProductSpecComponent } from './offerings/seller-product-spec/seller-product-spec.component';
import { SellerCatalogsComponent } from './offerings/seller-catalogs/seller-catalogs.component';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';

@Component({
    selector: 'app-seller-offerings',
    templateUrl: './seller-offerings.component.html',
    styleUrl: './seller-offerings.component.css',
    standalone: true,
    imports: [FeedbackModalComponent, UpdateCatalogComponent, UpdateOfferComponent, UpdateResourceSpecComponent, UpdateServiceSpecComponent, UpdateProductSpecComponent, CreateCatalogComponent, CreateOfferComponent, CreateResourceSpecComponent,
      CreateServiceSpecComponent, CreateProductSpecComponent, SellerOfferComponent, SellerResourceSpecComponent, SellerServiceSpecComponent, SellerProductSpecComponent,
      SellerCatalogsComponent, TranslateModule, ErrorMessageComponent
    ]
})
export class SellerOfferingsComponent implements OnInit {

  show_catalogs: boolean = true;
  show_prod_specs: boolean = false;
  show_service_specs: boolean = false;
  show_resource_specs: boolean = false;
  show_offers: boolean = false;
  show_create_prod_spec: boolean = false;
  show_create_res_spec: boolean = false;
  show_create_serv_spec: boolean = false;
  show_create_offer: boolean = false;
  show_create_catalog:boolean = false;
  show_update_prod_spec:boolean=false;
  show_update_serv_spec:boolean=false;
  show_update_res_spec:boolean=false;
  show_update_offer:boolean=false;
  show_update_catalog:boolean=false;
  prod_to_update:any;
  serv_to_update:any;
  res_to_update:any;
  offer_to_update:any;
  catalog_to_update:any;
  feedback:boolean=false;
  userInfo:any;
  activeSection: string = 'catalogs'; // default
  sectionActions : Record<string, () => void> = {
    catalogs: this.goToCatalogs,
    offers: this.goToOffers,
    productspec: this.goToProdSpec,
    servicespec: this.goToServiceSpec,
    resourcespec: this.goToResourceSpec
  };

  constructor(
    private localStorage: LocalStorageService,
    private cdr: ChangeDetectorRef,
    private eventMessage: EventMessageService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'SellerProductSpec') {   
        if(ev.value == true && (JSON.stringify(this.userInfo) != '{}' && (((this.userInfo.expire - moment().unix())-4) > 0))) {
          this.feedback=true;
        }  
        this.goToProdSpec();
      }
      if(ev.type === 'SellerCreateProductSpec' && ev.value == true) {        
        this.goToCreateProdSpec();
      }
      if(ev.type === 'SellerServiceSpec' && ev.value == true) {             
        this.goToServiceSpec();
      }
      if(ev.type === 'SellerCreateServiceSpec' && ev.value == true) {
        this.goToCreateServSpec();
      }
      if(ev.type === 'SellerResourceSpec' && ev.value == true) {                
        this.goToResourceSpec();
      }
      if(ev.type === 'SellerCreateResourceSpec' && ev.value == true) {        
        this.goToCreateResSpec();
      }
      if(ev.type === 'SellerOffer' && ev.value == true) {      
        this.goToOffers();
      }
      if(ev.type == 'SellerCatalog' && ev.value == true){
        this.goToCatalogs();
      }
      if(ev.type === 'SellerCreateOffer' && ev.value == true) {
        this.goToCreateOffer();
      }
      if(ev.type === 'SellerCatalogCreate' && ev.value == true) {
        this.goToCreateCatalog();
      }
      if(ev.type === 'SellerUpdateProductSpec') {
        this.prod_to_update=ev.value;
        this.goToUpdateProdSpec();
      }
      if(ev.type === 'SellerUpdateServiceSpec') {
        this.serv_to_update=ev.value;
        this.goToUpdateServiceSpec();
      }
      if(ev.type === 'SellerUpdateResourceSpec') {
        this.res_to_update=ev.value;
        this.goToUpdateResourceSpec();
      }
      if(ev.type === 'SellerUpdateOffer') {
        this.offer_to_update=ev.value;
        this.goToUpdateOffer();
      }
      if(ev.type === 'SellerCatalogUpdate') {
        this.catalog_to_update=ev.value;
        this.goToUpdateCatalog();
      }
      if(ev.type === 'CloseFeedback') {
        this.feedback = false;
      }
    })
  }

  ngOnInit() {
    this.userInfo = this.localStorage.getObject('login_items') as LoginInfo;
    const saved = localStorage.getItem('activeSection');
    console.log(saved)
    if (saved) this.activeSection = saved;
    if (saved && this.sectionActions[saved]) {
      this.sectionActions[saved].call(this); // bind `this` context
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    localStorage.setItem('activeSection', section);
    console.log('Saved to localStorage:', section);
  }

  goToCreateProdSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=true;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  goToUpdateProdSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=true;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();  
  }

  goToCreateCatalog(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=true;
    this.cdr.detectChanges();
  }

  goToUpdateCatalog(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_create_catalog=false;
    this.show_update_catalog=true;
    this.cdr.detectChanges();
  }

  goToUpdateOffer(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=true;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();  
  }

  goToUpdateServiceSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=true;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges(); 
  }

  goToUpdateResourceSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=true;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges(); 
  }

  goToCreateServSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_serv_spec=true;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  goToCreateResSpec(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_serv_spec=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=true;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  goToCreateOffer(){
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_serv_spec=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_offer=true;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  goToCatalogs(){  
    this.setActiveSection('catalogs');  
    this.selectCatalogs();
    this.show_catalogs=true;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  selectCatalogs(){
    let catalog_button = document.getElementById('catalogs-button')
    let prodSpec_button = document.getElementById('prod-spec-button')
    let serviceSpec_button = document.getElementById('sev-spec-button')
    let resourceSpec_button = document.getElementById('res-spec-button')
    let offer_button = document.getElementById('offers-button')

    this.selectMenu(catalog_button,'text-white bg-primary-100');
    this.unselectMenu(prodSpec_button,'text-white bg-primary-100');
    this.unselectMenu(serviceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(resourceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(offer_button,'text-white bg-primary-100');
  }

  goToProdSpec(){
    this.setActiveSection('productspec'); 
    this.selectProdSpec();
    this.show_catalogs=false;
    this.show_prod_specs=true;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  selectProdSpec(){
    let catalog_button = document.getElementById('catalogs-button')
    let prodSpec_button = document.getElementById('prod-spec-button')
    let serviceSpec_button = document.getElementById('sev-spec-button')
    let resourceSpec_button = document.getElementById('res-spec-button')
    let offer_button = document.getElementById('offers-button')

    this.selectMenu(prodSpec_button,'text-white bg-primary-100');
    this.unselectMenu(catalog_button,'text-white bg-primary-100');
    this.unselectMenu(serviceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(resourceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(offer_button,'text-white bg-primary-100');
  }

  goToServiceSpec(){
    this.setActiveSection('servicespec'); 
    this.selectServiceSpec();
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=true;
    this.show_resource_specs=false;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  selectServiceSpec(){
    let catalog_button = document.getElementById('catalogs-button')
    let prodSpec_button = document.getElementById('prod-spec-button')
    let serviceSpec_button = document.getElementById('sev-spec-button')
    let resourceSpec_button = document.getElementById('res-spec-button')
    let offer_button = document.getElementById('offers-button')

    this.selectMenu(serviceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(catalog_button,'text-white bg-primary-100');
    this.unselectMenu(prodSpec_button,'text-white bg-primary-100');
    this.unselectMenu(resourceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(offer_button,'text-white bg-primary-100');
  }

  goToResourceSpec(){
    this.setActiveSection('resourcespec'); 
    this.selectResourceSpec();
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=true;
    this.show_offers=false;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  selectResourceSpec(){
    let catalog_button = document.getElementById('catalogs-button')
    let prodSpec_button = document.getElementById('prod-spec-button')
    let serviceSpec_button = document.getElementById('sev-spec-button')
    let resourceSpec_button = document.getElementById('res-spec-button')
    let offer_button = document.getElementById('offers-button')

    this.selectMenu(resourceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(catalog_button,'text-white bg-primary-100');
    this.unselectMenu(prodSpec_button,'text-white bg-primary-100');
    this.unselectMenu(serviceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(offer_button,'text-white bg-primary-100');
  }

  goToOffers(){
    this.setActiveSection('offers'); 
    this.selectOffers();
    this.show_catalogs=false;
    this.show_prod_specs=false;
    this.show_service_specs=false;
    this.show_resource_specs=false;
    this.show_offers=true;
    this.show_create_prod_spec=false;
    this.show_create_res_spec=false;
    this.show_create_serv_spec=false;
    this.show_create_offer=false;
    this.show_update_prod_spec=false;
    this.show_update_res_spec=false;
    this.show_update_serv_spec=false;
    this.show_update_offer=false;
    this.show_update_catalog=false;
    this.show_create_catalog=false;
    this.cdr.detectChanges();
  }

  selectOffers(){
    let catalog_button = document.getElementById('catalogs-button')
    let prodSpec_button = document.getElementById('prod-spec-button')
    let serviceSpec_button = document.getElementById('sev-spec-button')
    let resourceSpec_button = document.getElementById('res-spec-button')
    let offer_button = document.getElementById('offers-button')

    this.selectMenu(offer_button,'text-white bg-primary-100');
    this.unselectMenu(catalog_button,'text-white bg-primary-100');
    this.unselectMenu(prodSpec_button,'text-white bg-primary-100');
    this.unselectMenu(serviceSpec_button,'text-white bg-primary-100');
    this.unselectMenu(resourceSpec_button,'text-white bg-primary-100');
  }

  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  unselectMenu(elem:HTMLElement | null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        this.removeClass(elem,cls)
      } else {
        console.log('already unselected')
      }
    }
  }

  selectMenu(elem:HTMLElement| null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        console.log('already selected')
      } else {
        this.addClass(elem,cls)
      }
    }
  }

}
