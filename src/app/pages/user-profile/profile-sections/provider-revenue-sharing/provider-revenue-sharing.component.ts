import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {LocalStorageService} from "src/app/services/local-storage.service";
import { LoginInfo } from 'src/app/models/interfaces';
import { RevenueSharingService } from 'src/app/services/revenue-sharing.service'
import * as moment from 'moment';
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'provider-revenue-sharing',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule, CommonModule],
  templateUrl: './provider-revenue-sharing.component.html',
  styleUrl: './provider-revenue-sharing.component.css'
})
export class ProviderRevenueSharingComponent implements OnInit {
  loading: boolean = false;
  subscription:any;
  billing:any;
  revenue:any;
  revenueSummary:any;
  referral:any;
  support:any;

  seller:any='';

  constructor(
    private auth: AuthService,
    private revenueService: RevenueSharingService
  ) {
  }
  

  async ngOnInit() {
    this.initPartyInfo();
    let info = await this.revenueService.getRevenue(this.seller);
    for(const element of info){
      if(element.label == 'Subscription'){
        this.subscription = element
      } else if(element.label == 'Billing History'){
        this.billing = element
      } else if(element.label == 'Revenue Summary'){
        this.revenueSummary = element
      } else if (element.label == 'Revenue Volume Monitoring'){
        this.revenue = element
      } else if(element.label == 'Referral Program Area'){
        this.referral = element
      } else if(element.label == 'Support'){
        this.support = element
      }
    }
  }

  initPartyInfo(): void {
    this.auth.sellerId$
      .pipe(take(1))
      .subscribe(id => {
        this.seller = id || '';
      });
  }

}
