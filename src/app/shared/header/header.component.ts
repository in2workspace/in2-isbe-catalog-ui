import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  HostListener,
  DoCheck,
  OnDestroy,
  inject,
} from '@angular/core';
import {
  faCartShopping,
  faHandHoldingBox,
  faAddressCard,
  faArrowRightFromBracket,
  faBoxesStacked,
  faClipboardCheck,
  faBrain,
  faAnglesLeft,
  faUser,
  faUsers,
  faCogs,
  faReceipt,
  faRuler
} from '@fortawesome/sharp-solid-svg-icons';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { initFlowbite } from 'flowbite';
import * as uuid from 'uuid';
import { combineLatest, Subject, Subscription, takeUntil } from 'rxjs';

import { LocalStorageService } from '../../services/local-storage.service';
import { LoginServiceService } from 'src/app/services/login-service.service';
import { EventMessageService } from '../../services/event-message.service';
import { QrVerifierService } from 'src/app/services/qr-verifier.service';
import { ShoppingCartServiceService } from '../../services/shopping-cart-service.service';

import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { FaLayersComponent, FaIconComponent, FaLayersCounterComponent } from '@fortawesome/angular-fontawesome';

import { environment } from 'src/environments/environment';

import { OrgContextService } from 'src/app/services/org-context.service';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'bae-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [FaLayersComponent, FaIconComponent, FaLayersCounterComponent, CartDrawerComponent, TranslateModule]
})
export class HeaderComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {

  @ViewChild('theme_toggle_dark_icon') themeToggleDarkIcon!: ElementRef;
  @ViewChild('theme_toggle_light_icon') themeToggleLightIcon!: ElementRef;
  @ViewChild('navbarbutton') navbarbutton!: ElementRef;

  private readonly translate = inject(TranslateService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly loginService = inject(LoginServiceService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly eventMessage = inject(EventMessageService);
  private readonly router = inject(Router);
  private readonly qrVerifier = inject(QrVerifierService);
  private readonly sc = inject(ShoppingCartServiceService);
  private readonly auth = inject(AuthService);
  private readonly orgCtx = inject(OrgContextService);

  qrWindow: Window | null = null;
  statePair: string = '';
  catalogs: any[] = [];
  langs: string[] = [];
  defaultLang: string = 'es';
  showCart = false;
  is_logged = false;
  showLogin = false;
  loggedAsOrg = false;
  isAdmin = false;
  orgs: any[] = [];
  roles: string[] = [];
  username = '';
  email = '';
  usercharacters = '';
  cartCount = 0;
  isNavBarOpen = false;
  flagDropdownOpen = false;
  currentOrgId: string | null = null;

  knowledge: string = environment.KNOWLEDGE_BASE_URL;
  knowledge_onboarding: string = environment.KB_ONBOARDING_GUIDELINES_URL;
  knowledge_guidelines: string = environment.KB_GUIDELNES_URL;
  registration: string = environment.REGISTRATION_FORM_URL;
  ticketing: string = environment.TICKETING_SYSTEM_URL;
  domeAbout: string = environment.ISBE_ABOUT_LINK;
  domeRegister: string = environment.ISBE_REGISTER_LINK;
  domePublish: string = environment.ISBE_PUBLISH_LINK;

  public static readonly BASE_URL: string = environment.BASE_URL;
  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  loginSubscription: Subscription = new Subscription();
  private readonly destroy$ = new Subject<void>();

  protected readonly faCartShopping = faCartShopping;
  protected readonly faHandHoldingBox = faHandHoldingBox;
  protected readonly faAddressCard = faAddressCard;
  protected readonly faArrowRightFromBracket = faArrowRightFromBracket;
  protected readonly faBoxesStacked = faBoxesStacked;
  protected readonly faClipboardCheck = faClipboardCheck;
  protected readonly faBrain = faBrain;
  protected readonly faAnglesLeft = faAnglesLeft;
  protected readonly faUser = faUser;
  protected readonly faUsers = faUsers;
  protected readonly faCogs = faCogs;
  protected readonly faReceipt = faReceipt;
  protected readonly faRuler = faRuler;

  ngOnDestroy(): void {
    this.qrWindow?.close();
    this.qrWindow = null;
    this.loginSubscription.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngDoCheck(): void {
    if (this.qrWindow?.closed) {
      this.qrVerifier.stopChecking(this.qrWindow);
      this.qrWindow = null;
    }
  }

  @HostListener('document:click')
  onClick() {
    if (this.showCart) {
      this.showCart = false;
      this.cdr.detectChanges();
    }
    if (this.isNavBarOpen) {
      this.isNavBarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isNavBarOpen && this.navbarbutton) {
      this.navbarbutton.nativeElement.blur();
      this.isNavBarOpen = false;
    }
  }

  async ngOnInit() {
    this.langs = this.translate.getLangs().length ? this.translate.getLangs() : ['es', 'en'];
    const currLang = this.localStorage.getItem('current_language');
    this.defaultLang = currLang ?? 'es';
    this.translate.use(this.defaultLang);
    
    if (!this.localStorage.getObject('selected_categories')) {
      this.localStorage.setObject('selected_categories', []);
    }

    this.sc.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      this.cartCount = cart.length;
    });

    this.eventMessage.messages$.pipe(takeUntil(this.destroy$)).subscribe(ev => {
      if (ev.type === 'ToggleCartDrawer') {
        this.showCart = false;
        this.cdr.detectChanges();
      }
    });
    
    this.auth.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.is_logged = isAuth;
        this.cdr.detectChanges();
      });

    combineLatest([
      this.auth.loginInfo$,
      this.orgCtx.getOrganization(),
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([li, orgId]) => {
      this.resetUserUI();

      if (!li) {
        this.is_logged = false;
        this.cdr.detectChanges();
        return;
      }

      this.is_logged = true;

      this.username = li.username || li.user || '';
      this.email = li.email || '';
      this.usercharacters = (this.username || 'NA').slice(0, 2).toUpperCase();

      this.roles = (li.roles || []).map(r => r.name ?? r.id ?? r);
      this.orgs  = li.organizations || [];

      const effectiveOrgId = orgId ?? li.logged_as ?? null;

      if (effectiveOrgId && this.orgCtx.current !== effectiveOrgId) {
        this.orgCtx.setOrganization(effectiveOrgId);
      }

      this.currentOrgId = effectiveOrgId;
      this.loggedAsOrg  = !!effectiveOrgId;

      if (this.loggedAsOrg) {
        const org = this.orgs.find(o => o.id === effectiveOrgId);
        if (org) {
          this.username = org.name ?? this.username;
          this.usercharacters = (org.name ?? 'NA').slice(0, 2).toUpperCase();
          this.email = (org).description ?? this.email;

          const orgRoles = Array.isArray(org.roles)
            ? org.roles.map((r: any) => r.name ?? r.id ?? r)
            : [];
          if (orgRoles.length) this.roles = orgRoles;
        }
      }

      this.isAdmin = this.roles.includes('admin');
      this.cdr.detectChanges();
    });

    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }

  ngAfterViewInit() {
    initFlowbite();

    const isDark = localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      this.themeToggleLightIcon?.nativeElement.classList.remove('hidden');
    } else {
      this.themeToggleDarkIcon?.nativeElement.classList.remove('hidden');
    }
  }

  hideDropdown(id: string) {
    this.closeDropdown(id);
  }

  toggleDarkMode() {
    this.themeToggleDarkIcon?.nativeElement.classList.toggle('hidden');
    this.themeToggleLightIcon?.nativeElement.classList.toggle('hidden');

    const current = localStorage.getItem('color-theme');
    if (current) {
      if (current === 'light') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
        document.body.removeAttribute('data-theme');
      }
    } else {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
        document.body.removeAttribute('data-theme');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
      }
    }
  }

  goToCatalogSearch(id: any) {
    this.router.navigate(['/search/catalogue', id]);
  }

  goTo(path: string) {
    this.closeUserDropdown();
    this.router.navigate([path]);
  }

  toggleCartDrawer() {
    this.showCart = !this.showCart;
    this.cdr.detectChanges();
  }

  async toggleLogin() {
    this.showLogin = true;
    this.loginService.doLogin();
    this.cdr.detectChanges();
  }

  async logout() {
    this.closeUserDropdown();
    this.resetUserUI();
    await this.loginService.logout();
    if (this.router.url === '/dashboard') {
      window.location.reload();
    } else {
      this.router.navigate(['/dashboard']);
    }
    this.cdr.detectChanges();
  }

  changeSession(idx: number, exitOrgLogin: boolean) {
    this.closeUserDropdown();

    if (exitOrgLogin) {
      this.orgCtx.setOrganization(null);
      this.loggedAsOrg = false;
    } else {
      const org = this.orgs?.[idx];
      if (org?.id) {
        this.orgCtx.setOrganization(org.id);
        this.loggedAsOrg = true;
      }
    }

    this.cdr.detectChanges();
    initFlowbite();
  }
  
  onLoginClick() {
    if (environment.SIOP_INFO.enabled === true && this.qrVerifier.intervalId === undefined) {
      this.statePair = uuid.v4();

      let verifierUrl = `${environment.SIOP_INFO.verifierHost}${environment.SIOP_INFO.verifierQRCodePath}?state=${this.statePair}&client_id=${environment.SIOP_INFO.clientID}`;

      if (environment.SIOP_INFO.isRedirection) {
        const oldUrl = new URL(window.location.href);
        const newUrl = new URL(oldUrl.origin);
        newUrl.pathname = environment.SIOP_INFO.requestUri;

        const nonce = uuid.v4();
        verifierUrl = `${verifierUrl}&response_type=code&request_uri=${encodeURIComponent('https://deploy-preview-2--isbecatalog.netlify.app/auth/vc/request.jwt')}&scope=openid%20learcredential&nonce=${nonce}`;
        window.location.href = verifierUrl;
      } else {
        const originalUrl = new URL(environment.SIOP_INFO.callbackURL);
        const newUrl = new URL(window.location.href);
        newUrl.pathname = originalUrl.pathname;
        newUrl.search = originalUrl.search;

        const finalUrl = newUrl.toString();
        verifierUrl = `${verifierUrl}&client_callback=${finalUrl}`;
        this.qrWindow = this.qrVerifier.launchPopup(verifierUrl, 'Scan QR code', 500, 500);
        this.initChecking();
      }
    } else if (environment.SIOP_INFO.enabled === false) {
      this.loginService.doLogin();
    }
  }

  private initChecking(): void {
    if (this.qrWindow) {
      this.qrVerifier.pollServer(this.qrWindow, this.statePair);
    }
  }

  toggleNavBar() {
    this.isNavBarOpen = !this.isNavBarOpen;
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.localStorage.setItem('current_language', language);
    this.defaultLang = language;
  }

  closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }

  closeDropdown(id: string) {
    const dropdown = document.getElementById(id);
    if (dropdown) dropdown.classList.add('hidden');
  }

  openDropdown(id: string) {
    const dropdown = document.getElementById(id);
    if (dropdown) dropdown.classList.remove('hidden');
  }

  private resetUserUI() {
    this.isAdmin = false;
    this.roles = [];
    this.username = '';
    this.email = '';
    this.usercharacters = '';
    this.loggedAsOrg = false;
  }
}
