// src/app/services/auth.service.ts
import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { RoleType, UserDataAuthenticationResponse } from '../models/user-data-authentication-response.dto';
import { EmployeeMandator, LEARCredentialEmployee, Power } from '../models/lear-credential';
import { LEARCredentialDataNormalizer } from '../models/lear-credential-employee-data-normalizer';
import { decodeJwt } from './jwt.util';

type JwtClaims = Record<string, any>;

const EXTERNAL_TOKEN_KEY = 'access_token'; // <-- cámbialo si tu otra web usa otra key
const LEEWAY_SECONDS = 60;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly userDataSubject = new BehaviorSubject<UserDataAuthenticationResponse | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string>('');
  private readonly mandatorSubject = new BehaviorSubject<EmployeeMandator | null>(null);
  private readonly emailSubject = new BehaviorSubject<string>('');
  private readonly nameSubject = new BehaviorSubject<string>('');
  public readonly roleType: WritableSignal<RoleType> = signal(RoleType.LEAR);

  private readonly normalizer = new LEARCredentialDataNormalizer();
  private userPowers: Power[] = [];

  constructor() {
    // Bootstrap inmediato al crear el servicio
    this.tryExternalToken();
    // (opcional) Reaccionar a cambios en otra pestaña:
    window.addEventListener('storage', (e) => {
      if (e.storageArea === sessionStorage && e.key === EXTERNAL_TOKEN_KEY) {
        this.tryExternalToken();
      }
    });
  }

  /** Verificación perezosa para el guard (mantén esta firma) */
  public checkAuth$(): Observable<boolean> {
    return of(this.tryExternalToken());
  }

  /** Evalúa el token de sessionStorage y actualiza el estado */
  private tryExternalToken(): boolean {
    const raw = sessionStorage.getItem(EXTERNAL_TOKEN_KEY);
    if (!raw) {
      this.clearAuthState();
      return false;
    }

    const claims = decodeJwt<JwtClaims>(raw);
    if (!claims || this.isExpired(claims['exp'])) {
      this.clearAuthState();
      return false;
    }

    const userData = this.mapExternalClaimsToUserData(claims);
    this.afterLoginSuccess(userData, raw);
    return true;
  }

  private afterLoginSuccess(userData: UserDataAuthenticationResponse, accessToken: string) {
    if (this.getRole(userData) !== RoleType.LEAR) {
      // si tu caso de uso lo requiere, en vez de throw puedes limpiar estado y devolver false
      this.clearAuthState();
      throw new Error('Error Role. ' + this.getRole(userData));
    }

    this.isAuthenticatedSubject.next(true);
    this.userDataSubject.next(userData);
    this.tokenSubject.next(accessToken);
    this.handleUserAuthentication(userData);
  }

  private isExpired(exp?: number): boolean {
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= (exp - LEEWAY_SECONDS);
  }

  /** Ajusta los mapeos a tus claims reales */
  private mapExternalClaimsToUserData(c: JwtClaims): UserDataAuthenticationResponse {
    return {
      sub: c['sub'],
      name: (c['name'] as string) || `${c['given_name'] ?? ''} ${c['family_name'] ?? ''}`.trim(),
      email: (c['email'] as string) ?? '',
      role: (c['role'] as RoleType) ?? RoleType.LEAR,
      vc: c['vc'],
      organization: c['organization'],
      organizationIdentifier: c['organizationIdentifier'],
      serial_number: c['serial_number'],
      country: c['country'],
    } as UserDataAuthenticationResponse;
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

  private extractDataFromCertificate(userData: UserDataAuthenticationResponse): EmployeeMandator {
    return {
      organizationIdentifier: userData.organizationIdentifier,
      organization: userData.organization,
      commonName: userData.name,
      emailAddress: userData?.email ?? '',
      serialNumber: userData?.serial_number ?? '',
      country: userData.country,
      firstName: undefined,
      lastName: undefined,
    };
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
    const name = mandator.firstName && mandator.lastName
      ? `${mandator.firstName} ${mandator.lastName}`
      : learCredential.credentialSubject.mandate.mandatee.firstName + ' ' + learCredential.credentialSubject.mandate.mandatee.lastName;

    this.emailSubject.next(emailName);
    this.nameSubject.next(name);
    this.userPowers = this.extractUserPowers(learCredential);
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

  public hasIn2OrganizationIdentifier(): boolean {
    const m = this.mandatorSubject.getValue();
    return m ? 'VATES-B60645900' === m.organizationIdentifier : false;
  }

  // ----- getters públicos -----
  public isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  public getUserData(): Observable<UserDataAuthenticationResponse | null> {
    return this.userDataSubject.asObservable();
  }

  public getEmailName(): Observable<string> {
    return this.emailSubject.asObservable();
  }

  public getToken(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  public getName(): Observable<string> {
    return this.nameSubject.asObservable();
  }

  // ----- helpers privados -----
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
  }
}
