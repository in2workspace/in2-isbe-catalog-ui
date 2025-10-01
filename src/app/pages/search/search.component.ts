import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';
import {CategoriesFilterComponent} from "../../shared/categories-filter/categories-filter.component";
import {components} from "../../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import { PaginationService } from 'src/app/services/pagination.service'
import {LocalStorageService} from "../../services/local-storage.service";
import {Category} from "../../models/interfaces";
import {EventMessageService} from "../../services/event-message.service";
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FeedbackModalComponent } from 'src/app/shared/feedback-modal/feedback-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from 'src/app/shared/card/card.component';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { CategoriesPanelComponent } from 'src/app/shared/categories-panel/categories-panel.component';

@Component({
    selector: 'bae-search',
    templateUrl: './search.component.html',
    styleUrl: './search.component.css',
    standalone: true,
    imports: [FeedbackModalComponent, TranslateModule, CardComponent, ReactiveFormsModule, CategoriesFilterComponent, NgClass, CategoriesPanelComponent]
})
export class SearchComponent implements OnInit {

  products: ProductOffering[]=[];
  nextProducts: ProductOffering[]=[];
  loading: boolean = false;
  loading_more: boolean = false;
  page_check:boolean = true;
  page: number=0;
  PRODUCT_LIMIT: number = environment.PRODUCT_LIMIT;
  DFT_CATALOG: String = environment.DFT_CATALOG_ID;
  showDrawer:boolean=false;
  searchEnabled = environment.SEARCH_ENABLED;
  keywords:any=undefined;
  searchField = new FormControl();
  showPanel = false;
  feedback:boolean=false;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private eventMessage: EventMessageService,
    private paginationService: PaginationService) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'AddedFilter' || ev.type === 'RemovedFilter') {
        this.checkPanel();
      }
    })
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'CloseFeedback') {
        this.feedback = false;
      }
    })
  } 

  async ngOnInit() {
    this.products=[];
    this.nextProducts=[];
    /*await this.api.slaCheck().then(data => {  
      console.log(data)
    })*/
    this.checkPanel();
    if(this.route.snapshot.paramMap.get('keywords')){
      this.keywords = this.route.snapshot.paramMap.get('keywords');
      this.searchField.setValue(this.keywords);
    }
    console.log('INIT')
    await this.getProducts(false);

    await this.eventMessage.messages$.subscribe(async ev => {
      if(ev.type === 'AddedFilter' || ev.type === 'RemovedFilter') {
        console.log('event filter')
        await this.getProducts(false);
      }
    })

    let input = document.querySelector('[type=search]')
    if(input!=undefined){
      input.addEventListener('input', async e => {
        if(this.searchField.value==''){
          this.keywords=undefined;
          await this.getProducts(false);
        }
      });
    }
    setTimeout(() => {
      this.auth.isAuthenticated$
        .pipe(take(1))
        .subscribe(isAuth => {
          this.feedback = isAuth;
          this.cdr.detectChanges();
        });
    });

  }

  @HostListener('document:click')
  onClick() {
    if(this.showDrawer==true){
      this.showDrawer=false;
      this.cdr.detectChanges();
    }
  }

  async getProducts(next:boolean){
    let filters = this.localStorage.getObject('selected_categories') as Category[] || [];
    if(next==false){
      this.loading=true;
    }
    
    let options = {
      "keywords": this.keywords,
      "filters": filters
    }

    this.paginationService.getItemsPaginated(this.page, this.PRODUCT_LIMIT, next, this.products,this.nextProducts, options,
      this.paginationService.getProducts.bind(this.paginationService)).then(data => {
      this.page_check=data.page_check;      
      this.products=data.items;
      this.nextProducts=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  async next(){
    await this.getProducts(true);
  }

  async filterSearch(event: any) {
    event.preventDefault()
    if(this.searchField.value!='' && this.searchField.value != null){
      console.log('FILTER KEYWORDS')
      this.keywords=this.searchField.value;
      //let filters = this.localStorage.getObject('selected_categories') as Category[] || [] ;
      await this.getProducts(false);
    } else {
      console.log('EMPTY  FILTER KEYWORDS')
      this.keywords=undefined;
      //let filters = this.localStorage.getObject('selected_categories') as Category[] || [] ;
      await this.getProducts(false);
    }
  }

  checkPanel() {
    const filters = this.localStorage.getObject('selected_categories') as Category[] || [] ;
    const oldState = this.showPanel;
    this.showPanel = filters.length > 0;
    if(this.showPanel != oldState) {
      this.eventMessage.emitFilterShown(this.showPanel);
      this.localStorage.setItem('is_filter_panel_shown', this.showPanel.toString())
    }
  }

}
