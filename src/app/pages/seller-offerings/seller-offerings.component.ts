import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { EventMessageService } from '../../services/event-message.service';
import { FeedbackModalComponent } from 'src/app/shared/feedback-modal/feedback-modal.component';
import { UpdateCatalogComponent } from './offerings/seller-catalogs/update-catalog/update-catalog.component';
import { UpdateOfferComponent } from './offerings/seller-offer/update-offer/update-offer.component';
import { UpdateProductSpecComponent } from './offerings/seller-product-spec/update-product-spec/update-product-spec.component';
import { CreateCatalogComponent } from './offerings/seller-catalogs/create-catalog/create-catalog.component';
import { CreateOfferComponent } from './offerings/seller-offer/create-offer/create-offer.component';
import { CreateProductSpecComponent } from './offerings/seller-product-spec/create-product-spec/create-product-spec.component';
import { SellerOfferComponent } from './offerings/seller-offer/seller-offer.component';
import { SellerProductSpecComponent } from './offerings/seller-product-spec/seller-product-spec.component';
import { SellerCatalogsComponent } from './offerings/seller-catalogs/seller-catalogs.component';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { combineLatest, Subject, take, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { environment } from 'src/environments/environment';
import { HeaderBannerComponent } from 'src/app/shared/header/header-banner/header-banner.component';
import { MenuTab, PrivateAreaMenuComponent } from 'src/app/shared/private-area-menu/private-area-menu.component';
import { Router } from '@angular/router';
import { MenuStateService } from 'src/app/services/menu-state.service';
import { AccountServiceService } from 'src/app/services/account-service.service';

@Component({
  selector: 'app-seller-offerings',
  templateUrl: './seller-offerings.component.html',
  styleUrl: './seller-offerings.component.css',
  standalone: true,
  imports: [
    HeaderBannerComponent, FeedbackModalComponent,
    UpdateCatalogComponent, UpdateOfferComponent, UpdateProductSpecComponent,
    CreateCatalogComponent, CreateOfferComponent, CreateProductSpecComponent,
    SellerOfferComponent, SellerProductSpecComponent, SellerCatalogsComponent,
    TranslateModule, ErrorMessageComponent, PrivateAreaMenuComponent
  ],
})
export class SellerOfferingsComponent implements OnInit, OnDestroy {
  // vistas
  show_catalogs = true;
  show_prod_specs = false;
  show_offers = false;

  show_create_prod_spec = false;
  show_create_offer = false;
  show_create_catalog = false;

  show_update_prod_spec = false;
  show_update_offer = false;
  show_update_catalog = false;

  prod_to_update: any;
  offer_to_update: any;
  catalog_to_update: any;

  feedback = false;
  userInfo: any;
  seller: any = '';
  activeTab: MenuTab | null = null;
  
  orgProfileCompleted = true;
  loggedAsUser = true;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router,
    private readonly menuStateService: MenuStateService,
    private readonly accountService: AccountServiceService
  ) {
    this.eventMessage.messages$.subscribe((ev) => {
      switch (ev.type) {
        case 'SellerProductSpec':
          this.feedback = true;
          this.goToProdSpec();
          break;
        case 'SellerCreateProductSpec':
          if (ev.value === true) this.goToCreateProdSpec();
          break;
        case 'SellerOffer':
          if (ev.value === true) this.goToOffers();
          break;
        case 'SellerCatalog':
          if (ev.value === true) this.goToCatalogs();
          break;
        case 'SellerCreateOffer':
          if (ev.value === true) this.goToCreateOffer();
          break;
        case 'SellerCatalogCreate':
          if (ev.value === true) this.goToCreateCatalog();
          break;
        case 'SellerUpdateProductSpec':
          this.prod_to_update = ev.value;
          this.goToUpdateProdSpec();
          break;
        case 'SellerUpdateOffer':
          this.offer_to_update = ev.value;
          this.goToUpdateOffer();
          break;
        case 'SellerCatalogUpdate':
          this.catalog_to_update = ev.value;
          this.goToUpdateCatalog();
          break;
        case 'CloseFeedback':
          this.feedback = false;
          break;
      }
    });
  }

  ngOnInit() {
    combineLatest([
        this.auth.loginInfo$,
        this.auth.sellerId$,
    ]).
    pipe(take(1)).subscribe(([li, sellerId]) => {
      if (!li) return;
      this.userInfo = li;
      this.seller = sellerId;
    });
    this.menuStateService.tab$('offerings')
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        if (!tab) return;

        if (tab === 'offers' || tab === 'productspec' || tab === 'catalogs') {
          const effective = (this.IS_ISBE && tab === 'catalogs') ? 'productspec' : tab;
          this.applySelection(effective);
        }
      });

    const initial = this.menuStateService.getActiveTab('offerings') ?? 'productspec';
    const effective = (this.IS_ISBE && initial === 'catalogs') ? 'productspec' : initial;
    this.loggedAsUser = this.userInfo?.logged_as === this.userInfo?.userId;
    if (!this.loggedAsUser) {
      this.accountService.getOrgInfo(this.seller).then(orgInfo => {
        this.orgProfileCompleted = this.accountService.isOrgInfoComplete(orgInfo);
      });
    }
    this.applySelection(effective); 
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applySelection(tab: MenuTab) {
    this.activeTab = tab;

    this.show_catalogs = tab === 'catalogs' && !this.IS_ISBE;
    this.show_offers = tab === 'offers';
    this.show_prod_specs = tab === 'productspec';

    this.show_create_prod_spec = false;
    this.show_create_offer = false;
    this.show_create_catalog = false;
    this.show_update_prod_spec = false;
    this.show_update_offer = false;
    this.show_update_catalog = false;

    this.cdr.detectChanges();
  }

  onMenuSelect(tab: MenuTab) {
    if (tab === 'offers' || tab === 'productspec' || tab === 'catalogs') {
      const effective = (this.IS_ISBE && tab === 'catalogs') ? 'productspec' : tab;
      this.menuStateService.setActiveTab('offerings', effective);
      return;
    }

    if (tab === 'categories') {
      this.menuStateService.setActiveTab('admin', 'categories');
      this.router.navigate(['/admin']);
      return;
    }

    if (tab === 'general' || tab === 'account' || tab === 'org') {
      this.menuStateService.setActiveTab('profile', tab === 'general' ? 'account' : tab);
      this.router.navigate(['/profile']);
      return;
    }
  }


  goToCatalogs() {
    this.applySelection('catalogs');
  }
  goToProdSpec() {
    this.applySelection('productspec');
  }
  goToOffers() {
    this.applySelection('offers');
  }

  goToCreateProdSpec() {
  this.applySelection('productspec');
  this.show_prod_specs = false;
  this.show_create_prod_spec = true;
}

goToUpdateProdSpec() {
  this.applySelection('productspec');
  this.show_prod_specs = false;
  this.show_update_prod_spec = true;
}

goToCreateOffer() {
  this.applySelection('offers');
  this.show_offers = false;  
  this.show_create_offer = true;
}

goToUpdateOffer() {
  this.applySelection('offers');
  this.show_offers = false;  
  this.show_update_offer = true;
}

goToCreateCatalog() {
  this.applySelection('catalogs');
  this.show_catalogs = false;
  this.show_create_catalog = true;
}

goToUpdateCatalog() {
  this.applySelection('catalogs');
  this.show_catalogs = false;
  this.show_update_catalog = true;
}


  
}
