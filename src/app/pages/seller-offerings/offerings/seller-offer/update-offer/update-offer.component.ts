import { Component, OnInit, Input } from '@angular/core';

import {EventMessageService} from "src/app/services/event-message.service";
import { OfferComponent } from 'src/app/shared/forms/offer/offer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/guard/auth.service';
import { combineLatest, take } from 'rxjs';

@Component({
    selector: 'update-offer',
    templateUrl: './update-offer.component.html',
    styleUrl: './update-offer.component.css',
    standalone: true,
    imports: [OfferComponent, TranslateModule]
})
export class UpdateOfferComponent implements OnInit{
  @Input() offer: any;

  seller:any='';
  isAdmin:boolean=false;

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
    this.initPartyInfo();
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

  goBack() {
    this.eventMessage.emitSellerOffer(true);
  }

}
