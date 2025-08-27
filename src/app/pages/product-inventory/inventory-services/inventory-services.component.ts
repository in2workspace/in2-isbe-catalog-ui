import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit, HostListener, Input } from '@angular/core';
import { LoginInfo } from 'src/app/models/interfaces';
import { ProductInventoryServiceService } from 'src/app/services/product-inventory-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { Router } from '@angular/router';
import { PaginationService } from 'src/app/services/pagination.service';
import {EventMessageService} from "src/app/services/event-message.service";
import {faIdCard, faSort, faSwatchbook} from "@fortawesome/pro-solid-svg-icons";
import { initFlowbite } from 'flowbite';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'inventory-services',
  templateUrl: './inventory-services.component.html',
  styleUrl: './inventory-services.component.css'
})
export class InventoryServicesComponent implements OnInit {

  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;

  @Input() serviceId: any = undefined;
  @Input() prodId: any = undefined;

  partyId:any='';
  loading: boolean = false;
  services:any[]=[];
  nextServices:any[]=[];
  status:any[]=[];
  loading_more: boolean = false;
  page_check:boolean = true;
  page: number=0;
  INVENTORY_LIMIT: number = environment.INVENTORY_SERV_LIMIT;
  showDetails:boolean=false;
  selectedServ:any;

  constructor(
    private inventoryService: ProductInventoryServiceService,
    private localStorage: LocalStorageService,
    private api: ApiServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private eventMessage: EventMessageService,
    private paginationService: PaginationService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initInventory();
      }
    })
  }

  ngOnInit() {
    if(this.serviceId!=undefined){      
      this.api.getServiceSpec(this.serviceId).then(serv => {
        this.selectService(serv)
      })      
    }
    this.initInventory();
  }

  initInventory(){
    this.loading=true;

    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      if(aux.logged_as==aux.id){
        this.partyId = aux.partyId;
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
        this.partyId = loggedOrg.partyId
      }
      this.getInventory(false);
    }
    initFlowbite();
  }

  async getInventory(next:boolean){
    if(next==false){
      this.loading=true;
    }

    let options = {
      "partyId": this.partyId,
      "filters": this.status
    }
    
    this.paginationService.getItemsPaginated(this.page, this.INVENTORY_LIMIT, next, this.services, this.nextServices, options,
      this.inventoryService.getServiceInventory.bind(this.inventoryService)).then(data => {
      this.page_check=data.page_check;      
      this.services=data.items;
      this.nextServices=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }
  async next(){
    await this.getInventory(true);
  }

  selectService(serv:any){
    this.selectedServ=serv;
    this.showDetails=true;
  }

  back(){
    if(this.prodId!=undefined){
      this.eventMessage.emitOpenProductInvDetails(this.prodId);
      this.showDetails=false;
    } else {
      this.showDetails=false;
    }
  }

  onStateFilterChange(filter:string){
    const index = this.status.findIndex(item => item === filter);
    if (index !== -1) {
      this.status.splice(index, 1);
      console.log('elimina filtro')
      console.log(this.status)
    } else {
      console.log('añade filtro')
      console.log(this.status)
      this.status.push(filter)
    }
    this.getInventory(false);
  }

}
