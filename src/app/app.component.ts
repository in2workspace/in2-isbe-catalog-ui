import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './services/local-storage.service';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { HeaderBannerComponent } from './shared/header/header-banner/header-banner.component';
import { AuthService } from './guard/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FooterComponent, RouterOutlet, HeaderComponent, HeaderBannerComponent]
})
export class AppComponent implements OnInit {
  title = 'ISBE Catalog';
  showPanel = false;
  currentUrl = '';

  constructor(
    private readonly translate: TranslateService,
    private readonly localStorage: LocalStorageService,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {
    // Idioma
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('es');
    const currLang = this.localStorage.getItem('current_language');
    this.translate.use(currLang ?? 'es');

    if (!this.localStorage.getObject('selected_categories')) {
      this.localStorage.setObject('selected_categories', []);
    }
  }

  get showFooterGradient(): boolean {
    return ['/about', '/publish'].some(route => this.currentUrl.startsWith(route));
  }

  ngOnInit(): void {
    initFlowbite();
    this.auth.checkAuth().subscribe();
    if (!this.localStorage.getObject('selected_categories')) {
      this.localStorage.setObject('selected_categories', []);
    }
    if (!this.localStorage.getObject('cart_items')) {
      this.localStorage.setObject('cart_items', []);
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
