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
        let claims: any =
          (idToken && this.decodeJwtPayload(idToken)) ||
          (accessToken && this.decodeJwtPayload(accessToken)) ||
          userData ||
          {};

        const u = this.mapUserFromClaims(claims);
        this.setState(true, u, accessToken ?? '', this.pickPrimaryRole(u));

        try {
          const li = claimsToLoginInfo(claims, accessToken ?? '');
          this.loginInfoSubject.next(li);
        } catch {
          this.loginInfoSubject.next(null);
        }

        return true;
      })
    );

    /*const fakeAccessToken = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NhdGFsb2cuaXNiZW9uYm9hcmQuY29tIiwiZXhwIjoxNzYxMjI5NDE3LCJpYXQiOjE3NjEyMjU4MTcsImlzcyI6Imh0dHBzOi8vY2VydGF1dGguZXZpZGVuY2VsZWRnZXIuZXUiLCJqdGkiOiJUQ1RJVktTQjZQQTNTRlJYNVlCVUZPUkdZNyIsIm5vbmNlIjoiZDA4Mjg1N2MwNDIxYmViZTBkYTU5YTA5ZmYwYWVhM2NlOW1SczZVN1AiLCJzY29wZSI6Im9wZW5pZCBlaWRhcyIsInN1YiI6Imh0dHBzOi8vY2F0YWxvZy5pc2Jlb25ib2FyZC5jb20iLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvIiwiaHR0cHM6Ly9jcmVkZW50aWFscy5ldWRpc3RhY2suZXUvLndlbGwta25vd24vY3JlZGVudGlhbHMvbGVhcl9jcmVkZW50aWFsX2VtcGxveWVlL3czYy92MyJdLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEjU1lDOTA4UklRUXFlVVhSMTluaDNFUSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEiLCJzdGF0dXNMaXN0SW5kZXgiOiJTWUM5MDhSSVFRcWVVWFIxOW5oM0VRIiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiUGxhaW5MaXN0RW50aXR5In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im1hbmRhdGUiOnsibWFuZGF0ZWUiOnsiZW1haWwiOiJhbGJhLmxvcGV6QGluMi5lcyIsImVtcGxveWVlSWQiOiIxMjM0NTY3OEEiLCJmaXJzdE5hbWUiOiJKb2huIiwiaWQiOiIxMjM0NTY3OEEiLCJsYXN0TmFtZSI6IkRvZSJ9LCJtYW5kYXRvciI6eyJjb21tb25OYW1lIjoiSm9obiBEb2UiLCJjb3VudHJ5IjoiRVMiLCJlbWFpbCI6ImFsYmEubG9wZXpAaW4yLmVzIiwiaWQiOiJkaWQ6ZWxzaTpWQVRFUy0xMTExMTExMUsiLCJvcmdhbml6YXRpb24iOiJJU0JFIEZvdW5kYXRpb24iLCJvcmdhbml6YXRpb25JZGVudGlmaWVyIjoiVkFURVMtMTExMTExMTFLIiwic2VyaWFsTnVtYmVyIjoiMTIzNDU2NzhBIn0sInBvd2VyIjpbeyJhY3Rpb24iOlsiRXhlY3V0ZSJdLCJkb21haW4iOiJET01FIiwiZnVuY3Rpb24iOiJPbmJvYXJkaW5nIiwidHlwZSI6ImRvbWFpbiJ9LHsiYWN0aW9uIjpbIkNyZWF0ZSIsIlVwZGF0ZSIsIkRlbGV0ZSJdLCJkb21haW4iOiJET01FIiwiZnVuY3Rpb24iOiJQcm9kdWN0T2ZmZXJpbmciLCJ0eXBlIjoiZG9tYWluIn1dfX0sImRlc2NyaXB0aW9uIjoiVmVyaWZpYWJsZSBDcmVkZW50aWFsIGZvciBlbXBsb3llZXMgb2YgYW4gb3JnYW5pemF0aW9uIiwiaWQiOiJ1cm46dXVpZENXWFhTQzZDS1M3RElQV1hVNkM3NkFFSFpJIiwiaXNzdWVyIjp7ImNvbW1vbk5hbWUiOiJDZXJ0QXV0aCBJZGVudGl0eSBQcm92aWRlciBmb3IgSVNCRSIsImNvdW50cnkiOiJFUyIsImlkIjoiZGlkOmVsc2k6VkFURVMtQjYwNjQ1OTAwIiwib3JnYW5pemF0aW9uIjoiSU4yIiwib3JnYW5pemF0aW9uSWRlbnRpZmllciI6IlZBVEVTLUI2MDY0NTkwMCIsInNlcmlhbE51bWJlciI6IkI0NzQ0NzU2MCJ9LCJ0eXBlIjpbIkxFQVJDcmVkZW50aWFsRW1wbG95ZWUiLCJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJ2YWxpZEZyb20iOiIyMDI1LTEwLTIzVDEzOjA2OjIwWiIsInZhbGlkVW50aWwiOiIyMDI2LTEwLTIzVDEzOjA2OjIwWiJ9fQ.LSIItTupThpBDG08pWbAdIk0_qaG-U6w7SpbOPyjOUn-0wybXPwl-dyv8uRiEnbkLb0Mwgch-zkQGav3ImF4UA";
    //"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NhdGFsb2cuaXNiZW9uYm9hcmQuY29tIiwiZXhwIjoxNzYxODIwOTQyLCJpYXQiOjE3NjE4MTczNDIsImlzcyI6Imh0dHBzOi8vY2VydGF1dGguZXZpZGVuY2VsZWRnZXIuZXUiLCJqdGkiOiJEUEczT0Y1UFBQT0QyM1VXS1I2WklYUzNOSiIsIm5vbmNlIjoiY2YwOTIwZDg0NjFlMjQxNjMxNjFiOTViNTlkY2QwZTdiOGpZaWp0TXAiLCJzY29wZSI6Im9wZW5pZCBlaWRhcyIsInN1YiI6Imh0dHBzOi8vY2F0YWxvZy5pc2Jlb25ib2FyZC5jb20iLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvIiwiaHR0cHM6Ly9jcmVkZW50aWFscy5ldWRpc3RhY2suZXUvLndlbGwta25vd24vY3JlZGVudGlhbHMvbGVhcl9jcmVkZW50aWFsX2VtcGxveWVlL3czYy92MyJdLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEjU1lDOTA4UklRUXFlVVhSMTluaDNFUSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEiLCJzdGF0dXNMaXN0SW5kZXgiOiJTWUM5MDhSSVFRcWVVWFIxOW5oM0VRIiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiUGxhaW5MaXN0RW50aXR5In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im1hbmRhdGUiOnsibWFuZGF0ZWUiOnsiZW1haWwiOiJhbGJhLmxvcGV6QGluMi5lcyIsImVtcGxveWVlSWQiOiIzNDM0MzQzNEgiLCJmaXJzdE5hbWUiOiIiLCJpZCI6IjM0MzQzNDM0SCIsImxhc3ROYW1lIjoiIn0sIm1hbmRhdG9yIjp7ImNvbW1vbk5hbWUiOiJKb2huIERvZSAzNDM0MzQzNEgiLCJjb3VudHJ5IjoiRVMiLCJlbWFpbCI6ImFsYmEubG9wZXpAaW4yLmVzIiwiaWQiOiJkaWQ6ZWxzaTpWQVRFUy0xMjM0NTY3OEoiLCJvcmdhbml6YXRpb24iOiJHb29kQWlyIEZvdW5kYXRpb24iLCJvcmdhbml6YXRpb25JZGVudGlmaWVyIjoiVkFURVMtMTIzNDU2NzhKIiwic2VyaWFsTnVtYmVyIjoiMzQzNDM0MzRIIn0sInBvd2VyIjpbeyJhY3Rpb24iOlsiRXhlY3V0ZSJdLCJkb21haW4iOiJET01FIiwiZnVuY3Rpb24iOiJPbmJvYXJkaW5nIiwidHlwZSI6ImRvbWFpbiJ9LHsiYWN0aW9uIjpbIkNyZWF0ZSIsIlVwZGF0ZSIsIkRlbGV0ZSJdLCJkb21haW4iOiJET01FIiwiZnVuY3Rpb24iOiJQcm9kdWN0T2ZmZXJpbmciLCJ0eXBlIjoiZG9tYWluIn1dfX0sImRlc2NyaXB0aW9uIjoiVmVyaWZpYWJsZSBDcmVkZW50aWFsIGZvciBlbXBsb3llZXMgb2YgYW4gb3JnYW5pemF0aW9uIiwiaWQiOiJ1cm46dXVpZFRCVDRDRUJaNUlFTTZJTEE1Mk5RVFlNWkpZIiwiaXNzdWVyIjp7ImNvbW1vbk5hbWUiOiJDZXJ0QXV0aCBJZGVudGl0eSBQcm92aWRlciBmb3IgSVNCRSIsImNvdW50cnkiOiJFUyIsImlkIjoiZGlkOmVsc2k6VkFURVMtQjYwNjQ1OTAwIiwib3JnYW5pemF0aW9uIjoiSU4yIiwib3JnYW5pemF0aW9uSWRlbnRpZmllciI6IlZBVEVTLUI2MDY0NTkwMCIsInNlcmlhbE51bWJlciI6IkI0NzQ0NzU2MCJ9LCJ0eXBlIjpbIkxFQVJDcmVkZW50aWFsRW1wbG95ZWUiLCJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJ2YWxpZEZyb20iOiIyMDI1LTEwLTAyVDA2OjEyOjI4WiIsInZhbGlkVW50aWwiOiIyMDI2LTEwLTAyVDA2OjEyOjI4WiJ9fQ.BPPGuSr7PdP1Tsgo65bDe9J4mU2Mbwtlfj57Rbw9ux46_guFwKi02z_DRIUlOxGWqS2WJGoSzdus55aoqyLsnQ"

    let claims: any = this.decodeJwtPayload(fakeAccessToken);
    const u = this.mapUserFromClaims(claims);
    this.setState(true, u, fakeAccessToken ?? '', this.pickPrimaryRole(u));
    const li = claimsToLoginInfo(claims, fakeAccessToken ?? '');
    this.loginInfoSubject.next(li);
    return of(true);*/
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
