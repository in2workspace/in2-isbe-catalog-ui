import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  Input
} from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {AccountServiceService} from 'src/app/services/account-service.service';
import {LocalStorageService} from "../../services/local-storage.service";
import {Router} from '@angular/router';
import {components} from "../../models/product-catalog";

type ProductOffering = components["schemas"]["ProductOffering"];
import {phoneNumbers, countries} from '../../models/country.const'
import {initFlowbite} from 'flowbite';
import * as moment from 'moment';
import {LoginInfo, billingAccountCart} from 'src/app/models/interfaces';
import {EventMessageService} from "../../services/event-message.service";
import {getCountries, getCountryCallingCode, CountryCode} from 'libphonenumber-js'
import {parsePhoneNumber} from 'libphonenumber-js/max'
import {TranslateModule} from "@ngx-translate/core";
import { getLocaleId, NgClass } from '@angular/common';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { OrgContextService } from 'src/app/services/org-context.service';


@Component({
    selector: 'app-billing-account-form',
    templateUrl: './billing-account-form.component.html',
    styleUrl: './billing-account-form.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, NgClass, ReactiveFormsModule]
})
export class BillingAccountFormComponent implements OnInit {

  @Input() billAcc: billingAccountCart | undefined;
  @Input() preferred: boolean | undefined;

  billingForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(250)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), Validators.maxLength(320)]),
    country: new FormControl('', [Validators.required, Validators.maxLength(250)]),
    city: new FormControl('', [Validators.required, Validators.maxLength(250)]),
    stateOrProvince: new FormControl('', [Validators.required, Validators.maxLength(250)]),
    postCode: new FormControl('', [Validators.required, Validators.maxLength(250)]),
    street: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    telephoneNumber: new FormControl('', [Validators.required, Validators.min(0)]),
    telephoneType: new FormControl('Mobile')
  });
  prefixes: any[] = phoneNumbers;
  countries: any[] = countries;
  phonePrefix: any = phoneNumbers[0];
  prefixCheck: boolean = false;
  toastVisibility: boolean = false;

  seller: any;
  partyInfo:any = {
    id: '',
    name: '',
    href: ''
  }
  loading: boolean = false;
  is_create: boolean = false;

  errorMessage:any='';
  showError:boolean=false;

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountServiceService,
    private eventMessage: EventMessageService,
    private orgCtx: OrgContextService
  ) {
    getLocaleId;
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initUserData();
      }
    })
  }


  ngOnInit() {
    this.loading = true;
    if (this.billAcc != undefined) {
      this.is_create = false;
    } else {
      this.is_create = true;
    }
    this.initUserData();
    if (this.is_create == false) {
      this.setDefaultValues();
    } else {
      this.detectCountry();
    }

  }

  initUserData(): void {
    combineLatest([
      this.auth.loginInfo$,
      this.auth.sellerId$,
      this.orgCtx.getOrganization(),
    ])
    .pipe(take(1))
    .subscribe(([li, sellerId, orgId]) => {
      if (!li) return;
      this.seller = sellerId || '';

      const activeId = orgId ?? li.logged_as ?? li.id;

      if (activeId && activeId !== li.id) {
        const org = (li.organizations || []).find(o => o.id === activeId);
        this.partyInfo = {
          id: this.seller,
          name: org?.name ?? this.seller,
          href: this.seller,
          role: 'Owner',
        };
      } else {
        this.partyInfo = {
          id: this.seller,
          name: li.user || li.username || this.seller,
          href: this.seller,
          role: 'Owner',
        };
      }
    });
  }

  setDefaultValues() {
    if (this.billAcc != undefined) {
      const phoneNumber = parsePhoneNumber(this.billAcc.telephoneNumber)
      if (phoneNumber) {
        let pref = this.prefixes.filter(item => item.code === '+' + phoneNumber.countryCallingCode);
        if (pref.length > 0) {
          this.phonePrefix = pref[0];
        }
        this.billingForm.controls['telephoneNumber'].setValue(phoneNumber.nationalNumber);
      }
      //Get old bilAcc values
      this.billingForm.controls['name'].setValue(this.billAcc.name);
      this.billingForm.controls['email'].setValue(this.billAcc.email);
      this.billingForm.controls['country'].setValue(this.billAcc.postalAddress.country);
      this.billingForm.controls['city'].setValue(this.billAcc.postalAddress.city);
      this.billingForm.controls['stateOrProvince'].setValue(this.billAcc.postalAddress.stateOrProvince);
      this.billingForm.controls['street'].setValue(this.billAcc.postalAddress.street);
      this.billingForm.controls['postCode'].setValue(this.billAcc.postalAddress.postCode);
      this.billingForm.controls['telephoneType'].setValue(this.billAcc.telephoneType);
    }
    this.cdr.detectChanges()
  }

  resetBillingForm(): void {
    this.billingForm.reset({
      telephoneType: 'Mobile'
    });
    
  
    Object.values(this.billingForm.controls).forEach(control => {
      control.setErrors(null); // clear errors
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  createBilling() {
    try{
        const phoneNumber = parsePhoneNumber(this.phonePrefix.code + this.billingForm.value.telephoneNumber);
        if (phoneNumber) {
        if (!phoneNumber.isValid()) {
            this.billingForm.controls['telephoneNumber'].setErrors({'invalidPhoneNumber': true});
            this.toastVisibility = true;
            setTimeout(() => {
            this.toastVisibility = false
            }, 2000);
            return;
        } else {
            this.billingForm.controls['telephoneNumber'].setErrors(null);
            this.toastVisibility = false;
        }
        }
    }
    catch (error){
        this.billingForm.controls['telephoneNumber'].setErrors({'invalidPhoneNumber': true});
        this.toastVisibility = true;
        setTimeout(() => {
        this.toastVisibility = false
        }, 2000);
        return;
    }

    if (this.billingForm.invalid) {
      this.toastVisibility = true;
      setTimeout(() => {
        this.toastVisibility = false
      }, 2000);
      return;
    } else {
      let billacc = {
        name: this.billingForm.value.name,
        contact: [{
          contactMedium: [
            {
              mediumType: 'Email',
              preferred: this.preferred,
              characteristic: {
                contactType: 'Email',
                emailAddress: this.billingForm.value.email
              }
            },
            {
              mediumType: 'PostalAddress',
              preferred: this.preferred,
              characteristic: {
                contactType: 'PostalAddress',
                city: this.billingForm.value.city,
                country: this.billingForm.value.country,
                postCode: this.billingForm.value.postCode,
                stateOrProvince: this.billingForm.value.stateOrProvince,
                street1: this.billingForm.value.street
              }
            },
            {
              mediumType: 'TelephoneNumber',
              preferred: this.preferred,
              characteristic: {
                contactType: this.billingForm.value.telephoneType,
                phoneNumber: this.phonePrefix.code + this.billingForm.value.telephoneNumber
              }
            }
          ]
        }],
        relatedParty: [this.partyInfo],
        state: "Defined"
      }
      this.accountService.postBillingAccount(billacc).subscribe({
        next: data => {
          this.eventMessage.emitBillAccChange(true);
          this.resetBillingForm();
        },
        error: error => {
          console.error('There was an error while creating!', error);
          if(error.error.error){
            console.error(error)
            this.errorMessage='Error: '+error.error.error;
          } else {
            this.errorMessage='¡Hubo un error al crear la cuenta de facturación!';
          }
          this.showError=true;
          setTimeout(() => {
            this.showError = false;
          }, 3000);
        }
      });
    }
  }

  updateBilling() {
    try{
        const phoneNumber = parsePhoneNumber(this.phonePrefix.code + this.billingForm.value.telephoneNumber);
        if (phoneNumber) {
          if (!phoneNumber.isValid()) {
            this.billingForm.controls['telephoneNumber'].setErrors({'invalidPhoneNumber': true});
            this.toastVisibility = true;
            setTimeout(() => {
              this.toastVisibility = false
            }, 2000);
            return;
          } else {
            this.billingForm.controls['telephoneNumber'].setErrors(null);
            this.toastVisibility = false;
          }
        }
    }catch (error){
        this.billingForm.controls['telephoneNumber'].setErrors({'invalidPhoneNumber': true});
        this.toastVisibility = true;
        setTimeout(() => {
            this.toastVisibility = false
        }, 2000);
        return;
    }
    if (this.billingForm.invalid) {
      if (this.billingForm.get('email')?.invalid == true) {
        this.billingForm.controls['email'].setErrors({'invalidEmail': true});
      } else {
        this.billingForm.controls['email'].setErrors(null);
      }

      this.toastVisibility = true;
      setTimeout(() => {
        this.toastVisibility = false
      }, 2000);
      return;
    } else {
      if (this.billAcc != undefined) {
        let bill_body = {
          name: this.billingForm.value.name,
          contact: [{
            contactMedium: [
              {
                mediumType: 'Email',
                preferred: this.billAcc.selected,
                characteristic: {
                  contactType: 'Email',
                  emailAddress: this.billingForm.value.email
                }
              },
              {
                mediumType: 'PostalAddress',
                preferred: this.billAcc.selected,
                characteristic: {
                  contactType: 'PostalAddress',
                  city: this.billingForm.value.city,
                  country: this.billingForm.value.country,
                  postCode: this.billingForm.value.postCode,
                  stateOrProvince: this.billingForm.value.stateOrProvince,
                  street1: this.billingForm.value.street
                }
              },
              {
                mediumType: 'TelephoneNumber',
                preferred: this.billAcc.selected,
                characteristic: {
                  contactType: this.billingForm.value.telephoneType,
                  phoneNumber: this.phonePrefix.code + this.billingForm.value.telephoneNumber
                }
              }
            ]
          }],
          relatedParty: [this.partyInfo],
          state: "Defined"
        }
        this.accountService.updateBillingAccount(this.billAcc.id, bill_body).subscribe({
          next: data => {
            this.eventMessage.emitBillAccChange(false);
            this.resetBillingForm();
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
    }
  }

  selectPrefix(pref:any) {
    this.prefixCheck = false;
    this.phonePrefix = pref;
  }

  detectCountry() {
    const userLanguage = navigator.language;
    const countryCode = userLanguage.split('-')[1];
    let detectedCountry = countryCode.toUpperCase() as CountryCode;  
    let code = getCountryCallingCode(detectedCountry);
    if (code) {
      let pref = this.prefixes.filter(item => item.code === '+' + code);
      if (pref.length > 0) {
        this.phonePrefix = pref[0];
      }
    }
  }
}
