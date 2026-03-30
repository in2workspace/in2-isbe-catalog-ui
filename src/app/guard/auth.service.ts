import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { take, map, catchError, switchMap } from 'rxjs/operators';
import { vcClaimsToLoginInfo, LoginInfo, claimsToLoginInfo } from './login-info.mapper';
import { OrgContextService } from '../services/org-context.service';

// TODO: LOGIN MODE
const FORCE_LOCAL_LOGIN = true;

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
    /*if (FORCE_LOCAL_LOGIN) {
      this.applyLocalLogin(this.buildLocalLoginInfo());
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

        const idToken = await this.oidc.getAccessToken().pipe(take(1)).toPromise().catch(() => '');
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
    );*/
    const fakeAccessToken = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItckxwSkhNVkhCSUQ0Q2FRX0dsTjhFTEprQ0tYMUJWUzhMTzd6enU1cTFVIn0.eyJleHAiOjE3NzcyMDU4NjYsImlhdCI6MTc3NDg1MDUwMSwiYXV0aF90aW1lIjoxNzc0NjEzODY2LCJqdGkiOiJvbnJ0YWM6NDNiYmQxNDctODcxMS01MmUyLTU3NWUtN2M2OTc1ZjMwNWM4IiwiaXNzIjoiaHR0cHM6Ly9pZHAuZGV2LmNsb3VkLXcuZW52cy5yZWRpc2JlLmNvbS9hdXRoL3JlYWxtcy9kZXYtaXNiZSIsImF1ZCI6WyJpc2JlLXBvcnRhbC1kZXYiLCJhY2NvdW50Il0sInN1YiI6ImIyMzQ5ZTMxLWEyOTktNGU5Yi04ZGQxLWQxMWExZDFmNzBjMSIsInR5cCI6IkJlYXJlciIsImF6cCI6Imh0dHBzOi8vY2F0YWxvZy5pc2Jlb25ib2FyZC5jb20iLCJzaWQiOiIyMTQyZThmMC0zZTFiLTkwZjEtZjQxNC0wOWIwMjM0MjIyMTEiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vY2F0YWxvZy5kZXYuY2xvdWQtdy5lbnZzLnJlZGlzYmUuY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWRldi1pc2JlIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIG9yZ2FuaXphdGlvbiBlbWFpbCBwcm9maWxlIiwidXNlcl9pZGVudGlmaWVyIjoiMTIzNDU2NzhBIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm9yZ2FuaXphdGlvbiI6IkFMQVNUUklBIiwibmFtZSI6IkpvaG4gRG9lIiwib3JnYW5pemF0aW9uX2lkZW50aWZpZXIiOiJWQVRFUy1HODc5MzYxNTkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqZXN1c0BhbGFzdHJpYS5pbyIsInBvd2VyIjpbeyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJNYW5hZ2VtZW50IiwidHlwZSI6Im9yZ2FuaXphdGlvbiJ9LHsiYWN0aW9uIjpbIioiXSwiZG9tYWluIjoiSVNCRSIsImZ1bmN0aW9uIjoiSGVscGRlc2siLCJ0eXBlIjoib3JnYW5pemF0aW9uIn0seyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJGYXVjZXQiLCJ0eXBlIjoib3JnYW5pemF0aW9uIn0seyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJXaXphcmQiLCJ0eXBlIjoib3JnYW5pemF0aW9uIn0seyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJOb3Rhcml6YXRpb24iLCJ0eXBlIjoib3JnYW5pemF0aW9uIn0seyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJOb3RpZmljYXRpb25zIiwidHlwZSI6Im9yZ2FuaXphdGlvbiJ9LHsiYWN0aW9uIjpbIioiXSwiZG9tYWluIjoiSVNCRSIsImZ1bmN0aW9uIjoiSWRlbnRpdHkiLCJ0eXBlIjoib3JnYW5pemF0aW9uIn0seyJhY3Rpb24iOlsiKiJdLCJkb21haW4iOiJJU0JFIiwiZnVuY3Rpb24iOiJFbnJvbGxtZW50IiwidHlwZSI6Im9yZ2FuaXphdGlvbiJ9LHsiYWN0aW9uIjpbIkV4ZWN1dGUiXSwiZG9tYWluIjoiSVNCRSIsImZ1bmN0aW9uIjoiT25ib2FyZGluZyIsInR5cGUiOiJvcmdhbml6YXRpb24ifV0sImdpdmVuX25hbWUiOiJKb2huIiwidXNlciI6IkpvaG4gRG9lIiwiZmFtaWx5X25hbWUiOiJEb2UiLCJlbWFpbCI6Imhlc3VzLnJ1aXpAZ21haWwuY29tIn0.a__P_BHOhBqHyetIgFLO2zMy63X8Ul6Fxx-zS3SlsB-X_tL-wP0r8H-cLoRKactjoKqbx5EVCrT0I5DE1BrWbS492vSgcyEVOcV334Tfndw57FwslU5OA3W-teDqkQPHJnbnWGb7WyO4h81xnLZFf-Ymgg0Ho3Cmgjn0TctjnPMzHcpEjw9h1_A-uzN0XBdK-cApsbk2y2ywY8kTS7HjZ221zW7Rgzs9ftB3-jodxOSStl8ygOQZ3Iy9P-txMP8_cNMlV4ggKgD6kHDlzRp87TFS1nKcDHG2aX_XJAXICWn2wcTN6G7-x7urMvNWj6kSJb98vjLbllg0BIAQenhfsQ";
    let claims: any = this.decodeJwtPayload(fakeAccessToken);
    const u = this.mapUserFromClaims(claims);
    this.setState(true, u, fakeAccessToken ?? '', this.pickPrimaryRole(u));
    const li = claimsToLoginInfo(claims, fakeAccessToken ?? '');
    this.loginInfoSubject.next(li);
    return of(true);
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
