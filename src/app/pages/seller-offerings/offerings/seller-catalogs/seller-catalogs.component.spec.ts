import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerCatalogsComponent } from './seller-catalogs.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';

describe('SellerCatalogsComponent', () => {
  let component: SellerCatalogsComponent;
  let fixture: ComponentFixture<SellerCatalogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [  SellerCatalogsComponent,HttpClientTestingModule,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerCatalogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
