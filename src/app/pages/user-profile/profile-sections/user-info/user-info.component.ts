import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountServiceService } from 'src/app/services/account-service.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { countries } from 'src/app/models/country.const'
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { NgClass } from '@angular/common';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
type TokenPayload = Record<string, any>;
@Component({
    selector: 'user-info',
    templateUrl: './user-info.component.html',
    styleUrl: './user-info.component.css',
    standalone: true,
    imports: [TranslateModule, ErrorMessageComponent, NgClass,ReactiveFormsModule]
})
export class UserInfoComponent implements OnInit {
  loading: boolean = false;
  orders:any[]=[];
  profile:any;
  id:any;
  token:string='';
  email:string='';
  userProfileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    treatment: new FormControl(''),
    maritalstatus: new FormControl(''),
    gender: new FormControl(''),
    nationality: new FormControl(''),
    birthdate: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl(''),
  });
  dateRange = new FormControl();
  selectedDate:any;
  countries: any[] = countries;
  preferred:boolean=false;
  seller:string='';

  errorMessage:any='';
  showError:boolean=false;
  successVisibility:boolean=false;

  constructor(
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly accountService: AccountServiceService,
    private readonly eventMessage: EventMessageService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'ChangedSession') {
        this.initPartyInfo();
      }
    })
  }

  ngOnInit() {
    this.loading=true;
    let today = new Date();
    today.setMonth(today.getMonth()-1);
    this.selectedDate = today.toISOString();
    this.initPartyInfo();
    this.userProfileForm.disable({ emitEvent: false });
  }

  initPartyInfo(): void {
    combineLatest([
      this.auth.sellerId$,
      this.auth.loginInfo$,
      this.auth.accessToken$,
    ])
    .pipe(take(1))
    .subscribe(([sellerId, li, accessToken]) => {
      if (!li) { initFlowbite(); return; }

      this.seller = sellerId || '';
      this.email  = li.email || '';
      this.token  = accessToken || li.token || '';
      this.id = li.userId;
      this.loadFromAccessToken(this.token);
      this.getProfile();
      initFlowbite();
    });
  }

  getProfile(){
    /*this.accountService.getUserInfo(this.id).then(data=> { 
      this.profile=data[0];
      this.loadProfileData(this.profile)
      
      this.cdr.detectChanges();
    })*/
    this.loading=false;

    this.cdr.detectChanges();
    initFlowbite();
  }

  updateProfile(){
    let profile = {
      "id": this.id,
      "href": this.id,
      "countryOfBirth": this.userProfileForm.value.country,
      "familyName": this.userProfileForm.value.lastname,
      "gender": this.userProfileForm.value.gender,
      "givenName": this.userProfileForm.value.name,
      "maritalStatus": this.userProfileForm.value.maritalstatus,
      "nationality": this.userProfileForm.value.nationality,
      "placeOfBirth": this.userProfileForm.value.city,
      "title": this.userProfileForm.value.treatment,
      "birthDate": this.userProfileForm.value.birthdate
    }
    this.accountService.updateUserInfo(this.seller, this.id,profile).subscribe({
      next: data => {
        this.userProfileForm.reset();
        this.getProfile();
        this.successVisibility = true;
        setTimeout(() => {
          this.successVisibility = false
        }, 2000);       
        this.getProfile();        
      },
      error: error => {
          console.error('There was an error while updating!', error);
          if(error.error.error){
            console.error(error)
            this.errorMessage='Error: '+error.error.error;
          } else {
            this.errorMessage='¡Hubo un error al actualizar el perfil!';
          }
          this.showError=true;
          setTimeout(() => {
            this.showError = false;
          }, 3000);
      }
    });
  }

  loadProfileData(profile:any){
    this.userProfileForm.controls['name'].setValue(profile.givenName);
    this.userProfileForm.controls['lastname'].setValue(profile.familyName);

    this.userProfileForm.controls['treatment'].setValue(profile.title);
    this.userProfileForm.controls['maritalstatus'].setValue(profile.maritalStatus);

    this.userProfileForm.controls['gender'].setValue(profile.gender);
    this.userProfileForm.controls['nationality'].setValue(profile.nationality);

    this.userProfileForm.controls['birthdate'].setValue(profile.birthDate);
    this.userProfileForm.controls['city'].setValue(profile.placeOfBirth);
    this.userProfileForm.controls['country'].setValue(profile.countryOfBirth);
  }

  private mapTokenToProfile(payload: TokenPayload): any {
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = payload?.[k];
        if (v !== undefined && v !== null && v !== '') return v;
      }
      return '';
    };

    const rawBirth = pick('birthdate', 'birthDate', 'date_of_birth', 'dob');
    const birthDate = this.normalizeBirthDate(rawBirth);

    return {
      givenName: pick('given_name', 'givenName', 'name', 'first_name'),
      familyName: pick('family_name', 'familyName', 'lastname', 'last_name'),
      title: pick('title', 'treatment', 'salutation'),
      maritalStatus: pick('marital_status', 'maritalStatus'),
      gender: pick('gender'),
      nationality: pick('nationality'),
      placeOfBirth: pick('place_of_birth', 'placeOfBirth', 'city'),
      countryOfBirth: pick('country_of_birth', 'countryOfBirth', 'country'),
      birthDate,
    };
  }

  private normalizeBirthDate(value: any): string {
    if (!value) return '';

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    if (typeof value === 'string') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return value;
    }

    if (typeof value === 'number') {
      const ms = value < 10_000_000_000 ? value * 1000 : value;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }

    return '';
  }

  private loadFromAccessToken(token: string): void {
    const payload = this.auth.decodeJwtPayload(token);
    if (!payload) return;

    const profile = this.mapTokenToProfile(payload);
    this.loadProfileData(profile);
  }

}
