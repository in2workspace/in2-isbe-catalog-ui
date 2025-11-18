import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';

import {EventMessageService} from "src/app/services/event-message.service";
import { OfferComponent } from 'src/app/shared/forms/offer/offer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/guard/auth.service';
import { combineLatest, take } from 'rxjs';
import { AlertMessageComponent } from 'src/app/shared/alert-message/alert-message.component';

@Component({
    selector: 'update-offer',
    templateUrl: './update-offer.component.html',
    styleUrl: './update-offer.component.css',
    standalone: true,
    imports: [OfferComponent, TranslateModule, AlertMessageComponent]
})
export class UpdateOfferComponent implements OnInit, OnDestroy{
  @Input() offer: any;

  seller:any='';
  isAdmin:boolean=false;
  showReminder: boolean = false;

  @ViewChild(OfferComponent) offerFormComponent!: OfferComponent;

  constructor(
    private readonly auth: AuthService,
    private readonly eventMessage: EventMessageService,
  ) {
    this.eventMessage.messages$.subscribe(ev => {
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
