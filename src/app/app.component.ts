import {Component, OnInit} from '@angular/core';
import { initFlowbite } from 'flowbite';
import { TranslateService } from '@ngx-translate/core';
import {LocalStorageService} from "./services/local-storage.service";
import {EventMessageService} from "./services/event-message.service";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoginInfo } from 'src/app/models/interfaces';
import { RefreshLoginServiceService } from "src/app/services/refresh-login-service.service";
import * as moment from 'moment';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FooterComponent, RouterOutlet, HeaderComponent]
})
export class AppComponent implements OnInit {
  title = 'DOME Marketplace';
  showPanel = false;

  constructor(private readonly translate: TranslateService,
              private readonly localStorage: LocalStorageService,
              private readonly eventMessage: EventMessageService,
              private readonly router: Router,
              private readonly refreshApi: RefreshLoginServiceService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('es');
    let currLang = this.localStorage.getItem('current_language')
    if(!currLang || currLang == null) {
      this.localStorage.setItem('current_language', 'es');
      this.translate.use('es');
    } else {
      this.translate.use(currLang);
    }
    if(!this.localStorage.getObject('selected_categories'))
      this.localStorage.setObject('selected_categories', []);
  }

  ngOnInit(): void {
    initFlowbite();
    if(!this.localStorage.getObject('selected_categories'))
      this.localStorage.setObject('selected_categories', []);
    if(!this.localStorage.getObject('cart_items'))
      this.localStorage.setObject('cart_items', []);
    if(!this.localStorage.getObject('login_items'))
      this.localStorage.setObject('login_items', {});
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'LoginProcess') {
        this.refreshApi.stopInterval();
        let info = ev.value as LoginInfo;

        console.log('STARTING INTERVAL')
        console.log(info.expire)
        console.log(((info.expire - moment().unix()) - 4))

        this.refreshApi.startInterval(((info.expire - moment().unix())-4)*1000, ev);
      }
    })
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    if(JSON.stringify(aux) === '{}'){
      //this.siopInfo.getSiopInfo().subscribe((data)=>{
      //  environment.SIOP_INFO = data
      //})
    }
    else if (((aux.expire - moment().unix())-4) > 0) {
      this.refreshApi.stopInterval();
      this.refreshApi.startInterval(((aux.expire - moment().unix())-4)*1000, aux);
      console.log('token')
      console.log(aux.token)
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // or just window.scrollTo(0, 0);
      }
    });
  }
}
