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

  it('should toggle billing, revenue and orders views and call change detection where expected', () => {
    const cdrDetectSpy = jest.spyOn((component as any).cdr, 'detectChanges');

    component.getBilling();
    expect(component.show_billing).toBe(true);
    expect(component.show_profile).toBe(false);
    expect(component.show_orders).toBe(false);
    expect(component.show_org_profile).toBe(false);
    expect(component.show_revenue).toBe(false);
    expect(cdrDetectSpy).toHaveBeenCalled();

    cdrDetectSpy.mockClear();

    component.getRevenue();
    expect(component.show_revenue).toBe(true);
    expect(component.show_billing).toBe(false);
    expect(cdrDetectSpy).toHaveBeenCalled();

    cdrDetectSpy.mockClear();

    component.goToOrders();
    expect(component.show_orders).toBe(true);
    expect(component.show_profile).toBe(false);
    expect(component.show_billing).toBe(false);
    expect(component.show_org_profile).toBe(false);
    expect(component.show_revenue).toBe(false);
    expect(cdrDetectSpy).toHaveBeenCalled();
  });

  describe('DOM menu selection helpers (usando ViewChilds)', () => {
    beforeEach(() => {
      component.loggedAsUser = false;
      (component as any).IS_ISBE = false;
      fixture.detectChanges();
    });

    it('selectAccount should add class to accountButton and remove from others', () => {
      component.selectAccount();
      fixture.detectChanges();

      const account = component.accountButton?.nativeElement ?? null;
      const org = component.orgButton?.nativeElement ?? null;
      const bill = component.billButton?.nativeElement ?? null;
      const order = component.orderButton?.nativeElement ?? null; // puede no existir
      const revenue = component.revenueButton?.nativeElement ?? null;

      expect(account).toBeTruthy();
      expect(hasActive(account)).toBe(true);

      expect(notActive(org)).toBe(true);
      expect(notActive(bill)).toBe(true);
      expect(notActive(order)).toBe(true);
      expect(notActive(revenue)).toBe(true);
    });

    it('selectOrganization should add class to orgButton and remove from others', () => {
      component.selectOrganization();
      fixture.detectChanges();

      const account = component.accountButton?.nativeElement ?? null;
      const org = component.orgButton?.nativeElement ?? null;
      const bill = component.billButton?.nativeElement ?? null;
      const order = component.orderButton?.nativeElement ?? null;
      const revenue = component.revenueButton?.nativeElement ?? null;

      expect(org).toBeTruthy();
      expect(hasActive(org)).toBe(true);

      expect(notActive(account)).toBe(true);
      expect(notActive(bill)).toBe(true);
      expect(notActive(order)).toBe(true);
      expect(notActive(revenue)).toBe(true);
    });

    it('selectBilling should add class to billButton and remove from others', () => {
      component.selectBilling();
      fixture.detectChanges();

      const account = component.accountButton?.nativeElement ?? null;
      const org = component.orgButton?.nativeElement ?? null;
      const bill = component.billButton?.nativeElement ?? null;
      const order = component.orderButton?.nativeElement ?? null;
      const revenue = component.revenueButton?.nativeElement ?? null;

      expect(bill).toBeTruthy();
      expect(hasActive(bill)).toBe(true);

      expect(notActive(account)).toBe(true);
      expect(notActive(org)).toBe(true);
      expect(notActive(order)).toBe(true);
      expect(notActive(revenue)).toBe(true);
    });

    it('selectOrder should add class to orderButton and remove from others (si existe)', () => {
      component.selectOrder();
      fixture.detectChanges();

      const account = component.accountButton?.nativeElement ?? null;
      const org = component.orgButton?.nativeElement ?? null;
      const bill = component.billButton?.nativeElement ?? null;
      const order = component.orderButton?.nativeElement ?? null;
      const revenue = component.revenueButton?.nativeElement ?? null;

      if (order) {
        expect(hasActive(order)).toBe(true);
        expect(notActive(account)).toBe(true);
        expect(notActive(org)).toBe(true);
        expect(notActive(bill)).toBe(true);
        expect(notActive(revenue)).toBe(true);
      }
    });

    it('selectRevenue should add class to revenueButton and remove from others', () => {
      component.selectRevenue();
      fixture.detectChanges();

      const account = component.accountButton?.nativeElement ?? null;
      const org = component.orgButton?.nativeElement ?? null;
      const bill = component.billButton?.nativeElement ?? null;
      const order = component.orderButton?.nativeElement ?? null;
      const revenue = component.revenueButton?.nativeElement ?? null;

      expect(revenue).toBeTruthy();
      expect(hasActive(revenue)).toBe(true);

      expect(notActive(account)).toBe(true);
      expect(notActive(org)).toBe(true);
      expect(notActive(bill)).toBe(true);
      expect(notActive(order)).toBe(true);
    });
  });

  it('addClass and removeClass should modify element.className as expected', () => {
    const el = document.createElement('div');
    el.className = 'one two';

    component.addClass(el as any, 'three');
    expect(el.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['one', 'two', 'three'])
    );

    component.removeClass(el as any, 'two');
    expect(el.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['one', 'three'])
    );
    expect(el.className.split(/\s+/)).not.toContain('two');
  });
});
