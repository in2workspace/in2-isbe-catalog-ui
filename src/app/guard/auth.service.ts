import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { LegacyTokenAdapterService } from './legacy-auth-adapter.service';

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
  private readonly legacy = inject(LegacyTokenAdapterService);

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly userSubject = new BehaviorSubject<AppUser | null>(null);
  user$ = this.userSubject.asObservable();

  private readonly tokenSubject = new BehaviorSubject<string>('');
  accessToken$ = this.tokenSubject.asObservable();

  role: WritableSignal<string | null> = signal(null);

  constructor() {
    this.checkAuth().pipe(take(1)).subscribe();
  }

  checkAuth(): Observable<boolean> {
    return this.oidc.checkAuth().pipe(
      take(1),
      switchMap(({ isAuthenticated, accessToken, userData }) => {
        if (isAuthenticated) {
          const u = this.mapUser(userData);
          this.setState(true, u, accessToken ?? '', this.pickPrimaryRole(u));
          return of(true);
        }

        const legacy = this.legacy.read();
        if (legacy.isAuthenticated) {
          const u: AppUser = { name: 'legacy', roles: legacy.roles };
          this.setState(true, u, legacy.accessToken ?? '', this.pickPrimaryRole(u));
          return of(true);
        }

        this.clearState();
        return of(false);
      })
    );
  }

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    this.legacy.clear();
    this.oidc.logoffAndRevokeTokens();
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

  private mapUser(userData: any): AppUser {
    const roles: string[] =
      userData?.roles ||
      (userData?.role ? [userData.role] : []) ||
      userData?.realm_access?.roles ||
      [];
    return {
      sub: userData?.sub,
      name: userData?.name ?? `${userData?.given_name ?? ''} ${userData?.family_name ?? ''}`.trim(),
      email: userData?.email,
      roles,
      ...userData
    };
  }

  private pickPrimaryRole(u: AppUser | null): string | null {
    return u?.roles?.[0] ?? null;
  }
}
