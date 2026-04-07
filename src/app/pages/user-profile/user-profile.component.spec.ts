import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { UserProfileComponent } from './user-profile.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import {
  authServiceMock,
  oidcSecurityServiceMock,
} from 'src/testing/mocks/oidc-security.service.mock';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  const hasActive = (el?: HTMLElement | null) =>
    !!el && el.classList.contains('text-green');

  const notActive = (el?: HTMLElement | null) =>
    !el || !el.classList.contains('text-green');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [
        UserProfileComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;

    component.loggedAsUser = false;
    (component as any).IS_ISBE = false;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle view flags when calling getProfile and getOrgProfile', () => {
    component.show_billing = true;
    component.show_profile = false;
    component.show_orders = true;
    component.show_org_profile = true;
    component.show_revenue = true;

    component.getProfile();

    expect(component.show_billing).toBe(false);
    expect(component.show_profile).toBe(true);
    expect(component.show_orders).toBe(false);
    expect(component.show_org_profile).toBe(false);
    expect(component.show_revenue).toBe(false);

    component.getOrgProfile();

    expect(component.show_billing).toBe(false);
    expect(component.show_profile).toBe(false);
    expect(component.show_orders).toBe(false);
    expect(component.show_org_profile).toBe(true);
    expect(component.show_revenue).toBe(false);
  });

});