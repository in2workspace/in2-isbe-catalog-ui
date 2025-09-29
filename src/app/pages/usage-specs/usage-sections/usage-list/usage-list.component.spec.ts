import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UsageListComponent } from './usage-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';

describe('UsageListComponent', () => {
  let component: UsageListComponent;
  let fixture: ComponentFixture<UsageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [UsageListComponent,HttpClientTestingModule,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
