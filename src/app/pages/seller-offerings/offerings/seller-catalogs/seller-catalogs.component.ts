import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {faIdCard, faSort, faSwatchbook} from "@fortawesome/pro-solid-svg-icons";
import {components} from "src/app/models/product-catalog";
type Catalog = components["schemas"]["Catalog"];
import { environment } from 'src/environments/environment';
import { ApiServiceService } from 'src/app/services/product-service.service';
import {EventMessageService} from "src/app/services/event-message.service";
import { PaginationService } from 'src/app/services/pagination.service';
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

@Component({
    selector: 'seller-catalogs',
    templateUrl: './seller-catalogs.component.html',
    styleUrl: './seller-catalogs.component.css',
    standalone: true,
    imports: [TranslateModule, FaIconComponent]
})
export class SellerCatalogsComponent implements OnInit{

  protected readonly faIdCard = faIdCard;
  protected readonly faSort = faSort;
  protected readonly faSwatchbook = faSwatchbook;

  searchField = new FormControl();
  catalogs:Catalog[]=[];
  nextCatalogs:Catalog[]=[];
  page:number=0;
  CATALOG_LIMIT: number = environment.CATALOG_LIMIT;
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = true;
  filter:any=undefined;
  seller:any;
  status:any[]=[];

  constructor(
    private readonly api: ApiServiceService,
    private readonly cdr: ChangeDetectorRef,
    private readonly auth: AuthService,
    private readonly eventMessage: EventMessageService,
    private readonly paginationService: PaginationService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initCatalogs();
      }
    })
  }

  ngOnInit() {
    this.initCatalogs();
  }

  goToCreate(){
    this.eventMessage.emitSellerCreateCatalog(true);
  }

  goToUpdate(cat:any){
    this.eventMessage.emitSellerUpdateCatalog(cat);
  }

  initCatalogs(): void {
    this.loading = true;
    this.catalogs = [];
    this.nextCatalogs = [];

    this.auth.sellerId$
      .pipe(take(1))
      .subscribe(id => {
        this.seller = id || '';

        this.getCatalogs(false);

        const input = document.querySelector<HTMLInputElement>('[type=search]');
        if (input) {
          input.addEventListener('input', () => {
            if (this.searchField.value === '') {
              this.filter = undefined;
              this.getCatalogs(false);
            }
          }, { once: false });
        }

        initFlowbite();
      });
  }

  ngAfterViewInit(){
    initFlowbite();
  }

  async getCatalogs(next:boolean){
    if(!next){
      this.loading=true;
    }

    let options = {
      "keywords": this.filter,
      "filters": this.status,
      "seller": "did:elsi:"+this.seller
    }

    this.paginationService.getItemsPaginated(this.page, this.CATALOG_LIMIT, next, this.catalogs, this.nextCatalogs, options,
      this.api.getCatalogsByUser.bind(this.api)).then(data => {
      this.page_check=data.page_check;      
      this.catalogs=data.items;
      this.nextCatalogs=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  async next(){
    this.page=this.page+this.CATALOG_LIMIT;
    this.cdr.detectChanges;
    await this.getCatalogs(true);
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
    this.loading=true;
    this.page=0;
    this.catalogs=[];
    this.nextCatalogs=[];
    this.getCatalogs(false);
  }
}
