import { Component, OnInit, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import {CardComponent} from "../../shared/card/card.component";
import {components} from "../../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { async, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { Category } from 'src/app/models/interfaces';
import { EventMessageService } from 'src/app/services/event-message.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { environment } from 'src/environments/environment';
import { NgClass } from '@angular/common';
import { CategoriesFilterComponent } from 'src/app/shared/categories-filter/categories-filter.component';
import { CategoriesPanelComponent } from 'src/app/shared/categories-panel/categories-panel.component';
import { FeedbackModalComponent } from 'src/app/shared/feedback-modal/feedback-modal.component';

@Component({
    selector: 'bae-off-gallery',
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.css',
    standalone: true,
    imports: [FeedbackModalComponent, TranslateModule, CardComponent, ReactiveFormsModule, CategoriesFilterComponent, NgClass, CategoriesPanelComponent]
})
export class GalleryComponent implements OnInit {

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

  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly localStorage = inject(LocalStorageService);
  private readonly eventMessage = inject(EventMessageService);
  private readonly paginationService = inject(PaginationService);
  
  constructor() {   
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'AddedFilter' || ev.type === 'RemovedFilter') {
        this.checkPanel();
      }
    });
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'CloseFeedback') {
        this.feedback = false;
      }
    });
  }

  async ngOnInit() {
    this.products=[];
    this.nextProducts=[];
    this.checkPanel();
    let keywords = this.route.snapshot.paramMap.get('keywords');
    if(keywords){
      this.keywords = keywords;
      this.searchField.setValue(this.keywords);
    }
    await this.getProducts(false);

    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'AddedFilter' || ev.type === 'RemovedFilter') {
        this.getProducts(false);
      }
    })

    let input = document.querySelector('[type=search]')
    if(input!=undefined){
      input.addEventListener('input', e => {
        if(this.searchField.value==''){
          this.keywords=undefined;
          this.getProducts(false);
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
      this.keywords=this.searchField.value;
      //let filters = this.localStorage.getObject('selected_categories') as Category[] || [] ;
      await this.getProducts(false);
    } else {
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
  