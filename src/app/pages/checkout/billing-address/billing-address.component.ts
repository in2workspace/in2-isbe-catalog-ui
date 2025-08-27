import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {billingAccountCart} from "../../../models/interfaces";
import {TranslateModule} from "@ngx-translate/core";
import {NgClass} from "@angular/common";
import {BillingAccountFormComponent} from "../../../shared/billing-account-form/billing-account-form.component";
import { AccountServiceService } from 'src/app/services/account-service.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {EventMessageService} from "../../../services/event-message.service";

@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrl: './billing-address.component.css'
})
export class BillingAddressComponent {
  @Input() position: number = 0;
  @Input() data: billingAccountCart = {
    id: '',
    href: '',
    name: '',
    email: '',
    postalAddress: {
      city: '',
      country: '',
      postCode: '',
      stateOrProvince: '',
      street: ''
    },
    telephoneNumber: '',
    telephoneType: '',
    selected: false
  };
  @Output() selectedEvent= new EventEmitter<billingAccountCart>();
  @Output() deletedEvent= new EventEmitter<billingAccountCart>();

  constructor(
    private localStorage: LocalStorageService,
    private accountService: AccountServiceService,
    private eventMessage: EventMessageService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.value == false){
        this.editBill=false;
      }
    })
  }

  @HostListener('document:click')
  onClick() {
    if(this.editBill==true){
      this.editBill=false;
    }
    if(this.deleteBill==true){
      this.deleteBill=false;
    }
  }

  editBill: boolean = false;
  deleteBill: boolean = false;

  selectBillingAddress($event:Event){
    this.selectedEvent.emit(this.data)
    this.data.selected = true;
  }

  deleteBAddr(){
    console.log("deleting " + this.data.id)
    this.deletedEvent.emit(this.data)
  }

  onDeletedBill(baddr: billingAccountCart) {
    console.log('--- DELETE BILLING ADDRESS ---')
    /*this.accountService.deleteBillingAccount(baddr.id).subscribe(() => {
      this.eventMessage.emitBillAccChange(true);
      this.deleteBill=false;
    });*/
    this.deleteBill=false;
  }
}
