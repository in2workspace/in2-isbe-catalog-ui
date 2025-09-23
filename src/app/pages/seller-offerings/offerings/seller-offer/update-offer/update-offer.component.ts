import { Component, OnInit, Input } from '@angular/core';

import {LocalStorageService} from "src/app/services/local-storage.service";
import {EventMessageService} from "src/app/services/event-message.service";
import { LoginInfo } from 'src/app/models/interfaces';
import * as moment from 'moment';
import { OfferComponent } from 'src/app/shared/forms/offer/offer.component';
import { TranslateModule } from '@ngx-translate/core';

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
    private readonly localStorage: LocalStorageService,
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
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      if(aux.logged_as==aux.id){
        this.seller = aux.seller;
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
        this.seller = loggedOrg.seller
      }
    }
  }

  goBack() {
    this.eventMessage.emitSellerOffer(true);
  }

}
