import {Component, HostListener, OnInit, ChangeDetectorRef} from '@angular/core';
import {EventMessageService} from "../../services/event-message.service";
import {LocalStorageService} from "../../services/local-storage.service";
import { ApiServiceService } from 'src/app/services/product-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginInfo } from 'src/app/models/interfaces';
import { StatsServiceService } from "src/app/services/stats-service.service"
import { LoginServiceService } from "src/app/services/login-service.service"
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { environment } from 'src/environments/environment';
import { PlatformBenefitsComponent } from 'src/app/offerings/platform-benefits/platform-benefits.component';
import { GalleryComponent } from 'src/app/offerings/gallery/gallery.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    standalone: true,
    imports: [PlatformBenefitsComponent, GalleryComponent, TranslateModule, NgClass, ReactiveFormsModule]
})
export class DashboardComponent implements OnInit {

  isFilterPanelShown = false;
  showContact:boolean=false;
  searchField = new FormControl();
  searchEnabled = environment.SEARCH_ENABLED;
  domePublish: string = environment.ISBE_PUBLISH_LINK
  domeRegister: string = environment.ISBE_REGISTER_LINK
  services: string[] = []
  publishers: string[] = []
  categories:any[]=[];
  currentIndexServ: number = 0;
  currentIndexPub: number = 0;
  delay: number = 2000;
  
  constructor(private readonly localStorage: LocalStorageService,
              private readonly eventMessage: EventMessageService,
              private readonly statsService : StatsServiceService,
              private readonly route: ActivatedRoute,
              private readonly router: Router,
              private readonly api: ApiServiceService,
              private readonly loginService: LoginServiceService,
              private readonly cdr: ChangeDetectorRef) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'FilterShown') {
        this.isFilterPanelShown = ev.value as boolean;
      }
      if(ev.type == 'CloseContact'){
        this.showContact=false;
        this.cdr.detectChanges();
      }
    })
  }
  @HostListener('document:click')
  onClick() {
    if(this.showContact){
      this.showContact=false;
      this.cdr.detectChanges();
    }
  }

  startTagTransition() {
    setInterval(() => {
      this.currentIndexServ = (this.currentIndexServ + 1) % this.services?.length;
      this.currentIndexPub = (this.currentIndexPub + 1) % this.publishers?.length;
    }, this.delay);
  }

  async ngOnInit() {
    this.statsService.getStats().then(data=> {
      this.services=data?.services ?? [];
      this.publishers=data?.organizations ?? [];
      this.startTagTransition();
    })
    this.isFilterPanelShown = JSON.parse(this.localStorage.getItem('is_filter_panel_shown') as string);
    if(this.route.snapshot.queryParamMap.get('token') != null){    
      this.loginService.getLogin(this.route.snapshot.queryParamMap.get('token')).then(data => {
        let info = {
          "id": data.id,
          "user": data.username,
          "email": data.email,
          "token": data.accessToken,
          "expire": data.expire,
          "seller": data.seller,
          "roles": data.roles,
          "organizations": data.organizations,
          "logged_as": data.id } as LoginInfo;

        if (info.organizations != null && info.organizations.length > 0) {
          info.logged_as = info.organizations[0].id
        }

        this.localStorage.setItem("accessToken",data.accessToken);
        this.eventMessage.emitLogin(info);
      })      
      this.router.navigate(['/dashboard'])
    } 
    this.api.getLaunchedCategories().then(data => {
      for(const element of data){
        if(element.isRoot){
          this.categories.push(element)
        }        
      }
      initFlowbite();
      this.cdr.detectChanges();
    })

    this.showContact = true;

    this.cdr.detectChanges();
  }

  filterSearch(event: any) {
    if(this.searchField.value!='' && this.searchField.value != null){
      this.router.navigate(['/search', {keywords: this.searchField.value}]);
    } else {
      this.router.navigate(['/search']);
    }  
  }

  goTo(path:string) {
    this.router.navigate([path]);
  }
  
}
