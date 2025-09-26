import { Component, OnDestroy, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './services/local-storage.service';
import { EventMessageService } from './services/event-message.service';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { RefreshLoginServiceService } from 'src/app/services/refresh-login-service.service';
import * as moment from 'moment';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { AuthService } from './guard/auth.service';
import { Subscription, combineLatest, of, timer } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { decodeJwt } from './guard/jwt.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FooterComponent, RouterOutlet, HeaderComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ISBE Catalog';
  showPanel = false;

  private refreshSub?: Subscription;
  private navSub?: Subscription;
  private loginEventSub?: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly localStorage: LocalStorageService,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly refreshApi: RefreshLoginServiceService
  ) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('es');
    const currLang = this.localStorage.getItem('current_language');
    if (!currLang) {
      this.localStorage.setItem('current_language', 'es');
      this.translate.use('es');
    } else {
      this.translate.use(currLang);
    }

    if (!this.localStorage.getObject('selected_categories'))
      this.localStorage.setObject('selected_categories', []);
    if (!this.localStorage.getObject('cart_items'))
      this.localStorage.setObject('cart_items', []);
    if (!this.localStorage.getItem('accessToken'))
      this.localStorage.setItem('accessToken', "");
  }

  ngOnInit(): void {
    initFlowbite();
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    this.refreshSub = combineLatest([
      this.authService.isLoggedIn(),
      this.authService.getToken(),
    ])
      .pipe(
        map(([isAuth, token]) => {
          if (!isAuth || !token) return 0;

          const exp = decodeJwt<Record<string, any>>(token)?.['exp'] as number | undefined;
          if (!exp) return 0;

          const now = moment().unix();
          const remainingSeconds = exp - now - 4;
          return Math.max(0, remainingSeconds * 1000);
        }),
        switchMap((ms) => {
          this.refreshApi.stopInterval();
          if (ms > 0) {
            this.refreshApi.startInterval(ms);
            return timer(ms);
          }
          return of(0);
        })
      )
      .subscribe();

    this.loginEventSub = this.eventMessage.messages$.subscribe((ev) => {
      if (ev.type === 'LoginProcess') {
        const expire = (ev as any)?.value?.expire as number | undefined;
        if (expire && expire - moment().unix() - 4 > 0) {
          this.refreshApi.stopInterval();
          const ms = (expire - moment().unix() - 4) * 1000;
          this.refreshApi.startInterval(ms);
        }
      }
    });

    this.authService.getUserData().pipe(take(1)).subscribe((u) => console.log('userData:', u));
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.navSub?.unsubscribe();
    this.loginEventSub?.unsubscribe();
    this.refreshApi.stopInterval();
  }
}

