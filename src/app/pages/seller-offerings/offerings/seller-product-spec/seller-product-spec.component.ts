import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {faIdCard, faSort, faSwatchbook, faSparkles} from "@fortawesome/pro-solid-svg-icons";
import { environment } from 'src/environments/environment';
import { ProductSpecServiceService } from 'src/app/services/product-spec-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import {EventMessageService} from "src/app/services/event-message.service";
import { LoginInfo } from 'src/app/models/interfaces';
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';

@Component({
    selector: 'seller-product-spec',
    templateUrl: './seller-product-spec.component.html',
    styleUrl: './seller-product-spec.component.css',
    standalone: true,
    imports: [TranslateModule, DatePipe, FaIconComponent, ErrorMessageComponent]
})
export class SellerProductSpecComponent implements OnInit{
  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;
  protected readonly faSparkles = faSparkles;

  searchField = new FormControl();

  prodSpecs:any[]=[];
  nextProdSpecs:any[]=[];
  page:number=0;
  PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = true;
  filter:any=undefined;
  status:any[]=[];
  seller:any;
  sort:any=undefined;
  isBundle:any=undefined;

  constructor(
    private readonly prodSpecService: ProductSpecServiceService,
    private readonly localStorage: LocalStorageService,
    private readonly eventMessage: EventMessageService,
    private readonly paginationService: PaginationService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initProdSpecs();
      }
    })
  }

  ngOnInit() {
    this.initProdSpecs();
  }

  initProdSpecs(){
    this.loading=true;
    this.prodSpecs=[];
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(aux.logged_as==aux.id){
      this.seller = aux.id;
    } else {
      let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
      this.seller = loggedOrg.id
    }

    this.getProdSpecs(false);
    let input = document.querySelector('[type=search]')
    if(input!=undefined){
      input.addEventListener('input', e => {
        if(this.searchField.value==''){
          this.filter=undefined;
          this.getProdSpecs(false);
        }
      });
    }
    initFlowbite();
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  goToCreate(){
    this.eventMessage.emitSellerCreateProductSpec(true);
  }

  goToUpdate(prod:any){
    this.eventMessage.emitSellerUpdateProductSpec(prod);
  }

  async getProdSpecs(next:boolean){
    if(next==false){
      this.loading=true;
    }
    
    let options = {
      "filters": this.status,
      "seller": "did:elsi:"+this.seller,
      "sort": this.sort,
      "isBundle": this.isBundle
    }

    this.paginationService.getItemsPaginated(this.page, this.PROD_SPEC_LIMIT, next, this.prodSpecs, this.nextProdSpecs, options,
      this.prodSpecService.getProdSpecByUser.bind(this.prodSpecService)).then(data => {
      this.page_check=data.page_check;      
      this.prodSpecs=data.items;
      this.nextProdSpecs=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  async next(){
    await this.getProdSpecs(true);
  }

  filterInventoryByKeywords(){

  }

  onStateFilterChange(filter:string){
    const index = this.status.findIndex(item => item === filter);
    if (index !== -1) {
      this.status.splice(index, 1);
    } else {
      this.status.push(filter)
    }
    this.getProdSpecs(false);
  }

  onSortChange(event: any) {
    if(event.target.value=='name'){
      this.sort='name'
    }else{
      this.sort=undefined
    }
    this.getProdSpecs(false);
  }

  onTypeChange(event: any) {
    if(event.target.value=='simple'){
      this.isBundle=false
    }else if (event.target.value=='bundle'){
      this.isBundle=true
    }else{
      this.isBundle=undefined
    }
    this.getProdSpecs(false);
  }
}