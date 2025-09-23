import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LoginInfo } from 'src/app/models/interfaces';
import {LocalStorageService} from "../../services/local-storage.service";
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
import * as moment from 'moment';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrl: './user-profile.component.css',
    standalone: true,
    imports: [ProviderRevenueSharingComponent, BillingInfoComponent, OrderInfoComponent, OrgInfoComponent, UserInfoComponent, TranslateModule, NgClass]
})
export class UserProfileComponent implements OnInit{
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
    private readonly localStorage: LocalStorageService,
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

  initPartyInfo(){
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      this.token=aux.token;
      this.email=aux.email;
      if(aux.logged_as==aux.id){
        this.seller = aux.seller;
        this.loggedAsUser=true;
        this.show_profile=true;
        this.show_org_profile=false;
        this.getProfile();
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as);
        this.seller = loggedOrg.seller;
        this.loggedAsUser=false;
        this.show_profile=false;
        this.show_org_profile=true;
        this.getOrgProfile(); 
      }
      //this.seller = aux.seller;
      
    }
    initFlowbite();
  }

  getProfile(){
    this.show_billing=false;
    this.show_profile=true;
    this.show_orders=false;
    this.show_org_profile=false;
    this.show_revenue=false;
    this.selectGeneral();
  }

  getOrgProfile(){
    this.show_billing=false;
    this.show_profile=false;
    this.show_orders=false;
    this.show_org_profile=true;
    this.show_revenue=false;
    this.selectGeneral();
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

  selectGeneral(){
    let bill_button = document.getElementById('bill-button')
    let general_button = document.getElementById('general-button')
    let order_button = document.getElementById('order-button')
    let revenue_button = document.getElementById('revenue-button')

    this.selectMenu(general_button,'text-white bg-primary-100');
    this.unselectMenu(bill_button,'text-white bg-primary-100');
    this.unselectMenu(order_button,'text-white bg-primary-100');
    this.unselectMenu(revenue_button,'text-white bg-primary-100');
  }

  selectBilling(){
    let bill_button = document.getElementById('bill-button')
    let general_button = document.getElementById('general-button')
    let order_button = document.getElementById('order-button')
    let revenue_button = document.getElementById('revenue-button')

    this.selectMenu(bill_button,'text-white bg-primary-100');
    this.unselectMenu(general_button,'text-white bg-primary-100');
    this.unselectMenu(order_button,'text-white bg-primary-100');
    this.unselectMenu(revenue_button,'text-white bg-primary-100');
  }

  selectOrder(){
    let bill_button = document.getElementById('bill-button')
    let general_button = document.getElementById('general-button')
    let order_button = document.getElementById('order-button')
    let revenue_button = document.getElementById('revenue-button')

    this.selectMenu(order_button,'text-white bg-primary-100');
    this.unselectMenu(bill_button,'text-white bg-primary-100');
    this.unselectMenu(general_button,'text-white bg-primary-100');
    this.unselectMenu(revenue_button,'text-white bg-primary-100');
  }

  selectRevenue(){
    let bill_button = document.getElementById('bill-button')
    let general_button = document.getElementById('general-button')
    let order_button = document.getElementById('order-button')
    let revenue_button = document.getElementById('revenue-button')

    this.selectMenu(revenue_button,'text-white bg-primary-100');
    this.unselectMenu(bill_button,'text-white bg-primary-100');
    this.unselectMenu(general_button,'text-white bg-primary-100');
    this.unselectMenu(order_button,'text-white bg-primary-100');
  }

  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  unselectMenu(elem:HTMLElement | null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        this.removeClass(elem,cls)
      } else {
        console.log('already unselected')
      }
    }
  }

  selectMenu(elem:HTMLElement| null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        console.log('already selected')
      } else {
        this.addClass(elem,cls)
      }
    }
  }
}
