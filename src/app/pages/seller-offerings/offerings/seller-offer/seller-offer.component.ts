import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {faIdCard, faSort, faSwatchbook, faSparkles} from "@fortawesome/pro-solid-svg-icons";
import { environment } from 'src/environments/environment';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import { LoginInfo } from 'src/app/models/interfaces';
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'seller-offer',
    templateUrl: './seller-offer.component.html',
    styleUrl: './seller-offer.component.css',
    standalone: true,
    imports: [TranslateModule, DatePipe, FaIconComponent]
})
export class SellerOfferComponent implements OnInit{
  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;
  protected readonly faSparkles = faSparkles;

  searchField = new FormControl();

  offers:any[]=[];
  nextOffers:any[]=[];
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
    private readonly api: ApiServiceService,
    private readonly auth: AuthService,
    private readonly eventMessage: EventMessageService,
    private readonly paginationService: PaginationService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initOffers();
      }
    })
  }

  ngOnInit() {
    this.initOffers();
  }

  initOffers(): void {
    this.loading = true;
    this.offers = [];
    this.nextOffers = [];

    this.auth.sellerId$
      .pipe(take(1))
      .subscribe(id => {
        this.seller = id || '';

        this.getOffers(false);

        const input = document.querySelector<HTMLInputElement>('[type=search]');
        if (input) {
          input.oninput = () => {
            if (this.searchField.value === '') {
              this.filter = undefined;
              this.getOffers(false);
            }
          };
        }

        initFlowbite();
      });
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  goToCreate(){
    this.eventMessage.emitSellerCreateOffer(true);
  }

  goToUpdate(offer:any){
    this.eventMessage.emitSellerUpdateOffer(offer);
  }

  async getOffers(next:boolean){
    if(next==false){
      this.loading=true;
    }
    
    let options = {
      "filters": this.status,
      "seller": "did:elsi:"+this.seller,
      "sort": this.sort,
      "isBundle": this.isBundle
    }
    
    this.paginationService.getItemsPaginated(this.page, this.PROD_SPEC_LIMIT, next, this.offers,this.nextOffers, options,
      this.api.getProductOfferByOwner.bind(this.api)).then(data => {
      this.page_check=data.page_check;      
      this.offers=data.items;
      this.nextOffers=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  async next(){
    await this.getOffers(true);
  }

  onStateFilterChange(filter:string){
    const index = this.status.findIndex(item => item === filter);
    if (index !== -1) {
      this.status.splice(index, 1);
    } else {
      this.status.push(filter)
    }
    this.getOffers(false);
  }

  onSortChange(event: any) {
    if(event.target.value=='name'){
      this.sort='name'
    }else{
      this.sort=undefined
    }
    this.getOffers(false);
  }

  onTypeChange(event: any) {
    if(event.target.value=='simple'){
      this.isBundle=false
    }else if (event.target.value=='bundle'){
      this.isBundle=true
    }else{
      this.isBundle=undefined
    }
    this.getOffers(false);
  }

}
