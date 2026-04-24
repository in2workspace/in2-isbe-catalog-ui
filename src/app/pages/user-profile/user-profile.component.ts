import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
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
import { combineLatest, Subject, take, takeUntil } from 'rxjs';
import { MenuTab, PrivateAreaMenuComponent } from 'src/app/shared/private-area-menu/private-area-menu.component';
import { MenuStateService } from 'src/app/services/menu-state.service';
import { AccountServiceService } from 'src/app/services/account-service.service';

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
export class UserProfileComponent implements OnInit, OnDestroy {

  show_profile = true;
  show_org_profile = false;
  show_orders = false;
  show_billing = false;
  show_revenue = false;
  orgProfileCompleted = true;

  loggedAsUser = true;
  seller: any = '';
  token = '';
  email = '';

  activeTab: MenuTab | null = null;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router,
    private readonly menuStateService: MenuStateService,
    private readonly accountService: AccountServiceService
  ) {
    this.eventMessage.messages$.pipe(takeUntil(this.destroy$)).subscribe((ev) => {
      if (ev.type === 'ChangedSession') this.initPartyInfo();
    });
  }

  ngOnInit() {
    this.menuStateService.tab$('profile')
      .pipe(takeUntil(this.destroy$))
      .subscribe(tab => {
        if (!tab) return;

        if (tab === 'account' || tab === 'org' || tab === 'billing' || tab === 'orders' || tab === 'revenue' || tab === 'general') {
          const effective: MenuTab = tab === 'general' ? 'account' : tab; 
          this.applySelection(effective);
        }
      });
    this.initPartyInfo();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initPartyInfo() {
    combineLatest([
        this.auth.loginInfo$,
        this.auth.sellerId$,
    ]).
    pipe(take(1)).subscribe(([aux, sellerId]) => {
      if (!aux) return;

      this.token = aux.token;
      this.email = aux.email;
      this.seller = aux.userId;

      this.loggedAsUser = aux.logged_as === aux.userId;
      const fallbackTab: MenuTab = this.loggedAsUser ? 'account' : 'org';
      const initial = this.menuStateService.getActiveTab('profile') ?? fallbackTab;
    
      this.applySelection(initial);

      if (!this.loggedAsUser) {
        this.accountService.getOrgInfo(sellerId).then(orgInfo => {
          this.orgProfileCompleted = this.accountService.isOrgInfoComplete(orgInfo);
        });
      }

      initFlowbite();
      this.cdr.detectChanges();
    });
  }

  onMenuSelect(tab: MenuTab) {
    if (tab === 'account' || tab === 'org' || tab === 'billing' || tab === 'orders' || tab === 'revenue' || tab === 'general') {
      const effective = tab === 'general' ? 'account' : tab;
      this.menuStateService.setActiveTab('profile', effective);
      return;
    }

    if (tab === 'offers' || tab === 'productspec' || tab === 'catalogs') {
      const effective = (this.IS_ISBE && tab === 'catalogs') ? 'productspec' : tab;
      this.menuStateService.setActiveTab('offerings', effective);
      this.router.navigate(['/my-offerings']);
      return;
    }

    if (tab === 'categories') {
      this.menuStateService.setActiveTab('admin', 'categories');
      this.router.navigate(['/admin']);
      return;
    }
  }

  private applySelection(tab: MenuTab) {
    this.activeTab = tab;
    this.show_profile = tab === 'account';
    this.show_org_profile = tab === 'org';
    this.show_billing = tab === 'billing';
    this.show_orders = tab === 'orders';
    this.show_revenue = tab === 'revenue';
  }

  getProfile() { this.onMenuSelect('account'); }
  getOrgProfile() { this.onMenuSelect('org'); }
  getBilling() { this.onMenuSelect('billing'); }
  getRevenue() { this.onMenuSelect('revenue'); }
  goToOrders() { this.onMenuSelect('orders'); }
}
