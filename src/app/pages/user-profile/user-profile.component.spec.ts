import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UserProfileComponent } from './user-profile.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [UserProfileComponent, TranslateModule.forRoot(), HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle view flags when calling getProfile and getOrgProfile', () => {
    // start from known state
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
    // goToOrders calls detectChanges once
    expect(cdrDetectSpy).toHaveBeenCalled();
  });

  describe('DOM menu selection helpers', () => {
    const ids = ['billButton', 'accountButton', 'orgButton', 'orderButton', 'revenueButton'];
    const cls = 'text-white bg-primary-100';

    beforeEach(() => {
      // ensure DOM elements exist for selection functions
      ids.forEach(id => {
        const el = document.createElement('div');
        el.id = id;
        // start with no classes
        document.body.appendChild(el);
      });
    });

    afterEach(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    });

    it('selectAccount should add class to accountButton and remove from others', () => {
      component.selectAccount();

      const account = document.getElementById('accountButton')!;
      expect(account.className.match(cls)).toBeTruthy();

      const others = ['orgButton', 'billButton', 'orderButton', 'revenueButton'];
      others.forEach(id => {
        const el = document.getElementById(id)!;
        expect(el.className.match(cls)).toBeFalsy();
      });
    });

    it('selectOrganization should add class to orgButton and remove from others', () => {
      component.selectOrganization();

      const org = document.getElementById('orgButton')!;
      expect(org.className.match(cls)).toBeTruthy();

      const others = ['accountButton', 'billButton', 'orderButton', 'revenueButton'];
      others.forEach(id => {
        const el = document.getElementById(id)!;
        expect(el.className.match(cls)).toBeFalsy();
      });
    });

    it('selectBilling should add class to billButton and remove from others', () => {
      component.selectBilling();

      const bill = document.getElementById('billButton')!;
      expect(bill.className.match(cls)).toBeTruthy();

      const others = ['accountButton', 'orgButton', 'orderButton', 'revenueButton'];
      others.forEach(id => {
        const el = document.getElementById(id)!;
        expect(el.className.match(cls)).toBeFalsy();
      });
    });

    it('selectOrder should add class to orderButton and remove from others', () => {
      component.selectOrder();

      const order = document.getElementById('orderButton')!;
      expect(order.className.match(cls)).toBeTruthy();

      const others = ['accountButton', 'orgButton', 'billButton', 'revenueButton'];
      others.forEach(id => {
        const el = document.getElementById(id)!;
        expect(el.className.match(cls)).toBeFalsy();
      });
    });

    it('selectRevenue should add class to revenueButton and remove from others', () => {
      component.selectRevenue();

      const rev = document.getElementById('revenueButton')!;
      expect(rev.className.match(cls)).toBeTruthy();

      const others = ['accountButton', 'orgButton', 'billButton', 'orderButton'];
      others.forEach(id => {
        const el = document.getElementById(id)!;
        expect(el.className.match(cls)).toBeFalsy();
      });
    });
  });

  it('addClass and removeClass should modify element.className as expected', () => {
    const el = document.createElement('div');
    el.className = 'one two';

    component.addClass(el, 'three');
    expect(el.className.split(/\s+/)).toEqual(expect.arrayContaining(['one', 'two', 'three']));

    component.removeClass(el, 'two');
    expect(el.className.split(/\s+/)).toEqual(expect.arrayContaining(['one', 'three']));
    expect(el.className.split(/\s+/)).not.toContain('two');
  });

});
