import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import {components} from "../../models/product-catalog";
type ProductOffering = components["schemas"]["ProductOffering"];
import { initFlowbite } from 'flowbite';
import {EventMessageService} from "../../services/event-message.service";
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

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.css',
    standalone: true,
    imports: [ProviderRevenueSharingComponent, BillingInfoComponent, OrderInfoComponent, OrgInfoComponent, UserInfoComponent, TranslateModule, NgClass]
})
export class UserProfileComponent implements OnInit{
  @ViewChild('billButton',   { static: false }) billButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('accountButton',{ static: false }) accountButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('orgButton',    { static: false }) orgButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('orderButton',  { static: false }) orderButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('revenueButton',{ static: false }) revenueButton?: ElementRef<HTMLButtonElement>;
  
  show_profile: boolean = true;
  show_org_profile:boolean=false;
  show_orders: boolean = false;
  show_billing: boolean = false;
  show_revenue: boolean = false;
  loggedAsUser: boolean = true;
  profile:any;
  seller:any='';
  token:string='';
  email:string='';

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService
  ) {
    this.eventMessage.messages$.subscribe(ev => { 
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  ngOnInit() {
    let today = new Date();
    today.setMonth(today.getMonth()-1);
    this.initPartyInfo();
  }

  initPartyInfo() {
    this.auth.loginInfo$
      .pipe(take(1))
      .subscribe(aux => {
        if (!aux) return;

        this.token = aux.token;
        this.email = aux.email;

        this.seller = aux.id;
        this.loggedAsUser = aux.logged_as === aux.id;
        this.show_profile = this.loggedAsUser;
        this.show_org_profile = !this.loggedAsUser;

        if(this.loggedAsUser){
          this.getProfile();
        } else {
          this.getOrgProfile();
        }
        initFlowbite();
      });
  }

  getProfile(){
    this.show_billing=false;
    this.show_profile=true;
    this.show_orders=false;
    this.show_org_profile=false;
    this.show_revenue=false;
    this.selectAccount();
  }

  getOrgProfile(){
    this.show_billing=false;
    this.show_profile=false;
    this.show_orders=false;
    this.show_org_profile=true;
    this.show_revenue=false;
    this.selectOrganization();
  }

  getBilling(){
    this.selectBilling();    
    this.show_billing=true;
    this.show_profile=false;
    this.show_orders=false;
    this.show_org_profile=false;
    this.show_revenue=false;
    this.cdr.detectChanges();
    initFlowbite();
  }

  getRevenue(){
    this.selectRevenue();    
    this.show_billing=false;
    this.show_profile=false;
    this.show_orders=false;
    this.show_org_profile=false;
    this.show_revenue=true;
    this.cdr.detectChanges();
    initFlowbite();
  }

  goToOrders(){
    this.selectOrder();
    this.show_billing=false;
    this.show_profile=false;
    this.show_orders=true;
    this.show_org_profile=false;
    this.show_revenue=false;
    this.cdr.detectChanges();
  }

  selectAccount(){
    this.selectMenu(this.accountButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orgButton, 'text-white bg-primary-100');
    this.unselectMenu(this.billButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orderButton, 'text-white bg-primary-100');
    this.unselectMenu(this.revenueButton, 'text-white bg-primary-100');
  }

  selectOrganization(){
    this.unselectMenu(this.accountButton, 'text-white bg-primary-100');
    this.selectMenu(this.orgButton, 'text-white bg-primary-100');
    this.unselectMenu(this.billButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orderButton, 'text-white bg-primary-100');
    this.unselectMenu(this.revenueButton, 'text-white bg-primary-100');
  }

  selectBilling(){
    this.unselectMenu(this.accountButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orgButton, 'text-white bg-primary-100');
    this.selectMenu(this.billButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orderButton, 'text-white bg-primary-100');
    this.unselectMenu(this.revenueButton, 'text-white bg-primary-100');
  }

  selectOrder(){
    this.unselectMenu(this.accountButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orgButton, 'text-white bg-primary-100');
    this.unselectMenu(this.billButton, 'text-white bg-primary-100');
    this.selectMenu(this.orderButton, 'text-white bg-primary-100');
    this.unselectMenu(this.revenueButton, 'text-white bg-primary-100');
  }

  selectRevenue(){
    this.unselectMenu(this.accountButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orgButton, 'text-white bg-primary-100');
    this.unselectMenu(this.billButton, 'text-white bg-primary-100');
    this.unselectMenu(this.orderButton, 'text-white bg-primary-100');
    this.selectMenu(this.revenueButton, 'text-white bg-primary-100');
  }

  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  selectMenu(button: ElementRef<HTMLButtonElement> | undefined, classes: string) {
    button?.nativeElement?.classList.add(...classes.split(' '));
  }

  unselectMenu(button: ElementRef<HTMLButtonElement> | undefined, classes: string) {
    button?.nativeElement?.classList.remove(...classes.split(' '));
  }
}


