import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountServiceService } from 'src/app/services/account-service.service';
import {LocalStorageService} from "src/app/services/local-storage.service";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { countries } from 'src/app/models/country.const'
import {EventMessageService} from "src/app/services/event-message.service";
import { initFlowbite } from 'flowbite';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { NgClass } from '@angular/common';
import { combineLatest, take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

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
  seller:any='';
  token:string='';
  email:string='';
  userProfileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    treatment: new FormControl(''),
    maritalstatus: new FormControl(''),
    gender: new FormControl(''),
    nacionality: new FormControl(''),
    birthdate: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl(''),
  });
  dateRange = new FormControl();
  selectedDate:any;
  countries: any[] = countries;
  preferred:boolean=false;

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

      this.getProfile();
      initFlowbite();
    });
  }

  getProfile(){
    this.accountService.getUserInfo(this.seller).then(data=> { 
      this.profile=data;
      this.loadProfileData(this.profile)
      this.loading=false;
      this.cdr.detectChanges();
    })

    this.cdr.detectChanges();
    initFlowbite();
  }

  updateProfile(){
    let profile = {
      "id": this.seller,
      "href": this.seller,
      "countryOfBirth": this.userProfileForm.value.country,
      "familyName": this.userProfileForm.value.lastname,
      "gender": this.userProfileForm.value.gender,
      "givenName": this.userProfileForm.value.name,
      "maritalStatus": this.userProfileForm.value.maritalstatus,
      "nationality": this.userProfileForm.value.nacionality,
      "placeOfBirth": this.userProfileForm.value.city,
      "title": this.userProfileForm.value.treatment,
      "birthDate": this.userProfileForm.value.birthdate
    }
    this.accountService.updateUserInfo(this.seller,profile).subscribe({
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
            console.log(error)
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
    this.userProfileForm.controls['maritalstatus'].setValue(profile.maritalStatus);
    this.userProfileForm.controls['gender'].setValue(profile.gender);
    this.userProfileForm.controls['nacionality'].setValue(profile.nacionality);
    this.userProfileForm.controls['city'].setValue(profile.placeOfBirth);
    this.userProfileForm.controls['country'].setValue(profile.countryOfBirth);
  }

}
