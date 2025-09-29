import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductInventoryComponent } from './product-inventory.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';

describe('ProductInventoryComponent', () => {
  let component: ProductInventoryComponent;
  let fixture: ComponentFixture<ProductInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [ProductInventoryComponent,TranslateModule.forRoot(), HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
