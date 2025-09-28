import { Component, OnInit, Input } from '@angular/core';

import {EventMessageService} from "src/app/services/event-message.service";
import { OfferComponent } from 'src/app/shared/forms/offer/offer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

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

  initPartyInfo(){
   this.auth.sellerId$
    .pipe(take(1))
    .subscribe(id => {
      this.seller = id || '';
    });
  }

  goBack() {
    this.eventMessage.emitSellerOffer(true);
  }

}
