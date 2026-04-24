import { Injectable, signal, WritableSignal, inject, isDevMode } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, combineLatest, lastValueFrom, Observable, of } from 'rxjs';
import { take, map, catchError, switchMap } from 'rxjs/operators';
import { vcClaimsToLoginInfo, LoginInfo, claimsToLoginInfo } from './login-info.mapper';
import { OrgContextService } from '../services/org-context.service';
import { environment } from '../../environments/environment';

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
    if (isDevMode()) {
      const fakeAccessToken = environment.DEV_ACCESS_TOKEN;
      const claims: any = this.decodeJwtPayload(fakeAccessToken);
      const u = this.mapUserFromClaims(claims);
      this.setState(true, u, fakeAccessToken, this.pickPrimaryRole(u));
      const li = claimsToLoginInfo(claims, fakeAccessToken);
      this.loginInfoSubject.next(li);
      return of(true);
    }

    return this.oidc.checkAuth().pipe(
      take(1),
      catchError(() => of({ isAuthenticated: false, accessToken: '', userData: {} } as any)),
      switchMap(async ({ isAuthenticated, accessToken, userData }) => {
        if (!isAuthenticated) {
          this.clearState();
          this.loginInfoSubject.next(null);
          return false;
        }

        const idToken = await lastValueFrom(this.oidc.getAccessToken().pipe(take(1))).catch(() => '');
        let claims: any =
          (idToken && this.decodeJwtPayload(idToken)) ||
          (accessToken && this.decodeJwtPayload(accessToken)) ||
          userData ||
          {};

        const u = this.mapUserFromClaims(claims);
        this.setState(true, u, accessToken ?? '', this.pickPrimaryRole(u));
        let li = null;

        try {
          if(claims.vc === undefined) {
            li = claimsToLoginInfo(claims, accessToken ?? '');
          }else{
            li = vcClaimsToLoginInfo(claims, accessToken ?? '');
          }          
          this.loginInfoSubject.next(li);
        } catch {
          this.loginInfoSubject.next(null);
        }

        return true;
      })
    );
  }

  sellerId$ = combineLatest([this.loginInfo$, this.orgCtx.getOrganization()]).pipe(
    map(([li, orgId]) => {
      if (!li) return '';
      return li.organizations.find(o => o.id === orgId)?.id;
    })
  );

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    this.oidc.logoffAndRevokeTokens();
    this.loginInfoSubject.next(null);
    sessionStorage.clear();
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

  decodeJwtPayload<T = any>(token: string): T | null {
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

  applyLocalLogin(info: Partial<LoginInfo>): void {
    if (!info || !info.token) {
      this.clearState();
      this.loginInfoSubject.next(null);
      return;
    }

    const roleStrings = Array.isArray(info.roles)
      ? info.roles.map(r => (r as any)?.name ?? (r as any)?.id ?? r).filter(Boolean)
      : [];

    const user: AppUser = {
      sub: (info as any).userId ?? (info as any).id ?? info.user ?? '',
      name: info.username ?? info.user ?? '',
      email: info.email,
      roles: roleStrings as string[]
    };

    this.setState(true, user, info.token, this.pickPrimaryRole(user));
    this.loginInfoSubject.next(info as LoginInfo);
  }

  private buildLocalLoginInfo(): LoginInfo {
    return {
      userId: 'local-user',
      user: 'local',
      email: 'local.user@example.com',
      token: 'local-token',
      expire: Math.floor(Date.now() / 1000) + 60 * 60,
      seller: 'local-seller',
      username: 'Local User',
      roles: [
        { id: 'orgAdmin', name: 'orgAdmin' },
        { id: 'seller', name: 'seller' },
        { id: 'admin', name: 'admin' }
      ],
      organizations: [
        {
          id: 'org-local',
          name: 'Local Organization',
          roles: [{ id: 'orgAdmin', name: 'orgAdmin' }]
        }
      ],
      logged_as: 'org-local'
    };
  }
}
