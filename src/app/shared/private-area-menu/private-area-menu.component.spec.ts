import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PrivateAreaMenuComponent } from './private-area-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import {
  authServiceMock,
  oidcSecurityServiceMock,
} from 'src/testing/mocks/oidc-security.service.mock';

describe('PrivateAreaMenuComponent', () => {
  let component: PrivateAreaMenuComponent;
  let fixture: ComponentFixture<PrivateAreaMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [
        PrivateAreaMenuComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateAreaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
