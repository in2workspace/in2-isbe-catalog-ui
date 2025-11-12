import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { components } from '../../models/product-catalog';
type ProductOffering = components['schemas']['ProductOffering'];
import { initFlowbite } from 'flowbite';
import { EventMessageService } from '../../services/event-message.service';
import { ProviderRevenueSharingComponent } from './profile-sections/provider-revenue-sharing/provider-revenue-sharing.component';
import { BillingInfoComponent } from './profile-sections/billing-info/billing-info.component';
import { OrderInfoComponent } from './profile-sections/order-info/order-info.component';
import { OrgInfoComponent } from './profile-sections/org-info/org-info.component';
import { UserInfoComponent } from './profile-sections/user-info/user-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { NgClass } from '@angular/common';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';
import { MenuTab, PrivateAreaMenuComponent } from 'src/app/shared/private-area-menu/private-area-menu.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  standalone: true,
  imports: [
    ProviderRevenueSharingComponent,
    BillingInfoComponent,
    OrderInfoComponent,
    OrgInfoComponent,
    UserInfoComponent,
    TranslateModule,
    NgClass,
    PrivateAreaMenuComponent
  ],
})
export class UserProfileComponent implements OnInit {

  show_profile = true;
  show_org_profile = false;
  show_orders = false;
  show_billing = false;
  show_revenue = false;

  loggedAsUser = true;
  profile: any;
  seller: any = '';
  token = '';
  email = '';

  activeTab: MenuTab = 'account';

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router
  ) {
    this.eventMessage.messages$.subscribe((ev) => {
      if (ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    });
  }

  ngOnInit() {
    this.initPartyInfo();
  }

  initPartyInfo() {
    this.auth.loginInfo$.pipe(take(1)).subscribe((aux) => {
      if (!aux) return;

      this.token = aux.token;
      this.email = aux.email;

      this.seller = aux.id;
      this.loggedAsUser = aux.logged_as === aux.id;

      this.activeTab = this.loggedAsUser ? 'general' : 'org';
      this.applySelection(this.activeTab);
      initFlowbite();
    });
  }

  onMenuSelect(tab: MenuTab) {
    this.activeTab = tab;
    if (tab === 'account' || tab === 'org' || tab === 'billing' || tab === 'orders' || tab === 'revenue' || tab === 'general') {
      this.applySelection(tab);
      this.cdr.detectChanges();
      return;
    }

    switch (tab) {
      case 'offers':
        this.router.navigate(['/my-offerings']);
        break;
      case 'productspec':
        this.router.navigate(['/my-offerings']);
        break;
      case 'categories':
        this.router.navigate(['/admin']);
        break;
    }
  }

  private applySelection(tab: MenuTab) {
    this.show_profile = tab === 'account';
    this.show_org_profile = tab === 'org';
    this.show_billing = tab === 'billing';
    this.show_orders = tab === 'orders';
    this.show_revenue = tab === 'revenue';
  }

  getProfile() { this.onMenuSelect('account'); }
  getOrgProfile() { this.onMenuSelect('org'); }
  getBilling() { this.onMenuSelect('billing'); }
}
