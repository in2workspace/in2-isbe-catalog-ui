import { Component, OnInit, Input, ViewChild, OnDestroy, inject } from '@angular/core';

import {EventMessageService} from "src/app/services/event-message.service";
import { OfferComponent } from 'src/app/shared/forms/offer/offer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/guard/auth.service';
import { combineLatest, Subscription, take } from 'rxjs';
import { AlertMessageComponent } from 'src/app/shared/alert-message/alert-message.component';
import { components } from 'src/app/models/product-catalog';
type ProductOffering = components["schemas"]["ProductOffering"];

@Component({
    selector: 'update-offer',
    templateUrl: './update-offer.component.html',
    styleUrl: './update-offer.component.css',
    standalone: true,
    imports: [OfferComponent, TranslateModule, AlertMessageComponent]
})
export class UpdateOfferComponent implements OnInit, OnDestroy{
  @Input() offer: ProductOffering;

  seller: string = '';
  isAdmin:boolean=false;
  showReminder: boolean = false;

  @ViewChild(OfferComponent) offerFormComponent!: OfferComponent;
  private readonly auth = inject(AuthService);
  private readonly eventMessage = inject(EventMessageService);

  private subscription: Subscription;
  
  constructor(
  ) {
    this.subscription = this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  ngOnInit() {
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    this.initPartyInfo();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  initPartyInfo(): void {
    combineLatest([
      this.auth.sellerId$,
      this.auth.loginInfo$
    ])
    .pipe(take(1))
    .subscribe(([sellerId, li]) => {      
      this.seller = sellerId || '';
      this.isAdmin = (li?.roles || []).map(r => r.name ?? r.id ?? r).includes('admin');
    });
  }

  //TODO: Refactorizar con CreateOfferComponent
  goBack() {
    if (this.hasPendingChanges()) {
      this.showReminder = true;
      return;
    }

    this.eventMessage.emitSellerOffer(true);
  }

  confirmLeave() {
    this.showReminder = false;
    this.eventMessage.emitSellerOffer(true);
  }

  cancelLeave() {
    this.showReminder = false;
  }

  private readonly beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.hasPendingChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  private hasPendingChanges(): boolean {
    return !!this.offerFormComponent && this.offerFormComponent.hasPendingChanges();
  }

}
