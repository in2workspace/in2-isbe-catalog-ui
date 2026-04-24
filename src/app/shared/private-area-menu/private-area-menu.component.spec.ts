import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { PrivateAreaMenuComponent } from './private-area-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { AccountServiceService } from 'src/app/services/account-service.service';
import {
  authServiceMock,
  oidcSecurityServiceMock,
} from 'src/testing/mocks/oidc-security.service.mock';

const accountServiceMock = {
  getOrgInfo: jest.fn(() => Promise.resolve({})),
  isOrgInfoComplete: jest.fn(() => true),
};

describe('PrivateAreaMenuComponent', () => {
  let component: PrivateAreaMenuComponent;
  let fixture: ComponentFixture<PrivateAreaMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        { provide: AccountServiceService, useValue: accountServiceMock },
        provideRouter([]),
      ],
      imports: [
        PrivateAreaMenuComponent,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivateAreaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
