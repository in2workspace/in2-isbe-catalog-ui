import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { take, switchMap, map, catchError } from 'rxjs/operators';
import { claimsToLoginInfo, LoginInfo } from './login-info.mapper';
import { OrgContextService } from '../services/org-context.service';

export interface AppUser {
  sub?: string;
  name?: string;
  email?: string;
  roles?: string[];
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oidc = inject(OidcSecurityService);
  private readonly orgCtx = inject(OrgContextService);

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly userSubject = new BehaviorSubject<AppUser | null>(null);
  user$ = this.userSubject.asObservable();

  private readonly tokenSubject = new BehaviorSubject<string>('');
  accessToken$ = this.tokenSubject.asObservable();

  private readonly loginInfoSubject = new BehaviorSubject<LoginInfo | null>(null);
  loginInfo$ = this.loginInfoSubject.asObservable();

  role: WritableSignal<string | null> = signal(null);

  checkAuth(): Observable<boolean> {
    return this.oidc.checkAuth().pipe(
      take(1),
      catchError(() => of({ isAuthenticated: false, accessToken: '', userData: {} } as any)),
      switchMap(async ({ isAuthenticated, accessToken, userData }) => {
        if (!isAuthenticated) {
          this.clearState();
          this.loginInfoSubject.next(null);
          return false;
        }

        const idToken = await this.oidc.getAccessToken().pipe(take(1)).toPromise().catch(() => '');
        console.log(idToken)
        let claims: any =
          (idToken && this.decodeJwtPayload(idToken)) ||
          (accessToken && this.decodeJwtPayload(accessToken)) ||
          userData ||
          {};

        const u = this.mapUserFromClaims(claims);
        console.log(u)
        this.setState(true, u, accessToken ?? '', this.pickPrimaryRole(u));

        try {
          const li = claimsToLoginInfo(claims, accessToken ?? '');
          this.loginInfoSubject.next(li);
        } catch {
          this.loginInfoSubject.next(null);
        }

        console.info('[Auth] OIDC session establecida');
        return true;
      })
    );
  }

  sellerId$ = combineLatest([this.loginInfo$, this.orgCtx.getOrganization()]).pipe(
    map(([li, orgId]) => {
      if (!li) return '';
      const effective = orgId ?? li.logged_as ?? null;
      if (!effective || effective === li.id) return li.id;
      return li.organizations.find(o => o.id === effective)?.id ?? li.id;
    })
  );

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    this.oidc.logoffAndRevokeTokens();
    this.loginInfoSubject.next(null);
  }

  async getAccessToken(): Promise<string> {
    const token = await this.oidc.getAccessToken().pipe(take(1)).toPromise().catch(() => '');
    return token || this.tokenSubject.getValue() || '';
  }

  private setState(isAuth: boolean, user: AppUser | null, token: string, role: string | null) {
    this.isAuthenticatedSubject.next(isAuth);
    this.userSubject.next(user);
    this.tokenSubject.next(token);
    this.role.set(role);
  }

  private clearState() {
    this.setState(false, null, '', null);
  }

  private mapUserFromClaims(claims: any): AppUser {
    const roles: string[] =
      claims?.roles ||
      (claims?.role ? [claims.role] : []) ||
      claims?.realm_access?.roles ||
      [];

    const name =
      (claims?.name ??
      `${claims?.given_name ?? ''} ${claims?.family_name ?? ''}`.trim()) ||
      claims?.preferred_username ||
      '';

    return {
      sub: claims?.sub,
      name,
      email: claims?.email,
      roles,
      ...claims
    };
  }

  private pickPrimaryRole(u: AppUser | null): string | null {
    return u?.roles?.[0] ?? null;
  }

  private decodeJwtPayload<T = any>(token: string): T | null {
    try {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
      const json = atob(b64 + (pad ? '='.repeat(pad) : ''));
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
}
