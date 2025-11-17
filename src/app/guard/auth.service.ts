import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { take, map, catchError, switchMap } from 'rxjs/operators';
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
    /*return this.oidc.checkAuth().pipe(
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
    );*/

    // FAKE AUTH FOR DEV PURPOSES ONLY
    const fakeAccessToken = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NhdGFsb2cuaXNiZW9uYm9hcmQuY29tIiwiZXhwIjoxNzYyNTI0NTMxLCJpYXQiOjE3NjI1MjA5MzEsImlzcyI6Imh0dHBzOi8vY2VydGF1dGguZXZpZGVuY2VsZWRnZXIuZXUiLCJqdGkiOiJIVlFYV1dOV1ZHS1M3NE1YWEpDRjZKVUtKNSIsIm5vbmNlIjoiMzllYzViYzdhN2VhM2YzMDg2YTUzNDMyNWU1ODRjNTE1MGhPUmg3UWciLCJzY29wZSI6Im9wZW5pZCBlaWRhcyIsInN1YiI6Imh0dHBzOi8vY2F0YWxvZy5pc2Jlb25ib2FyZC5jb20iLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvIiwiaHR0cHM6Ly9jcmVkZW50aWFscy5ldWRpc3RhY2suZXUvLndlbGwta25vd24vY3JlZGVudGlhbHMvbGVhcl9jcmVkZW50aWFsX2VtcGxveWVlL3czYy92MyJdLCJjcmVkZW50aWFsU3RhdHVzIjp7ImlkIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEjU1lDOTA4UklRUXFlVVhSMTluaDNFUSIsInN0YXR1c0xpc3RDcmVkZW50aWFsIjoiaHR0cHM6Ly9pc3N1ZXIuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnL2JhY2tvZmZpY2UvdjEvY3JlZGVudGlhbHMvc3RhdHVzLzEiLCJzdGF0dXNMaXN0SW5kZXgiOiJTWUM5MDhSSVFRcWVVWFIxOW5oM0VRIiwic3RhdHVzUHVycG9zZSI6InJldm9jYXRpb24iLCJ0eXBlIjoiUGxhaW5MaXN0RW50aXR5In0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im1hbmRhdGUiOnsibWFuZGF0ZWUiOnsiZW1haWwiOiJhbGJhLmxvcGV6QGluMi5lcyIsImVtcGxveWVlSWQiOiIxMjM0NTY3OEEiLCJmaXJzdE5hbWUiOiJKb2huIiwiaWQiOiIxMjM0NTY3OEEiLCJsYXN0TmFtZSI6IkRvZSJ9LCJtYW5kYXRvciI6eyJjb21tb25OYW1lIjoiSm9obiBEb2UiLCJjb3VudHJ5IjoiRVMiLCJlbWFpbCI6ImFsYmEubG9wZXpAaW4yLmVzIiwiaWQiOiJkaWQ6ZWxzaTpWQVRFUy1HODc5MzYxNTkiLCJvcmdhbml6YXRpb24iOiJBTEFTVFJJQSIsIm9yZ2FuaXphdGlvbklkZW50aWZpZXIiOiJWQVRFUy1HODc5MzYxNTkiLCJzZXJpYWxOdW1iZXIiOiIxMjM0NTY3OEEifSwicG93ZXIiOlt7ImFjdGlvbiI6WyJFeGVjdXRlIl0sImRvbWFpbiI6IkRPTUUiLCJmdW5jdGlvbiI6Ik9uYm9hcmRpbmciLCJ0eXBlIjoiZG9tYWluIn0seyJhY3Rpb24iOlsiQ3JlYXRlIiwiVXBkYXRlIiwiRGVsZXRlIl0sImRvbWFpbiI6IkRPTUUiLCJmdW5jdGlvbiI6IlByb2R1Y3RPZmZlcmluZyIsInR5cGUiOiJkb21haW4ifV19fSwiZGVzY3JpcHRpb24iOiJWZXJpZmlhYmxlIENyZWRlbnRpYWwgZm9yIGVtcGxveWVlcyBvZiBhbiBvcmdhbml6YXRpb24iLCJpZCI6InVybjp1dWlkM09NTFdFUVFKTjI2WlJQUkJGWTJBQVg2RFIiLCJpc3N1ZXIiOnsiY29tbW9uTmFtZSI6IkNlcnRBdXRoIElkZW50aXR5IFByb3ZpZGVyIGZvciBJU0JFIiwiY291bnRyeSI6IkVTIiwiaWQiOiJkaWQ6ZWxzaTpWQVRFUy1CNjA2NDU5MDAiLCJvcmdhbml6YXRpb24iOiJJTjIiLCJvcmdhbml6YXRpb25JZGVudGlmaWVyIjoiVkFURVMtQjYwNjQ1OTAwIiwic2VyaWFsTnVtYmVyIjoiQjQ3NDQ3NTYwIn0sInR5cGUiOlsiTEVBUkNyZWRlbnRpYWxFbXBsb3llZSIsIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sInZhbGlkRnJvbSI6IjIwMjUtMTEtMDRUMTg6MzY6NTBaIiwidmFsaWRVbnRpbCI6IjIwMjYtMTItMDZUMTg6MzY6NTBaIn19.K7OaHIWw1Z1TCUxWjm0n7WZJAlxQVO2e9ZvEtf8FTiNJ0K4rx1gdg_Do6SXqRnHTlx9aRdZQ1muD7wGNbcaseg";
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