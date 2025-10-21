import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { billingAccountCart } from 'src/app/models/interfaces';
import { AccountServiceService } from 'src/app/services/account-service.service';
import {components} from "src/app/models/product-catalog";
import { FormControl } from '@angular/forms';
type ProductOffering = components["schemas"]["ProductOffering"];
import { countries } from 'src/app/models/country.const'
import { initFlowbite } from 'flowbite';
import {EventMessageService} from "src/app/services/event-message.service";
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { BillingAccountFormComponent } from 'src/app/shared/billing-account-form/billing-account-form.component';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { OrgContextService } from 'src/app/services/org-context.service';

@Component({
    selector: 'billing-info',
    templateUrl: './billing-info.component.html',
    styleUrl: './billing-info.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, NgClass, BillingAccountFormComponent]
})
export class BillingInfoComponent implements OnInit{
  loading: boolean = false;
  orders:any[]=[];
  profile:any;
  seller:any='';
  partyInfo:any = {
    id: '',
    name: '',
    href: ''
  }
  billing_accounts: billingAccountCart[] =[];
  selectedBilling:any;
  billToDelete:any;
  billToUpdate:any;
  editBill:boolean=false;
  deleteBill:boolean=false;
  showOrderDetails:boolean=false;
  orderToShow:any;
  dateRange = new FormControl();
  selectedDate:any;
  countries: any[] = countries;
  preferred:boolean=false;

  errorMessage:any='';
  showError:boolean=false;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly accountService: AccountServiceService,
    private readonly eventMessage: EventMessageService,
    private readonly orgCtx: OrgContextService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'BillAccChanged') {
        this.getBilling();
      }
      if(ev.value == false){
        this.editBill=false;
      }
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if(this.editBill){
      this.editBill=false;
      this.cdr.detectChanges();
    }
    if(this.deleteBill){
      this.deleteBill=false;
      this.cdr.detectChanges();
    }
    if(this.showOrderDetails){
      this.showOrderDetails=false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.loading=true;
    let today = new Date();
    today.setMonth(today.getMonth()-1);
    this.selectedDate = today.toISOString();
    this.initPartyInfo();
  }

  initPartyInfo(): void {
    combineLatest([this.auth.loginInfo$, this.auth.sellerId$])
      .pipe(take(1))
      .subscribe(([li, sellerId]) => {
        if (!li) { initFlowbite(); return; }

        this.seller = sellerId || '';
        const activeId = this.orgCtx.current ?? li.logged_as ?? li.id;

        if (activeId && activeId !== li.id) {
          const org = (li.organizations || []).find(o => o.id === activeId);
          this.partyInfo = {
            id: this.seller,
            name: org?.name ?? this.seller,
            href: this.seller,
            role: 'Owner'
          };
        } else {
          this.partyInfo = {
            id: this.seller,
            name: li.user || li.username || this.seller,
            href: this.seller,
            role: 'Owner'
          };
        }

        this.getBilling();
        initFlowbite();
      });
  }

  getBilling(){
    let isBillSelected=false;
    this.accountService.getBillingAccount().then(data => {
      this.billing_accounts=[];
      for(const element of data){
        isBillSelected=false;
        let email =''
        let phone=''
        let phoneType = ''
        let address = {
          "city": '',
          "country": '',
          "postCode": '',
          "stateOrProvince": '',
          "street": ''
        }
        for(let j=0; j<element.contact[0].contactMedium.length;j++){
          if(element.contact[0].contactMedium[j].mediumType == 'Email'){
            email = element.contact[0].contactMedium[j].characteristic.emailAddress
          } else if (element.contact[0].contactMedium[j].mediumType == 'PostalAddress'){
            address = {
              "city": element.contact[0].contactMedium[j].characteristic.city,
              "country": element.contact[0].contactMedium[j].characteristic.country,
              "postCode": element.contact[0].contactMedium[j].characteristic.postCode,
              "stateOrProvince": element.contact[0].contactMedium[j].characteristic.stateOrProvince,
              "street": element.contact[0].contactMedium[j].characteristic.street1
            }
          } else if (element.contact[0].contactMedium[j].mediumType == 'TelephoneNumber'){
            phone = element.contact[0].contactMedium[j].characteristic.phoneNumber
            phoneType = element.contact[0].contactMedium[j].characteristic.contactType
          }
          if(element.contact[0].contactMedium[j].preferred==true){
            isBillSelected=true;
          }
        }
        this.billing_accounts.push({
          "id": element.id,
          "href": element.href,
          "name": element.name,
          "email": email,
          "postalAddress": address,
          "telephoneNumber": phone,
          "telephoneType": phoneType,
          "selected": isBillSelected
        })
        if(isBillSelected){
          this.selectedBilling={
            "id": element.id,
            "href": element.href,
            "name": element.name,
            "email": email,
            "postalAddress": address,
            "telephoneNumber": phone,
            "selected": true
          }
        }
      }
      this.loading=false;
      if(this.billing_accounts.length>0){
        this.preferred=false;
      }else{
        this.preferred=true;
      }
      this.cdr.detectChanges();
    })
    
    this.cdr.detectChanges();
    initFlowbite();
  }

  selectBill(baddr: billingAccountCart){
    const index = this.billing_accounts.findIndex(item => item.id === baddr.id);
    for(let i=0; i < this.billing_accounts.length; i++){
      if(i==index){
        this.billing_accounts[i].selected=true;
        this.selectedBilling=this.billing_accounts[i];
      } else {
        this.billing_accounts[i].selected=false;
      }
      if(this.billing_accounts[i].selected==false){
        this.updateBilling(this.billing_accounts[i])
      }      
    }
    for(let i=0; i < this.billing_accounts.length; i++){
      if(this.billing_accounts[i].selected==true){
        this.updateBilling(this.billing_accounts[i])
      }      
    }
    this.cdr.detectChanges();
  }

  updateBilling(bill:billingAccountCart) {
      let bill_body = {
        name: bill.name,
        contact: [{
          contactMedium: [
            {
              mediumType: 'Email',
              preferred: bill.selected,
              characteristic: {
                contactType: 'Email',
                emailAddress: bill.email
              }
            },
            {
              mediumType: 'PostalAddress',
              preferred: bill.selected,
              characteristic: {
                contactType: 'PostalAddress',
                city: bill.postalAddress.city,
                country: bill.postalAddress.country,
                postCode: bill.postalAddress.postCode,
                stateOrProvince: bill.postalAddress.stateOrProvince,
                street1: bill.postalAddress.street
              }
            },
            {
              mediumType: 'TelephoneNumber',
              preferred: bill.selected,
              characteristic: {
                contactType: bill.telephoneType,
                phoneNumber: bill.telephoneNumber
              }
            }
          ]
        }],
        relatedParty: [this.partyInfo],
        state: "Defined"
      }
      this.accountService.updateBillingAccount(bill.id, bill_body).subscribe({
        next: data => {
          this.eventMessage.emitBillAccChange(false);
        },
        error: error => {
          console.error('There was an error while updating!', error);
          if(error.error.error){
            console.error(error)
            this.errorMessage='Error: '+error.error.error;
          } else {
            this.errorMessage='¡Hubo un error al actualizar la cuenta de facturación!';
          }
          this.showError=true;
          setTimeout(() => {
            this.showError = false;
          }, 3000);
        }
      });
  }

  onDeletedBill(baddr: billingAccountCart) {
    //this.accountService.deleteBillingAccount(baddr.id).subscribe(() => this.getBilling());
    this.deleteBill=false;
    this.cdr.detectChanges();
  }

  toggleEditBill(bill:billingAccountCart){
    this.billToUpdate=bill;    
    this.editBill=true;
    this.cdr.detectChanges();
  }

  toggleDeleteBill(bill:billingAccountCart){
    this.deleteBill=true;
    this.billToDelete=bill;
  }

}