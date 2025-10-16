import { Component, OnInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountServiceService } from 'src/app/services/account-service.service';
import {EventMessageService} from "../../services/event-message.service";
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
    selector: 'app-organization-details',
    templateUrl: './organization-details.component.html',
    styleUrl: './organization-details.component.css',
    standalone: true,
    imports: [TranslateModule, MarkdownComponent]
})
export class OrganizationDetailsComponent implements OnInit {

  id:any;
  orgInfo:any;
  logo:any='https://placehold.co/600x400/svg';
  description:any=undefined;
  website:any;

  mediumTypeKey: Record<string,string> = {
    Email: 'PROFILE._email',
    PostalAddress: 'PROFILE._postalAddress',
    TelephoneNumber: 'PROFILE._phone',
  };


  constructor(
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private localStorage: LocalStorageService,
    private eventMessage: EventMessageService,
    private accService: AccountServiceService,
    private location: Location
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.accService.getOrgInfo(this.id).then(org => {
      this.orgInfo=org;
      for(let i=0; i<this.orgInfo.partyCharacteristic.length;i++){
        if(this.orgInfo.partyCharacteristic[i].name=='logo'){
          this.logo=this.orgInfo.partyCharacteristic[i].value
        }
        if(this.orgInfo.partyCharacteristic[i].name=='website'){
          this.website=this.orgInfo.partyCharacteristic[i].value
        }
        if(this.orgInfo.partyCharacteristic[i].name=='description'){
          this.description=this.orgInfo.partyCharacteristic[i].value
        }
      }
      if(this.logo==undefined){
        this.logo='https://placehold.co/600x400/svg';
      }
    })
  }

  back(){
    this.location.back();
  }

}
