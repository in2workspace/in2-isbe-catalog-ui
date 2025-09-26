// src/app/dashboard/dashboard.component.ts
import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventMessageService } from '../../services/event-message.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { RefreshLoginServiceService } from 'src/app/services/refresh-login-service.service';
import { StatsServiceService } from 'src/app/services/stats-service.service';
import { LoginServiceService } from 'src/app/services/login-service.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { environment } from 'src/environments/environment';
import { PlatformBenefitsComponent } from 'src/app/offerings/platform-benefits/platform-benefits.component';
import { GalleryComponent } from 'src/app/offerings/gallery/gallery.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { AuthService } from 'src/app/guard/auth.service';
import { decodeJwt } from 'src/app/guard/jwt.util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
  imports: [PlatformBenefitsComponent, GalleryComponent, TranslateModule, NgClass, ReactiveFormsModule],
})
export class DashboardComponent implements OnInit {
  isFilterPanelShown = false;
  showContact = false;
  searchField = new FormControl();
  searchEnabled = environment.SEARCH_ENABLED;
  domePublish: string = environment.ISBE_PUBLISH_LINK;
  domeRegister: string = environment.ISBE_REGISTER_LINK;
  services: string[] = [];
  publishers: string[] = [];
  categories: any[] = [];
  currentIndexServ = 0;
  currentIndexPub = 0;
  delay = 2000;

  private readonly ACCESS_TOKEN_KEY = 'accessToken';

  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly eventMessage: EventMessageService,
    private readonly statsService: StatsServiceService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiServiceService,
    private readonly loginService: LoginServiceService,
    private readonly cdr: ChangeDetectorRef,
    private readonly refreshApi: RefreshLoginServiceService,
    private readonly auth: AuthService
  ) {
    this.eventMessage.messages$.subscribe((ev) => {
      if (ev.type === 'FilterShown') {
        this.isFilterPanelShown = ev.value as boolean;
      }
      if (ev.type === 'CloseContact') {
        this.showContact = false;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('document:click')
  onClick() {
    if (this.showContact) {
      this.showContact = false;
      this.cdr.detectChanges();
    }
  }

  startTagTransition() {
    setInterval(() => {
      this.currentIndexServ = (this.currentIndexServ + 1) % (this.services?.length || 1);
      this.currentIndexPub = (this.currentIndexPub + 1) % (this.publishers?.length || 1);
    }, this.delay);
  }

  async ngOnInit() {
    this.statsService.getStats().then((data) => {
      this.services = data?.services ?? [];
      this.publishers = data?.organizations ?? [];
      this.startTagTransition();
    });

    this.isFilterPanelShown = JSON.parse(this.localStorage.getItem('is_filter_panel_shown') as string);
    this.api.getLaunchedCategories().then((data) => {
      for (let i = 0; i < data.length; i++) if (data[i].isRoot === true) this.categories.push(data[i]);
      initFlowbite();
      this.cdr.detectChanges();
    });

    const qpToken = this.route.snapshot.queryParamMap.get('token');
    if (qpToken) {
      try {
        const data = await this.loginService.getLogin(qpToken);
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);
        this.auth.reloadFromSession?.();
        if (data.expire && data.expire > moment().unix() + 4) {
          this.refreshApi.scheduleFromExp(data.expire);
        } else {
          await this.refreshApi.scheduleFromCurrentToken();
        }
      } catch (err) {
        console.error('Error exchanging token:', err);
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        this.refreshApi.stopInterval();
      } finally {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } else {
      const existing = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (existing) {
        let exp = decodeJwt<Record<string, any>>(existing)?.['exp'] as number | undefined;
        exp = moment().unix() + 10; //TODO delete
        if (exp && exp > moment().unix() + 4) {
          this.refreshApi.scheduleFromExp(exp);
        } else {
          await this.refreshApi.scheduleFromCurrentToken();
        }
      }
    }

    this.showContact = true;
    this.cdr.detectChanges();
  }

  filterSearch(event: any) {
    if (this.searchField.value !== '' && this.searchField.value != null) {
      this.router.navigate(['/search', { keywords: this.searchField.value }]);
    } else {
      this.router.navigate(['/search']);
    }
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
