import { Component, inject, OnInit, AfterViewChecked } from '@angular/core';
import { FormControl } from '@angular/forms';
import { faIdCard, faSort, faSwatchbook, faSparkles} from "@fortawesome/pro-solid-svg-icons";
import { environment } from 'src/environments/environment';
import { ProductSpecServiceService } from 'src/app/services/product-spec-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { EventMessageService } from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
    selector: 'seller-product-spec',
    templateUrl: './seller-product-spec.component.html',
    styleUrl: './seller-product-spec.component.css',
    standalone: true,
    imports: [CommonModule, TranslateModule, DatePipe, FaIconComponent, ErrorMessageComponent]
})
export class SellerProductSpecComponent implements OnInit, AfterViewChecked {
  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;
  protected readonly faSparkles = faSparkles;

  private readonly eventMessage = inject(EventMessageService);  
  private readonly prodSpecService = inject(ProductSpecServiceService);
  private readonly auth = inject(AuthService);
  private readonly paginationService = inject(PaginationService);

  // TODO: remove mock mode once real product specs are loading again
  MOCK_MODE: boolean = true;
  MOCK_PROD_SPECS: any[] = [
    { id: 'ps1', name: 'Mock Spec Alpha', brand: 'AcmeCorp', version: '1.0', productNumber: 'ACME-001', description: 'A sample data product specification for layout testing.', lifecycleStatus: 'Active', isBundle: false, lastUpdate: '2024-01-15T10:00:00Z', productSpecCharacteristic: [{ name: 'Format', productSpecCharacteristicValue: [{ value: 'CSV' }] }] },
    { id: 'ps2', name: 'Mock Spec Beta', brand: 'TechLab', version: '2.0', productNumber: 'TL-002', description: 'An AI model specification for layout testing.', lifecycleStatus: 'Launched', isBundle: false, lastUpdate: '2024-02-10T08:00:00Z', productSpecCharacteristic: [{ name: 'Model type', productSpecCharacteristicValue: [{ value: 'LLM' }] }] },
    { id: 'ps3', name: 'Mock Bundle Spec', brand: 'DataHub', version: '1.2', productNumber: 'DH-003', description: 'A bundle specification combining multiple data assets.', lifecycleStatus: 'In design', isBundle: true, lastUpdate: '2024-03-01T12:00:00Z', productSpecCharacteristic: [] },
    { id: 'ps4', name: 'Mock Spec Delta', brand: 'SecureOps', version: '3.1', productNumber: 'SO-004', description: 'A security toolset specification for layout testing.', lifecycleStatus: 'Active', isBundle: false, lastUpdate: '2024-03-20T15:30:00Z', productSpecCharacteristic: [{ name: 'Compliance', productSpecCharacteristicValue: [{ value: 'ISO 27001' }] }] },
  ];

  searchField = new FormControl();

  prodSpecs:any[]=[];
  nextProdSpecs:any[]=[];
  page:number=0;
  PROD_SPEC_LIMIT: number = environment.PROD_SPEC_LIMIT;
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = false;
  filter:any=undefined;
  status:any[]=[];
  seller:any;
  sort:any=undefined;
  isBundle:any=undefined;
  private needsFlowbiteInit = false;

  constructor() {
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
    this.auth.sellerId$.pipe(take(1)).subscribe(id => {
      this.seller = id ?? '';
    });

    if (this.MOCK_MODE) {
      this.prodSpecs = this.MOCK_PROD_SPECS;
      this.loading = false;
      return;
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

  ngAfterViewChecked() {
    if (this.needsFlowbiteInit) {
      this.needsFlowbiteInit = false;
      initFlowbite();
    }
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
      this.needsFlowbiteInit = true;
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

  onCreateOfferClick() {
    this.eventMessage.emitSellerCreateOffer(true);
  }

}
