import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarkdownModule } from 'ngx-markdown';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => key === 'keywords' ? 'example' : null
        }
      }
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },  
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [TranslateModule.forRoot(),HttpClientTestingModule,  MarkdownModule.forRoot()] 
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
