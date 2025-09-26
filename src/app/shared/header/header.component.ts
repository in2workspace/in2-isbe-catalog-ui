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
  faRuler,
} from '@fortawesome/sharp-solid-svg-icons';
import { LocalStorageService } from '../../services/local-storage.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { LoginServiceService } from 'src/app/services/login-service.service';
import { EventMessageService } from '../../services/event-message.service';
import { environment } from 'src/environments/environment';
import { Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute,Router } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { QrVerifierService } from 'src/app/services/qr-verifier.service';
import * as uuid from 'uuid';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ShoppingCartServiceService } from '../../services/shopping-cart-service.service';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer.component';
import { FaLayersComponent, FaIconComponent, FaLayersCounterComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'bae-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [FaLayersComponent, FaIconComponent, FaLayersCounterComponent, CartDrawerComponent, TranslateModule],
})
export class HeaderComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @ViewChild('theme_toggle_dark_icon') themeToggleDarkIcon!: ElementRef;
  @ViewChild('theme_toggle_light_icon') themeToggleLightIcon!: ElementRef;
  @ViewChild('navbarbutton') navbarbutton!: ElementRef;

  constructor(
    themeToggleDarkIcon: ElementRef,
    themeToggleLightIcon: ElementRef,
    private readonly translate: TranslateService,
    private readonly localStorage: LocalStorageService,
    private readonly loginService: LoginServiceService,
    private readonly cdr: ChangeDetectorRef,
    private readonly eventMessage: EventMessageService,
    private readonly router: Router,
    private readonly qrVerifier: QrVerifierService,
    private readonly sc: ShoppingCartServiceService,
    private readonly api: ApiServiceService,
    private readonly route: ActivatedRoute,
    private readonly auth: AuthService
  ) {
    this.themeToggleDarkIcon = themeToggleDarkIcon;
    this.themeToggleLightIcon = themeToggleLightIcon;
  }

  qrWindow: Window | null = null;
  statePair!: string;

  langs: string[] = [];
  defaultLang: string | null = null;

  showCart = false;
  is_logged = false;
  showLogin = false;
  loggedAsOrg = false;
  isAdmin = false;

  username = '';
  email = '';
  usercharacters = '';
  roles: string[] = [];
  orgs: any[] = [];

  cartCount = 0;

  isNavBarOpen = false;
  flagDropdownOpen = false;

  currentActorType: 'user' | 'org' = 'user';
  currentActorId: string | null = null;
  userId: string | null = null;


  knowledge: string = environment.KNOWLEDGE_BASE_URL;
  knowledge_onboarding: string = environment.KB_ONBOARDING_GUIDELINES_URL;
  knowledge_guidelines: string = environment.KB_GUIDELNES_URL;
  registration: string = environment.REGISTRATION_FORM_URL;
  ticketing: string = environment.TICKETING_SYSTEM_URL;
  domeAbout: string = environment.ISBE_ABOUT_LINK;
  domeRegister: string = environment.ISBE_REGISTER_LINK;
  domePublish: string = environment.ISBE_PUBLISH_LINK;

  IS_ISBE: boolean = environment.ISBE_CATALOGUE;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.langs = this.translate.getLangs();
    const currLang = this.localStorage.getItem('current_language');
    this.defaultLang = currLang ?? this.translate.getDefaultLang();

    this.subscriptions.add(
      this.sc.cart$.subscribe((cart) => {
        this.cartCount = cart.length;
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.eventMessage.messages$.subscribe((ev) => {
        if (ev.type === 'ToggleCartDrawer') {
          this.showCart = false;
          this.cdr.detectChanges();
        }
      })
    );

    this.subscriptions.add(
      combineLatest([this.auth.isLoggedIn(), this.auth.getUserData()]).subscribe(([isAuth, user]) => {
        this.is_logged = isAuth;

        if (!isAuth || !user) {
          this.username = '';
          this.email = '';
          this.usercharacters = '';
          this.roles = [];
          this.orgs = [];
          this.isAdmin = false;
          this.loggedAsOrg = false;
          this.currentActorType = 'user';
          this.currentActorId = null;
          this.userId = null;
          this.cdr.markForCheck();
          return;
        }

        this.username = user.name ?? '';
        this.email = user.email ?? '';
        this.usercharacters = (this.username || this.email || '??').slice(0, 2).toUpperCase();
        const rawRole = user.role;
        this.roles = Array.isArray(rawRole) ? rawRole : rawRole ? [String(rawRole)] : [];
        this.isAdmin = this.roles.includes('admin');

        this.userId = user.sub ?? null;
        if (!this.currentActorId) {
          this.currentActorType = 'user';
          this.currentActorId = this.userId;
        }

        this.cdr.markForCheck();
      })
    );

  }

  ngAfterViewInit(): void {
    initFlowbite();
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.themeToggleLightIcon.nativeElement.classList.remove('hidden');
    } else {
      this.themeToggleDarkIcon.nativeElement.classList.remove('hidden');
    }
  }

  ngDoCheck(): void {
    if (this.qrWindow != null && this.qrWindow.closed) {
      this.qrVerifier.stopChecking(this.qrWindow);
      this.qrWindow = null;
    }
  }

  ngOnDestroy(): void {
    this.qrWindow?.close();
    this.qrWindow = null;
    this.subscriptions.unsubscribe();
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isNavBarOpen) {
      this.navbarbutton.nativeElement.blur();
      this.isNavBarOpen = false;
    }
  }

  toggleNavBar() {
    this.isNavBarOpen = !this.isNavBarOpen;
  }

  toggleCartDrawer() {
    this.showCart = !this.showCart;
    this.cdr.detectChanges();
  }

  goToCatalogSearch(id: any) {
    this.router.navigate(['/search/catalogue', id]);
  }

  goTo(path: string) {
    this.closeUserDropdown();
    this.router.navigate([path]);
  }

  toggleDarkMode() {
    this.themeToggleDarkIcon.nativeElement.classList.toggle('hidden');
    this.themeToggleLightIcon.nativeElement.classList.toggle('hidden');

    if (localStorage.getItem('color-theme')) {
      if (localStorage.getItem('color-theme') === 'light') {
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

  switchLanguage(language: string) {
    this.translate.use(language);
    this.localStorage.setItem('current_language', language);
    this.defaultLang = language;
  }

  async toggleLogin() {
    this.showLogin = true;
    this.loginService.doLogin();
    this.cdr.detectChanges();
  }

  async logout() {
    this.closeUserDropdown();
    localStorage.removeItem('accesToken');
    this.auth.reloadFromSession?.();
    try {
      await this.loginService.logout();
    } catch (e) {
      console.warn('logout API error', e);
    }
    if (this.router.url === '/dashboard') {
      window.location.reload();
    } else {
      this.router.navigate(['/dashboard']);
    }
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
        verifierUrl = `${verifierUrl}&response_type=code&request_uri=https://deploy-preview-2--isbecatalog.netlify.app/auth/vc/request.jwt&scope=openid%20learcredential&nonce=${nonce}`;
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
      window.location.replace(`${environment.BASE_URL}` + '/login');
    }
  }

  private initChecking(): void {
    this.qrVerifier.pollServer(this.qrWindow, this.statePair);
  }

  changeSession(idx: number, exitOrgLogin: boolean): void {
    this.closeUserDropdown();

    if (exitOrgLogin) {
      this.loggedAsOrg = false;
      this.currentActorType = 'user';
      this.currentActorId = this.userId;
      this.usercharacters = (this.username || this.email || '??').slice(0, 2).toUpperCase();
      this.cdr.detectChanges();
      return;
    }

    const org = this.orgs?.[idx];
    if (!org) return;

    this.loggedAsOrg = true;
    this.currentActorType = 'org';
    this.currentActorId = String(org.id);

    this.username = org.name ?? this.username;
    this.usercharacters = (org.name ?? '??').slice(0, 2).toUpperCase();
    this.email = org.description ?? this.email;
    this.roles = (org.roles ?? []).map((r: any) => (typeof r === 'string' ? r : r?.name ?? String(r)));
    this.cdr.detectChanges();
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
}
