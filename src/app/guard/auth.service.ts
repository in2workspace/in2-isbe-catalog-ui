import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';

import { EmployeeMandator, LEARCredentialEmployee, Power } from '../models/lear-credential';
import { LEARCredentialDataNormalizer } from '../models/lear-credential-employee-data-normalizer';
import { decodeJwt } from './jwt.util';

// 👇 asumo esta interfaz: ajusta si tu LoginInfo real es distinto
import { LoginInfo } from '../models/interfaces';

type JwtClaims = Record<string, any>;

const EXTERNAL_TOKEN_KEY = 'accessToken';
const LEEWAY_SECONDS = 60;

type OrgRole = { id: string; name: string };
type Organization = { id: string; name: string; roles: OrgRole[]; partyId?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly userDataSubject = new BehaviorSubject<LoginInfo | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string>('');
  private readonly mandatorSubject = new BehaviorSubject<EmployeeMandator | null>(null);
  private readonly emailSubject = new BehaviorSubject<string>('');
  private readonly nameSubject = new BehaviorSubject<string>('');

  private readonly normalizer = new LEARCredentialDataNormalizer();
  private userPowers: Power[] = [];

  constructor() {
    this.tryExternalToken();

    window.addEventListener('storage', (e) => {
      if (e.storageArea === localStorage && e.key === EXTERNAL_TOKEN_KEY) {
        this.tryExternalToken();
      }
    });
  }

  public isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  public checkAuth$(): Observable<boolean> {
    return of(this.tryExternalToken());
  }

  public reloadFromSession(): boolean {
    return this.tryExternalToken();
  }

  public tokenExp$ = this.getToken().pipe(
    map((t) => {
      const exp = decodeJwt<Record<string, any>>(t || '')?.['exp'] as number | undefined;
      return exp ?? null;
    }),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public getUserData(): Observable<LoginInfo | null> {
    return this.userDataSubject.asObservable();
  }

  public getToken(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  public getEmailName(): Observable<string> {
    return this.emailSubject.asObservable();
  }

  public getName(): Observable<string> {
    return this.nameSubject.asObservable();
  }

  public getLoginInfo(): LoginInfo | null {
    const raw = localStorage.getItem(EXTERNAL_TOKEN_KEY);
    if (!raw) return null;
    const claims = decodeJwt<JwtClaims>(raw);
    if (!claims) return null;
    return this.mapClaimsToLoginInfo(claims, raw);
  }
  
  public hasPower(tmfFunction: string, tmfAction: string): boolean {
    return this.userPowers.some((power: Power) => {
      if (power.function === tmfFunction) {
        const action = power.action;
        return action === tmfAction || (Array.isArray(action) && action.includes(tmfAction));
      }
      return false;
    });
  }

  private tryExternalToken(): boolean {
    const raw = localStorage.getItem(EXTERNAL_TOKEN_KEY);
    if (!raw) {
      this.clearAuthState();
      return false;
    }

    const claims = decodeJwt<JwtClaims>(raw);
    if (!claims /*|| this.isExpired(this.normalizeEpochSeconds(claims['exp']))*/) {
      this.clearAuthState();
      return false;
    }

    const userData = this.mapClaimsToUserData(claims);
    this.afterLoginSuccess(userData, raw);
    return true;
  }

  private afterLoginSuccess(userData: LoginInfo, accessToken: string) {
    /*if (this.getRole(userData) !== RoleType.LEAR) {
      this.clearAuthState();
      throw new Error('Error Role. ' + this.getRole(userData));
    }*/

    this.isAuthenticatedSubject.next(true);
    this.userDataSubject.next(userData);
    this.tokenSubject.next(accessToken);

    this.handleUserAuthentication(userData);
  }

  private isExpired(expSeconds?: number): boolean {
    if (!expSeconds) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= expSeconds - LEEWAY_SECONDS;
  }

  private normalizeEpochSeconds(expLike: number | undefined): number | undefined {
    if (typeof expLike !== 'number') return undefined;
    return expLike > 10_000_000_000 ? Math.floor(expLike / 1000) : expLike;
  }

  private mapClaimsToUserData(c: JwtClaims): LoginInfo {
    return {
      sub: c['sub'],
      name:
        (c['name'] as string) ||
        `${c?.['vc']?.credentialSubject?.mandate?.mandatee?.firstName ?? ''} ${c?.['vc']?.credentialSubject?.mandate?.mandatee?.lastName ?? ''}`.trim(),
      email: c?.['vc']?.credentialSubject?.mandate?.mandatee?.email ?? c['email'] ?? '',
      role: (c['role'] as RoleType) ?? RoleType.LEAR,
      vc: c['vc'],
      organization: c?.['vc']?.credentialSubject?.mandate?.mandator?.organization ?? '',
      organizationIdentifier: c?.['vc']?.credentialSubject?.mandate?.mandator?.organizationIdentifier ?? '',
      serial_number: c?.['vc']?.credentialSubject?.mandate?.mandator?.serialNumber ?? '',
      country: c?.['vc']?.credentialSubject?.mandate?.mandator?.country ?? '',
    } as UserDataAuthenticationResponse;
  }
  
  private mapClaimsToLoginInfo(claims: JwtClaims, token: string): LoginInfo {
    const vc = claims?.['vc'] ?? {};
    const mandate = vc?.credentialSubject?.mandate ?? {};
    const mandatee = mandate?.mandatee ?? {};
    const mandator = mandate?.mandator ?? {};
    const powers = mandate?.power as any[] | undefined;

    const email: string = mandatee?.email ?? '';
    const user = email ? email.split('@')[0] : '';

    const orgId: string = mandator?.organizationIdentifier ?? '';
    const orgName: string = mandator?.organization ?? '';

    const exp = this.normalizeEpochSeconds(claims?.['exp'] as number) ?? 0;

    const orgRoles = this.deriveOrgRolesFromPowers(powers);

    const organizations: Organization[] = [
      {
        id: orgId,
        name: orgName,
        roles: orgRoles,
      },
    ];

    const loginInfo: LoginInfo = {
      id: claims?.['sub'] ?? '',
      user,
      email,
      token,
      expire: exp,
      seller: claims?.['partyId'],
      roles: [],
      organizations,
      logged_as: orgId || (claims?.['sub'] ?? ''),
      username: ''
    };

    return loginInfo;
  }

  private deriveOrgRolesFromPowers(powers: any[] | undefined): OrgRole[] {
    if (!Array.isArray(powers)) return [];
    const set = new Set<string>();

    for (const p of powers) {
      const fn = (p?.tmf_function || p?.function || '').toLowerCase();
      const actsRaw = (p?.tmf_action ?? p?.action) as string[] | undefined;
      const acts = Array.isArray(actsRaw) ? actsRaw.map((x) => x.toLowerCase()) : [];
      const has = (a: string) => acts.includes(a.toLowerCase());

      if (fn === 'onboarding' && has('execute')) set.add('orgAdmin');
      if (fn === 'productoffering' && (has('create') || has('update') || has('delete'))) set.add('seller');
      if (fn === 'certification' && (has('upload') || has('attest'))) set.add('certifier');
    }

    return Array.from(set).map((r) => ({ id: r, name: r }));
  }

  private handleUserAuthentication(userData: UserDataAuthenticationResponse): void {
    try {
      const learCredential = this.extractVCFromUserData(userData);
      const normalized = this.normalizer.normalizeLearCredential(learCredential) as LEARCredentialEmployee;
      this.handleVCLogin(normalized);
    } catch (error) {
      console.error(error);
    }
  }

  private getRole(userData: UserDataAuthenticationResponse): RoleType | null {
    return userData.role ?? null;
  }

  private handleVCLogin(learCredential: LEARCredentialEmployee): void {
    const mandator = {
      organizationIdentifier: learCredential.credentialSubject.mandate.mandator.organizationIdentifier,
      organization: learCredential.credentialSubject.mandate.mandator.organization,
      commonName: learCredential.credentialSubject.mandate.mandator.commonName,
      emailAddress: learCredential.credentialSubject.mandate.mandator.emailAddress,
      serialNumber: learCredential.credentialSubject.mandate.mandator.serialNumber,
      country: learCredential.credentialSubject.mandate.mandator.country,
      firstName: learCredential.credentialSubject.mandate.mandatee.firstName,
      lastName: learCredential.credentialSubject.mandate.mandatee.lastName,
    };

    this.mandatorSubject.next(mandator);

    const emailName = (mandator.emailAddress ?? '').split('@')[0] ?? '';
    const name =
      mandator.firstName && mandator.lastName
        ? `${mandator.firstName} ${mandator.lastName}`
        : `${learCredential.credentialSubject.mandate.mandatee.firstName} ${learCredential.credentialSubject.mandate.mandatee.lastName}`;

    this.emailSubject.next(emailName);
    this.nameSubject.next(name);
    this.userPowers = this.extractUserPowers(learCredential);
  }

  private extractVCFromUserData(userData: UserDataAuthenticationResponse) {
    if (!userData?.vc) {
      throw new Error('VC claim error.');
    }
    return userData.vc;
  }

  private extractUserPowers(learCredential: LEARCredentialEmployee): Power[] {
    try {
      return learCredential?.credentialSubject.mandate.power || [];
    } catch {
      return [];
    }
  }

  private clearAuthState() {
    this.isAuthenticatedSubject.next(false);
    this.userDataSubject.next(null);
    this.tokenSubject.next('');
    this.mandatorSubject.next(null);
    this.emailSubject.next('');
    this.nameSubject.next('');
    this.userPowers = [];
  }
}
