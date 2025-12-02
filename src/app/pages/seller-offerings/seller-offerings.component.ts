import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { environment } from 'src/environments/environment';
import { HeaderBannerComponent } from 'src/app/shared/header/header-banner/header-banner.component';
import { MenuTab, PrivateAreaMenuComponent } from 'src/app/shared/private-area-menu/private-area-menu.component';
import { Router } from '@angular/router';

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
export class SellerOfferingsComponent implements OnInit {
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
  loggedAsUser = true;

  activeSection: 'catalogs' | 'offers' | 'productspec' = 'catalogs';

  activeTab: MenuTab = 'offers';

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router
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
    this.auth.loginInfo$.pipe(take(1)).subscribe((li) => {
      if (!li) return;
      this.userInfo = li;
      this.loggedAsUser = li.logged_as === li.id;
    });

    const saved = localStorage.getItem('activeSection') as 'catalogs' | 'offers' | 'productspec' | null;

    if (this.IS_ISBE) {
      this.show_catalogs = false;
      if (saved === 'catalogs' || !saved) {
        this.applySection('offers');
        return;
      }
    }

    this.applySection(saved ?? 'catalogs');
  }

  private applySection(section: 'catalogs' | 'offers' | 'productspec') {
    this.activeSection = section;
    localStorage.setItem('activeSection', section);

    this.show_catalogs = section === 'catalogs' && !this.IS_ISBE;
    this.show_offers = section === 'offers';
    this.show_prod_specs = section === 'productspec';

    this.activeTab = section === 'productspec' ? 'productspec' : 'offers';

    this.show_create_prod_spec = false;
    this.show_create_offer = false;
    this.show_create_catalog = false;
    this.show_update_prod_spec = false;
    this.show_update_offer = false;
    this.show_update_catalog = false;

    this.cdr.detectChanges();
  }

  onMenuSelect(tab: MenuTab) {
    switch (tab) {
      case 'offers':
        this.goToOffers();
        break;
      case 'productspec':
        this.goToProdSpec();
        break;
      case 'categories':
        this.router.navigate(['/admin']);
        break;
      case 'general':
        this.router.navigate(['/profile']);
        break;
      case 'account':
        this.router.navigate(['/profile']);
        break;
      case 'org':
        this.router.navigate(['/profile']);
        break;
      default:
        break;
    }
  }

  goToCatalogs() {
    this.applySection('catalogs');
  }
  goToProdSpec() {
    this.applySection('productspec');
  }
  goToOffers() {
    this.applySection('offers');
  }

  goToCreateProdSpec() {
  this.applySection('productspec');
  this.show_prod_specs = false;
  this.show_create_prod_spec = true;
}

goToUpdateProdSpec() {
  this.applySection('productspec');
  this.show_prod_specs = false;
  this.show_update_prod_spec = true;
}

goToCreateOffer() {
  this.applySection('offers');
  this.show_offers = false;  
  this.show_create_offer = true;
}

goToUpdateOffer() {
  this.applySection('offers');
  this.show_offers = false;  
  this.show_update_offer = true;
}

goToCreateCatalog() {
  this.applySection('catalogs');
  this.show_catalogs = false;
  this.show_create_catalog = true;
}

goToUpdateCatalog() {
  this.applySection('catalogs');
  this.show_catalogs = false;
  this.show_update_catalog = true;
}


  
}
