import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {components} from "src/app/models/product-catalog";
import { environment } from 'src/environments/environment';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { ProductSpecServiceService } from 'src/app/services/product-spec-service.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import {EventMessageService} from "src/app/services/event-message.service";
import {AttachmentServiceService} from "src/app/services/attachment-service.service";
import { ServiceSpecServiceService } from 'src/app/services/service-spec-service.service';
import { ResourceSpecServiceService } from 'src/app/services/resource-spec-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { LoginInfo } from 'src/app/models/interfaces';
import { initFlowbite } from 'flowbite';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { currencies } from 'currencies.json';
import { certifications } from 'src/app/models/certification-standards.const';
import {ProductOfferingPrice_DTO} from 'src/app/models/interfaces';
import { lastValueFrom } from 'rxjs';

type ProductOffering_Create = components["schemas"]["ProductOffering_Create"];
type BundledProductOffering = components["schemas"]["BundledProductOffering"];
type ProductOfferingPriceRefOrValue = components["schemas"]["ProductOfferingPriceRefOrValue"];
type ProductOfferingPrice = components["schemas"]["ProductOfferingPrice"]


@Component({
  selector: 'create-offer',
  templateUrl: './create-offer.component.html',
  styleUrl: './create-offer.component.css'
})
export class CreateOfferComponent implements OnInit {

  //PAGE SIZES:
  PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;
  PRODUCT_LIMIT: number = environment.PRODUCT_LIMIT;
  CATALOG_LIMIT: number= environment.CATALOG_LIMIT;
  BUNDLE_ENABLED: boolean= environment.BUNDLE_ENABLED;

  //CONTROL VARIABLES:
  showGeneral:boolean=true;
  showBundle:boolean=false;
  showSummary:boolean=false;
  showProdSpec:boolean=false;
  showCatalog:boolean=false;
  showCategory:boolean=false;
  showLicense:boolean=false;
  showSLA:boolean=false;
  showPrice:boolean=false;
  showProcurement:boolean=false;

  //Check if step was done
  generalDone:boolean=false;
  bundleDone:boolean=false;
  prodSpecDone:boolean=false;
  catalogsDone:boolean=false;
  categoriesDone:boolean=false;
  licenseDone:boolean=false;
  slaDone:boolean=false;
  priceDone:boolean=false;
  procurementDone:boolean=false;
  finishDone:boolean=false;
  replicationDone:boolean=false;

  stepsElements:string[]=['general-info','bundle','prodspec','catalog','category','license','sla','price', 'procurement', 'replication','summary'];
  stepsCircles:string[]=['general-circle','bundle-circle','prodspec-circle','catalog-circle','category-circle','license-circle','sla-circle','price-circle', 'procurement-circle', 'replication-circle','summary-circle'];

  showPreview:boolean=false;
  showEmoji:boolean=false;
  description:string='';  
  partyId:any='';

  //OFFER GENERAL INFO:
  generalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    version: new FormControl('0.1', [Validators.required,Validators.pattern('^-?[0-9]\\d*(\\.\\d*)?$')]),
    description: new FormControl(''),
  });

  //BUNDLE INFO:
  bundleChecked:boolean=false;
  bundlePage=0;
  bundlePageCheck:boolean=false;
  loadingBundle:boolean=false;
  loadingBundle_more:boolean=false;
  bundledOffers:any[]=[];
  nextBundledOffers:any[]=[];
  //final selected products inside bundle
  offersBundle:BundledProductOffering[]=[];

  //PROD SPEC INFO:
  prodSpecPage=0;
  prodSpecPageCheck:boolean=false;
  loadingProdSpec:boolean=false;
  loadingProdSpec_more:boolean=false;
  selectedProdSpec:any={id:''};
  prodSpecs:any[]=[];
  nextProdSpecs:any[]=[];

  //CATALOG INFO:
  catalogPage=0;
  catalogPageCheck:boolean=false;
  loadingCatalog:boolean=false;
  loadingCatalog_more:boolean=false;
  selectedCatalog:any={id:''};
  catalogs:any[]=[];
  nextCatalogs:any[]=[];

  //CATEGORIES
  loadingCategory:boolean=false;
  selectedCategories:any[]=[];
  unformattedCategories:any[]=[];
  categories:any[]=[];

  //LICENSE
  freeLicenseSelected:boolean=true;
  licenseForm = new FormGroup({
    treatment: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });
  licenseDescription:string='';
  createdLicense:any={
    treatment: '',
    description: ''
  };

  //SLA
  createdSLAs:any[]=[];
  availableSLAs:any[]=['UPDATES RATE', 'RESPONSE TIME', 'DELAY'];
  showCreateSLA:boolean=false;
  updatesSelected:boolean=true;
  responseSelected:boolean=false;
  delaySelected:boolean=false;
  creatingSLA:any={type:'UPDATES RATE',description:'Expected number of updates in the given period.',threshold:'',unitMeasure:'day'}

  //PRICE
  currencies=currencies;
  createdPrices:ProductOfferingPrice_DTO[]=[];
  postedPrices:any[]=[];
  creatingPrice:any;
  priceDescription:string='';
  priceComponentDescription:string='';
  showCreatePrice:boolean=false;
  toggleOpenPrice:boolean=false;
  oneTimeSelected:boolean=true;
  recurringSelected:boolean=false;
  selectedPeriod:any='DAILY';
  selectedPeriodAlter:any='DAILY';
  usageSelected:boolean=false;
  customSelected:boolean=false;

  validPriceCheck:boolean=true;
  selectedPriceUnit:any=currencies[2].code;
  priceTypeAlter:any='ONE TIME';
  priceComponentSelected:boolean=false;
  discountSelected:boolean=false;
  noAlterSelected:boolean=true;
  allowCustom:boolean=true;
  allowOthers:boolean=true;
  priceToUpdate:any;
  selectedPriceType:any='CUSTOM';
  editPrice:boolean=false;
  showPriceComponents:boolean=false;

  //PRICECOMPONENT
  selectedCharacteristic:any=undefined;
  touchedCharCheck:boolean=false;
  selectedCharacteristicVal:any
  showValueSelect:boolean=false;
  isDiscount:boolean=false;
  createdPriceComponents:any[]=[];  
  createdPriceAlterations:any[]=[];
  createdPriceProfile:any;
  createdPriceComponentsRelatedToPlan:any[]=[];
  createdPriceAlterationsRelatedToPlan:any[]=[];
  hideStringCharOption:boolean=true;

  //PRICEPROFILE
  showProfile:boolean=false;
  editProfile:boolean=false;

  //PROCUREMENT
  procurementModes = [{
    id: 'manual',
    name: 'Manual'
  }, {
    id: 'payment-automatic',
    name: 'Payment Automatic - Procurement Manual'
  }, {
    id: 'automatic',
    name: 'Automatic'
  }];
  procurementMode: string = 'manual';

  //REPLICATION
  showReplication:boolean=false;
  selectedCountries:any[]=[];

  errorMessage:any='';
  showError:boolean=false;

  //FINAL OFFER USING API CALL STRUCTURE
  offerToCreate:ProductOffering_Create | undefined;

  @ViewChild('updatemetric') updatemetric!: ElementRef;
  @ViewChild('responsemetric') responsemetric!: ElementRef;
  @ViewChild('delaymetric') delaymetric!: ElementRef;
  @ViewChild('usageUnit') usageUnit!: ElementRef;
  @ViewChild('usageUnitAlter') usageUnitAlter!: ElementRef;
  @ViewChild('usageUnitUpdate') usageUnitUpdate!: ElementRef;

  constructor(
    private router: Router,
    private api: ApiServiceService,
    private prodSpecService: ProductSpecServiceService,
    private cdr: ChangeDetectorRef,
    private localStorage: LocalStorageService,
    private eventMessage: EventMessageService,
    private elementRef: ElementRef,
    private attachmentService: AttachmentServiceService,
    private servSpecService: ServiceSpecServiceService,
    private resSpecService: ResourceSpecServiceService,
    private paginationService: PaginationService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'CategoryAdded') {
        this.addCategory(ev.value);
      }
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
      if(ev.type === 'SavePricePlan') {
        this.createdPrices.push(ev.value as ProductOfferingPrice_DTO)
        if(this.showCreatePrice){
          this.showCreatePrice=false;
        }
      }
      if(ev.type === 'UpdatePricePlan') {
        let price = ev.value as ProductOfferingPrice_DTO
        const index = this.createdPrices.findIndex((item) => item.id === price.id);
        if(index!=-1){
          console.log('updating price values...')
          //this.createdPrices[index]=price;
          this.createdPrices = this.createdPrices.map((item, index) => 
            index === index ? price : item
          );
        }
        if(this.editPrice){
          this.editPrice=false;
        }
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if(this.showEmoji==true){
      this.showEmoji=false;
      this.cdr.detectChanges();
    }
    if(this.showPriceComponents==true){
      this.showPriceComponents=false;
      this.cdr.detectChanges();
    }
    if(this.showProfile==true){
      this.showProfile=false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.initPartyInfo();
  }

  initPartyInfo(){
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      if(aux.logged_as==aux.id){
        this.partyId = aux.partyId;
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
        this.partyId = loggedOrg.partyId
      }
    }
  }

  goBack() {
    this.eventMessage.emitSellerOffer(true);
  }

  toggleGeneral(){
    this.selectStep('general-info','general-circle');
    this.showBundle=false;
    this.showGeneral=true;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleBundle(){
    this.selectStep('bundle','bundle-circle');
    this.showBundle=true;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleBundleCheck(){
    this.bundledOffers=[];
    this.bundlePage=0;
    this.bundleChecked=!this.bundleChecked;
    if(this.bundleChecked==true){
      this.loadingBundle=true;
      this.getSellerOffers(false);
    } else {
      this.offersBundle=[];
    }
  }

  toggleProdSpec(){
    this.prodSpecs=[];
    this.prodSpecPage=0;
    this.loadingProdSpec=true;
    this.getSellerProdSpecs(false);
    this.selectStep('prodspec','prodspec-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=true;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleCatalogs(){
    this.catalogs=[];
    this.catalogPage=0;
    this.loadingCatalog=true;
    this.getSellerCatalogs(false);
    this.selectStep('catalog','catalog-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=true;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleCategories(){
    this.categories=[];
    this.loadingCategory=true;
    this.getCategories();
    console.log('CATEGORIES FORMATTED')
    console.log(this.categories)
    this.selectStep('category','category-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=true;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleLicense(){
    this.selectStep('license','license-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=true;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  toggleSLA(){
    this.saveLicense();
    this.selectStep('sla','sla-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=true;
    this.showPrice=false;
    this.showProcurement=false;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  togglePrice(){
    this.saveLicense();
    this.selectStep('price','price-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=true;
    this.showProcurement=false;
    this.showPreview=false;
    this.showReplication=false;
    this.editPrice=false;
    this.showCreatePrice=false;
    initFlowbite();
  }

  toggleProcurement() {
    this.selectStep('procurement','procurement-circle');

    this.priceDone=true;
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=true;
    this.showPreview=false;
    this.showReplication=false;
    this.editPrice=false;
    this.showCreatePrice=false;
    initFlowbite();
  }

  toggleReplication(){
    this.procurementDone=true;
    this.selectStep('replication','replication-circle');
    this.showBundle=false;
    this.showGeneral=false;
    this.showSummary=false;
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showProcurement=false;
    this.showPreview=false;
    this.showReplication=true;
    this.editPrice=false;
    this.showCreatePrice=false;
    initFlowbite();
  }

  saveLicense(){
    if(this.licenseForm.value.treatment){
      this.createdLicense={
        treatment: this.licenseForm.value.treatment,
        description: this.licenseForm.value.description ? this.licenseForm.value.description : ''
      };
    } else {
      this.createdLicense={
        treatment: '',
        description: ''
      };      
    }
    this.showPreview=false;
  }

  clearLicense(){
    this.freeLicenseSelected=!this.freeLicenseSelected;
    this.licenseForm.controls['treatment'].setValue('');
    this.licenseForm.controls['description'].setValue('');
    this.createdLicense={
      treatment: '',
      description: ''
    };
    console.log(this.createdLicense.treatment)
  }



  removePrice(price:any){
    const index = this.createdPrices.findIndex(item => item.id === price.id);
    if (index !== -1) {
      this.createdPrices.splice(index, 1);
    }
  }

  showNewPrice(){
    this.priceToUpdate=undefined;
    this.showCreatePrice=!this.showCreatePrice;
    this.editPrice=false;
  }

  showEditPrice(price:any){
    this.editPrice=!this.editPrice;
    this.priceToUpdate=price;
    this.showCreatePrice=false;
  }

  onSLAMetricChange(event: any) {
    this.creatingSLA.unitMeasure=event.target.value;
  }

  onSLAChange(event: any) {
    if(event.target.value=='UPDATES RATE'){
      this.updatesSelected=true;
      this.responseSelected=false;
      this.delaySelected=false;
      this.creatingSLA.type='UPDATES RATE';
      this.creatingSLA.description='Expected number of updates in the given period.';
      this.creatingSLA.unitMeasure='day';
    }else if (event.target.value=='RESPONSE TIME'){
      this.updatesSelected=false;
      this.responseSelected=true;
      this.delaySelected=false;
      this.creatingSLA.type='RESPONSE TIME';
      this.creatingSLA.description='Total amount of time to respond to a data request (GET).';
      this.creatingSLA.unitMeasure='ms';
    }else if (event.target.value=='DELAY'){
      this.updatesSelected=false;
      this.responseSelected=false;
      this.delaySelected=true;
      this.creatingSLA.type='DELAY';
      this.creatingSLA.description='Total amount of time to deliver a new update (SUBSCRIPTION).';
      this.creatingSLA.unitMeasure='ms';
    }
  }

  showCreateSLAMetric(){
    if(this.availableSLAs[0]=='UPDATES RATE'){
      this.updatesSelected=true;
      this.responseSelected=false;
      this.delaySelected=false;
      this.creatingSLA.type='UPDATES RATE';
      this.creatingSLA.description='Expected number of updates in the given period.';
      this.creatingSLA.unitMeasure='day';
    }else if (this.availableSLAs[0]=='RESPONSE TIME'){
      this.updatesSelected=false;
      this.responseSelected=true;
      this.delaySelected=false;
      this.creatingSLA.type='RESPONSE TIME';
      this.creatingSLA.description='Total amount of time to respond to a data request (GET).';
      this.creatingSLA.unitMeasure='ms';
    }else if (this.availableSLAs[0]=='DELAY'){
      this.updatesSelected=false;
      this.responseSelected=false;
      this.delaySelected=true;
      this.creatingSLA.type='DELAY';
      this.creatingSLA.description='Total amount of time to deliver a new update (SUBSCRIPTION).';
      this.creatingSLA.unitMeasure='ms';
    }
    this.showCreateSLA=true;
  }

  addSLA(){
    const index = this.availableSLAs.findIndex(item => item === this.creatingSLA.type);
    if(this.updatesSelected == true){
      this.creatingSLA.threshold=this.updatemetric.nativeElement.value;
      this.createdSLAs.push({type: this.creatingSLA.type, description: this.creatingSLA.description, threshold: this.creatingSLA.threshold, unitMeasure: this.creatingSLA.unitMeasure});
      this.availableSLAs.splice(index, 1);
      this.updatesSelected=false;
    } else if (this.responseSelected == true){
      this.creatingSLA.threshold=this.responsemetric.nativeElement.value;
      this.createdSLAs.push({type: this.creatingSLA.type, description: this.creatingSLA.description, threshold: this.creatingSLA.threshold, unitMeasure: this.creatingSLA.unitMeasure});
      this.availableSLAs.splice(index, 1);
      this.responseSelected=false;
    } else {
      this.creatingSLA.threshold=this.delaymetric.nativeElement.value;
      this.createdSLAs.push({type: this.creatingSLA.type, description: this.creatingSLA.description, threshold: this.creatingSLA.threshold, unitMeasure: this.creatingSLA.unitMeasure});
      this.availableSLAs.splice(index, 1);
      this.delaySelected=false;
    }
    this.showCreateSLA=false;
  }

  removeSLA(sla:any){
    const index = this.createdSLAs.findIndex(item => item.type === sla.type);
    if (index !== -1) {
      this.createdSLAs.splice(index, 1);
    }
    this.availableSLAs.push(sla.type)
  }

  checkThreshold(){
    if(this.updatesSelected == true){
      if(this.updatemetric.nativeElement.value == ''){
        return true
      } else {
        return false
      }
    } else if (this.responseSelected == true){
      if(this.responsemetric.nativeElement.value == ''){
        return true
      } else {
        return false
      }
    } else {
      if(this.delaymetric.nativeElement.value == ''){
        return true
      } else {
        return false
      }
    }
  }

  getCategories(){
    console.log('Getting categories...')
    this.api.getLaunchedCategories().then(data => {      
      for(let i=0; i < data.length; i++){
        this.findChildren(data[i],data);
        this.unformattedCategories.push(data[i]);
      }
      this.loadingCategory=false;
      this.cdr.detectChanges();
      initFlowbite();
    }) 
  }

  findChildren(parent:any,data:any[]){
    let childs = data.filter((p => p.parentId === parent.id));
    parent["children"] = childs;
    if(parent.isRoot == true){
      this.categories.push(parent)
    } else {
      this.saveChildren(this.categories,parent)
    }
    if(childs.length != 0){
      for(let i=0; i < childs.length; i++){
        this.findChildren(childs[i],data)
      }
    }
  }

  findChildrenByParent(parent:any){
    let childs: any[] = []
    this.api.getCategoriesByParentId(parent.id).then(c => {
      childs=c;
      parent["children"] = childs;
      if(parent.isRoot == true){
        this.categories.push(parent)
      } else {
        this.saveChildren(this.categories,parent)
      }
      if(childs.length != 0){
        for(let i=0; i < childs.length; i++){
          this.findChildrenByParent(childs[i])
        }
      }
      initFlowbite();
    })

  }

  saveChildren(superCategories:any[],parent:any){
    for(let i=0; i < superCategories.length; i++){
      let children = superCategories[i].children;
      if (children != undefined){
        let check = children.find((element: { id: any; }) => element.id == parent.id) 
        if (check != undefined) {
          let idx = children.findIndex((element: { id: any; }) => element.id == parent.id)
          children[idx] = parent
          superCategories[i].children = children         
        }
        this.saveChildren(children,parent)
      }          
    }
  }

  addParent(parentId:any){    
    const index = this.unformattedCategories.findIndex(item => item.id === parentId);
    if (index != -1) {
      //Si el padre no está seleccionado se añade a la selección      
      if(this.unformattedCategories[index].isRoot==false){
        this.addCategory(this.unformattedCategories[index])
      } else {
        this.selectedCategories.push(this.unformattedCategories[index]);
      }
    }
  }

  addCategory(cat:any){
    const index = this.selectedCategories.findIndex(item => item.id === cat.id);
    if (index !== -1) {
      console.log('eliminar')
      this.selectedCategories.splice(index, 1);
    } else {
      console.log('añadir')
      this.selectedCategories.push(cat);
    } 

    if(cat.isRoot==false){
      //const parentIdx = this.categories.findIndex(item => item.id === cat.parentId);
      const parentIdxSelected = this.selectedCategories.findIndex(item => item.id === cat.parentId);
      if (index==-1 && parentIdxSelected == -1) {
        this.addParent(cat.parentId);     
      }
    }
    console.log(this.selectedCategories)
    this.cdr.detectChanges();
    console.log(this.selectedCategories)
  }

  isCategorySelected(cat:any){
    const index = this.selectedCategories.findIndex(item => item.id === cat.id);
    if (index !== -1) {
      return true;
    } else {
      return false;
    } 
  }

  selectCatalog(cat:any){
    this.selectedCatalog=cat;
    this.selectedCategories=[];
  }

  async getSellerCatalogs(next:boolean){
    if(next==false){
      this.loadingCatalog=true;
    }
    
    let options = {
      "keywords": undefined,
      "filters": ['Active','Launched'],
      "partyId": this.partyId
    }

    this.paginationService.getItemsPaginated(this.catalogPage, this.CATALOG_LIMIT, next, this.catalogs,this.nextCatalogs, options,
      this.api.getCatalogsByUser.bind(this.api)).then(data => {
      this.catalogPageCheck=data.page_check;      
      this.catalogs=data.items;
      this.nextCatalogs=data.nextItems;
      this.catalogPage=data.page;
      this.loadingCatalog=false;
      this.loadingCatalog_more=false;
    })
  }

  async nextCatalog(){
    await this.getSellerCatalogs(true);
  }

  selectProdSpec(prod:any){
    this.selectedProdSpec=prod;
  }

  async getSellerProdSpecs(next:boolean){
    if(next==false){
      this.loadingProdSpec=true;
    }
    
    let options = {
      "filters": ['Active','Launched'],
      "partyId": this.partyId,
      //"sort": undefined,
      //"isBundle": false
    }

    this.paginationService.getItemsPaginated(this.prodSpecPage, this.PROD_SPEC_LIMIT, next, this.prodSpecs,this.nextProdSpecs, options,
      this.prodSpecService.getProdSpecByUser.bind(this.prodSpecService)).then(data => {
      this.prodSpecPageCheck=data.page_check;      
      this.prodSpecs=data.items;
      this.nextProdSpecs=data.nextItems;
      this.prodSpecPage=data.page;
      this.loadingProdSpec=false;
      this.loadingProdSpec_more=false;
    })
  }

  async nextProdSpec(){
    await this.getSellerProdSpecs(true);
  }

  async getSellerOffers(next:boolean){
    if(next==false){
      this.loadingBundle=true;
    }
    
    let options = {
      "filters": ['Active','Launched'],
      "partyId": this.partyId,
      "sort": undefined,
      "isBundle": false
    }

    this.paginationService.getItemsPaginated(this.bundlePage, this.PRODUCT_LIMIT, next, this.bundledOffers,this.nextBundledOffers, options,
      this.api.getProductOfferByOwner.bind(this.api)).then(data => {
      this.bundlePageCheck=data.page_check;      
      this.bundledOffers=data.items;
      this.nextBundledOffers=data.nextItems;
      this.bundlePage=data.page;
      this.loadingBundle=false;
      this.loadingBundle_more=false;
    })
  }

  async nextBundle(){
    await this.getSellerOffers(true);
  }

  addProdToBundle(prod:any){
    const index = this.offersBundle.findIndex(item => item.id === prod.id);
    if (index !== -1) {
      console.log('eliminar')
      this.offersBundle.splice(index, 1);
    } else {
      console.log('añadir')
      this.offersBundle.push({
        id: prod.id,
        href: prod.href,
        lifecycleStatus: prod.lifecycleStatus,
        name: prod.name
      });
    }    
    this.cdr.detectChanges();
    console.log(this.offersBundle)
  }

  isProdInBundle(prod:any){
    const index = this.offersBundle.findIndex(item => item.id === prod.id);
    if (index !== -1) {
      return true
    } else {
      return false;
    } 
  }

  showFinish(){
    this.priceDone=true;
    this.finishDone=true;
    this.saveLicense();
    if(this.generalForm.value.name && this.generalForm.value.version){
      this.offerToCreate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        version: this.generalForm.value.version,
        lifecycleStatus: "Active",
      }
    }

    this.selectStep('summary','summary-circle');
    this.showBundle=false;
    this.showGeneral=false;    
    this.showProdSpec=false;
    this.showCatalog=false;
    this.showCategory=false;
    this.showLicense=false;
    this.showSLA=false;
    this.showPrice=false;
    this.showSummary=true;
    this.showReplication=false;
    this.showPreview=false;
    this.editPrice=false;
    this.showCreatePrice=false;
  }

  changeProcurement(event: any) {
    this.procurementMode = event.target.value;
  }

  async createOffer(){
    this.postedPrices=[];
    if(this.createdPrices.length>0){
      for(let i=0; i < this.createdPrices.length; i++){
        if(this.createdPrices[i].isBundle==true){
          let components=this.createdPrices[i].bundledPopRelationship;
          let compRel:any[]=[];
          if(components != undefined){
            for(let j=0;j<components.length;j++){
              //Creating price component
              let priceCompToCreate: ProductOfferingPrice = {        
                name: components[j].name,
                description: components[j].description,
                lifecycleStatus: components[j].lifecycleStatus,
                priceType: components[j].priceType,
                price: {
                  unit: components[j]?.price?.unit,
                  value: components[j]?.price?.value
                }
              }
              if(components[j].priceType=='recurring'){
                priceCompToCreate.recurringChargePeriodType=components[j].recurringChargePeriodType;
                priceCompToCreate.recurringChargePeriodLength=components[j].recurringChargePeriodLength;
              }
              if(components[j].priceType=='recurring-prepaid'){
                priceCompToCreate.recurringChargePeriodType=components[j].recurringChargePeriodType;
                priceCompToCreate.recurringChargePeriodLength=components[j].recurringChargePeriodLength;
              }
              if(components[j].priceType=='usage'){
                priceCompToCreate.unitOfMeasure=components[j].unitOfMeasure
              }
              if(components[j].prodSpecCharValueUse){
                priceCompToCreate.prodSpecCharValueUse=components[j].prodSpecCharValueUse
              }
              if(components[j].unitOfMeasure){
                priceCompToCreate.unitOfMeasure=components[j].unitOfMeasure
              }
              let priceAlterations = components[j].popRelationship;
              if(priceAlterations != undefined){
                //Creating price alteration
                let priceAlterToCreate: ProductOfferingPrice ={
                  name: priceAlterations[0]?.name,
                  priceType: priceAlterations[0]?.priceType,
                  validFor: priceAlterations[0]?.validFor,
                }
                if(priceAlterations[0].percentage){
                  priceAlterToCreate.percentage = priceAlterations[0]?.percentage;
                } else {
                  priceAlterToCreate.price = priceAlterations[0]?.price;
                }
                try{
                  let priceAlterCreated = await lastValueFrom(this.api.postOfferingPrice(priceAlterToCreate))
                  console.log('price Alteration')
                  console.log(priceAlterCreated)
                  priceCompToCreate.popRelationship=[{
                    id: priceAlterCreated.id,
                    href: priceAlterCreated.id,
                    name: priceAlterCreated.name
                  }]
                } catch (error:any) {
                  console.error('There was an error while creating offers price!', error);
                  if(error.error.error){
                    console.log(error)
                    this.errorMessage='Error: '+error.error.error;
                  } else {
                    this.errorMessage='There was an error while creating offers price!';
                  }
                  this.showError=true;
                  setTimeout(() => {
                    this.showError = false;
                  }, 3000);     
                }
              }
              try{
                let priceCompCreated = await lastValueFrom(this.api.postOfferingPrice(priceCompToCreate))
                compRel.push({
                  id: priceCompCreated.id,
                  href: priceCompCreated.id,
                  name: priceCompCreated.name
                }) 
                console.log('componente')
                console.log(priceCompCreated)
              } catch (error:any) {
                console.error('There was an error while creating offers price!', error);
                if(error.error.error){
                  console.log(error)
                  this.errorMessage='Error: '+error.error.error;
                } else {
                  this.errorMessage='There was an error while creating offers price!';
                }
                this.showError=true;
                setTimeout(() => {
                  this.showError = false;
                }, 3000);     
              }
            }
            //Creating price plan
            let priceToCreate: ProductOfferingPrice = {
              name: this.createdPrices[i].name,
              isBundle: true,
              description: this.createdPrices[i].description,
              lifecycleStatus: this.createdPrices[i].lifecycleStatus,
              bundledPopRelationship: compRel
            }
            if(this.createdPrices[i].prodSpecCharValueUse){
              priceToCreate.prodSpecCharValueUse=this.createdPrices[i].prodSpecCharValueUse
            }
            if(this.createdPrices[i].unitOfMeasure){
              priceToCreate.unitOfMeasure=this.createdPrices[i].unitOfMeasure
            }
            try{
              let pricePlanCreated = await lastValueFrom(this.api.postOfferingPrice(priceToCreate))
              console.log('precio')
              console.log(pricePlanCreated)
              this.createdPrices[i].id=pricePlanCreated.id;
              if(i==this.createdPrices.length-1){
                this.saveOfferInfo();
              }
            } catch (error:any){
              console.error('There was an error while creating offers price!', error);
              if(error.error.error){
                console.log(error)
                this.errorMessage='Error: '+error.error.error;
              } else {
                this.errorMessage='There was an error while creating offers price!';
              }
              this.showError=true;
              setTimeout(() => {
                this.showError = false;
              }, 3000);
            }
        }
        }else{  
          //Not bundled price plan        
          let priceToCreate: ProductOfferingPrice = {
            name: this.createdPrices[i].name,
            isBundle: false,
            description: this.createdPrices[i].description,
            lifecycleStatus: this.createdPrices[i].lifecycleStatus,
            priceType: this.createdPrices[i].priceType,   
          }
          if(this.createdPrices[i].priceType!='custom'){
            priceToCreate.price= {
              unit: this.createdPrices[i]?.price?.unit,
              value: this.createdPrices[i]?.price?.value
            }
          }
          if(this.createdPrices[i].priceType=='recurring'){
            priceToCreate.recurringChargePeriodType=this.createdPrices[i].recurringChargePeriodType;
            priceToCreate.recurringChargePeriodLength=this.createdPrices[i].recurringChargePeriodLength;
          }
          if(this.createdPrices[i].priceType=='recurring-prepaid'){
            priceToCreate.recurringChargePeriodType=this.createdPrices[i].recurringChargePeriodType;
            priceToCreate.recurringChargePeriodLength=this.createdPrices[i].recurringChargePeriodLength;
          }
          if(this.createdPrices[i].priceType=='usage'){
            priceToCreate.unitOfMeasure=this.createdPrices[i].unitOfMeasure
          }
          if(this.createdPrices[i].prodSpecCharValueUse){
            priceToCreate.prodSpecCharValueUse=this.createdPrices[i].prodSpecCharValueUse;
          }
          if(this.createdPrices[i].unitOfMeasure){
            priceToCreate.unitOfMeasure=this.createdPrices[i].unitOfMeasure
          }
          try{
            let createdPrices = await lastValueFrom(this.api.postOfferingPrice(priceToCreate))
            console.log('precio')
            console.log(createdPrices)
            this.createdPrices[i].id=createdPrices.id;
            if(i==this.createdPrices.length-1){
              this.saveOfferInfo();
            }
          } catch (error:any){
            console.error('There was an error while creating offers price!', error);
            if(error.error.error){
              console.log(error)
              this.errorMessage='Error: '+error.error.error;
            } else {
              this.errorMessage='There was an error while creating offers price!';
            }
            this.showError=true;
            setTimeout(() => {
              this.showError = false;
            }, 3000);
          }
        }
      }
    } else {
      this.createdPrices=[];
      this.saveOfferInfo();
    }
    console.log(this.offerToCreate)
  }

  saveOfferInfo(){
    let offercats = [];
    let offerprices = [];
    for(let i = 0; i < this.selectedCategories.length; i++){
      offercats.push({
        id: this.selectedCategories[i].id,
        href: this.selectedCategories[i].id
      })
    }
    for(let i = 0; i < this.createdPrices.length; i++){
      offerprices.push({
        id: this.createdPrices[i].id,
        href: this.createdPrices[i].id
      })
    }
    if(this.generalForm.value.name!=null && this.generalForm.value.version!=null){
      this.offerToCreate={
        name: this.generalForm.value.name,
        description: this.generalForm.value.description != null ? this.generalForm.value.description : '',
        lifecycleStatus: "Active",
        isBundle: this.bundleChecked,
        bundledProductOffering: this.offersBundle,
        place: [],
        version: this.generalForm.value.version,
        category: offercats,
        productOfferingPrice: offerprices,
        validFor: {
          startDateTime: (new Date()).toISOString()
        },
      }
      if(!this.bundleChecked){
        this.offerToCreate.productSpecification = {
          id: this.selectedProdSpec.id,
          href: this.selectedProdSpec.id
        }
      }
      if(!this.freeLicenseSelected && this.createdLicense.treatment!=''){
        this.offerToCreate.productOfferingTerm= [
          {
              name: this.createdLicense.treatment,
              description: this.createdLicense.description,
              validFor: {}
          }
        ]
      } else {
        this.offerToCreate.productOfferingTerm = [
          {
              name: '',
              description: '',
              validFor: {}
          }
        ]        
      }

      this.offerToCreate.productOfferingTerm.push({
        name: 'procurement',
        description: this.procurementMode,
      })
    }

    this.api.postProductOffering(this.offerToCreate,this.selectedCatalog.id).subscribe({
      next: data => {
        console.log('product offer created:')
        console.log(data)
        /*if(this.createdSLAs.length!=0){
          let sla = {
            offerId: data.id,
            services: this.createdSLAs
          }
          this.api.postSLA(sla).subscribe({
            next: data => {
              console.log('SLA')
              console.log(data)              
            },
            error: error => {
              console.error('There was an error while updating!', error);
            }
          });
        }*/
        this.goBack();
      },
      error: error => {
        console.error('There was an error while creating the offer!', error);
        if(error.error.error){
          console.log(error)
          this.errorMessage='Error: '+error.error.error;
        } else {
          this.errorMessage='There was an error while creating the offer!';
        }
        this.showError=true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    });
  }

  //STEPS CSS EFFECTS:
  selectStep(step:string, stepCircle:string){
    const index = this.stepsElements.findIndex(item => item === step);
    if (index !== -1) {
      this.stepsElements.splice(index, 1);
      this.selectMenu(document.getElementById(step),'text-primary-100 dark:text-primary-50')
      this.unselectMenu(document.getElementById(step),'text-gray-500') 
      for(let i=0; i<this.stepsElements.length;i++){
        this.unselectMenu(document.getElementById(this.stepsElements[i]),'text-primary-100 dark:text-primary-50')
        this.selectMenu(document.getElementById(this.stepsElements[i]),'text-gray-500') 
      }
      this.stepsElements.push(step);
    }
    const circleIndex = this.stepsCircles.findIndex(item => item === stepCircle);
    if (index !== -1) {
      this.stepsCircles.splice(circleIndex, 1);
      this.selectMenu(document.getElementById(stepCircle),'border-primary-100 dark:border-primary-50')
      this.unselectMenu(document.getElementById(stepCircle),'border-gray-400');
      for(let i=0; i<this.stepsCircles.length;i++){
        this.unselectMenu(document.getElementById(this.stepsCircles[i]),'border-primary-100 dark:border-primary-50')
        this.selectMenu(document.getElementById(this.stepsCircles[i]),'border-gray-400');
      }
      this.stepsCircles.push(stepCircle);
    }
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

  //Markdown actions:
  addBold() {
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + ' **bold text** '
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + ' **bold text** '
      });    
    }
  }

  addItalic() {
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + ' _italicized text_ '
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + ' _italicized text_ '
      });    
    }
  }

  addList(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n- First item\n- Second item'
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n- First item\n- Second item'
      });    
    }
  }

  addOrderedList(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n1. First item\n2. Second item'
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n1. First item\n2. Second item'
      });    
    }
  }

  addCode(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n`code`'
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n`code`'
      });    
    }
  }

  addCodeBlock(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n```\ncode\n```'
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n```\ncode\n```'
      });    
    }
  }

  addBlockquote(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n> blockquote'
      }); 
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n> blockquote'
      });    
    }   
  }

  addLink(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + ' [title](https://www.example.com) '
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + ' [title](https://www.example.com) '
      });    
    } 
  } 

  addTable(){
    if(this.showGeneral){
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + '\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |'
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + '\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |'
      });    
    }
  }

  addEmoji(event:any){
    if(this.showGeneral){
      this.showEmoji=false;
      const currentText = this.generalForm.value.description;
      this.generalForm.patchValue({
        description: currentText + event.emoji.native
      });
    } else if(this.showLicense){
      const currentText = this.licenseForm.value.description;
      this.licenseForm.patchValue({
        description: currentText + event.emoji.native
      });    
    }
  }

  togglePreview(){
    if(this.showGeneral){
      if(this.generalForm.value.description){
        this.description=this.generalForm.value.description;
      } else {
        this.description=''
      }
    } else if(this.showLicense) {
      if(this.licenseForm.value.description){
        this.licenseDescription=this.licenseForm.value.description;
      } else {
        this.licenseDescription=''
      }
    }
  }
}
