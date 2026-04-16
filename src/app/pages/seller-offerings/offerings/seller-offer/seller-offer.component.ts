import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormControl } from '@angular/forms';
import {faIdCard, faSort, faSwatchbook, faSparkles} from "@fortawesome/pro-solid-svg-icons";
import { environment } from 'src/environments/environment';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'seller-offer',
    templateUrl: './seller-offer.component.html',
    styleUrl: './seller-offer.component.css',
    standalone: true,
    imports: [TranslateModule, DatePipe, FaIconComponent]
})
export class SellerOfferComponent implements OnInit, AfterViewChecked {
  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;
  protected readonly faSparkles = faSparkles;

  // TODO: remove mock mode once real offers are loading again
  MOCK_MODE: boolean = true;
  MOCK_OFFERS: any[] = [
    { id: '1', name: 'Mock Offer Alpha', description: 'A sample data service offering for layout testing.', version: '1.0', lifecycleStatus: 'Active', isBundle: false, isSellable: true, lastUpdate: '2024-01-15T10:00:00Z', productOfferingPrice: [{ name: 'Free tier', priceType: 'free' }], productSpecification: { id: 'ps1', name: 'Mock Spec A' } },
    { id: '2', name: 'Mock Offer Beta', description: 'An AI-powered analytics offering for layout testing.', version: '2.1', lifecycleStatus: 'Launched', isBundle: false, isSellable: true, lastUpdate: '2024-02-20T14:30:00Z', productOfferingPrice: [{ name: 'Monthly', priceType: 'recurring', price: { value: 99, unit: 'EUR' } }], productSpecification: { id: 'ps2', name: 'Mock Spec B' } },
    { id: '3', name: 'Mock Offer Gamma', description: 'Cloud infrastructure bundle for layout testing.', version: '1.5', lifecycleStatus: 'In design', isBundle: true, isSellable: false, lastUpdate: '2024-03-05T09:15:00Z', productOfferingPrice: [{ name: 'Pay per use', priceType: 'usage' }], productSpecification: { id: 'ps3', name: 'Mock Spec C' } },
    { id: '4', name: 'Mock Offer Delta', description: 'Security and compliance offering for layout testing.', version: '3.0', lifecycleStatus: 'Active', isBundle: false, isSellable: true, lastUpdate: '2024-03-22T16:45:00Z', productOfferingPrice: [{ name: 'Enterprise', priceType: 'recurring', price: { value: 499, unit: 'EUR' } }], productSpecification: { id: 'ps4', name: 'Mock Spec D' } },
  ];

  searchField = new FormControl();

  offers:any[]=[];
  nextOffers:any[]=[];
  page:number=0;
  PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = false;
  filter:any=undefined;
  status:any[]=[];
  seller:any;
  isAdmin:boolean;
  sort:any=undefined;
  isBundle:any=undefined;
  private needsFlowbiteInit = false;

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

    if (this.MOCK_MODE) {
      this.offers = this.MOCK_OFFERS;
      this.loading = false;
      return;
    }

    combineLatest([
      this.auth.sellerId$,
      this.auth.loginInfo$
    ])
    .pipe(take(1))
    .subscribe(([sellerId, li]) => {
      this.seller = sellerId || '';
      this.isAdmin = (li?.roles || []).map(r => r.name ?? r.id ?? r).includes('admin');
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

  ngAfterViewChecked() {
    if (this.needsFlowbiteInit) {
      this.needsFlowbiteInit = false;
      initFlowbite();
    }
  }

  goToCreate(){
    this.eventMessage.emitSellerCreateOffer(true);
  }

  goToUpdate(offer:any){
    this.eventMessage.emitSellerUpdateOffer(offer);
  }

  getOffers(next:boolean){
    if(next==false){
      this.loading=true;
    }
    
    let options = {
      "filters": this.status,
      "seller": "did:elsi:"+this.seller,
      "sort": this.sort,
      "isBundle": this.isBundle,
      "isAdmin": this.isAdmin
    }
    
    this.paginationService.getItemsPaginated(this.page, this.PROD_SPEC_LIMIT, next, this.offers,this.nextOffers, options,
      this.api.getProductOfferByOwner.bind(this.api)).then(data => {
      this.page_check=data.page_check;      
      this.offers=data.items;
      this.nextOffers=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
      this.needsFlowbiteInit = true;
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
