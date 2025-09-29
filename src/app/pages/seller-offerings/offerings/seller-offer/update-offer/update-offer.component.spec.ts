import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { UpdateOfferComponent } from './update-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { EventMessageService } from 'src/app/services/event-message.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';


describe('UpdateOfferComponent', () => {
  let component: UpdateOfferComponent;
  let fixture: ComponentFixture<UpdateOfferComponent>;
  let localStorageMock: { getObject: jest.Mock };
  let eventMessageMock: { messages$: Subject<any>; emitSellerOffer: jest.Mock };

  beforeEach(async () => {    
    localStorageMock = { getObject: jest.fn() };
    eventMessageMock = { messages$: new Subject(), emitSellerOffer: jest.fn() };
    
    await TestBed.configureTestingModule({
      imports: [UpdateOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: LocalStorageService, useValue: localStorageMock },
        { provide: EventMessageService, useValue: eventMessageMock },
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(UpdateOfferComponent, {
      set: { imports: [TranslateModule] },
    })
    .compileComponents();

    const ls = TestBed.inject(LocalStorageService) as any;
    ls.getObject.mockReturnValue({});
    
    fixture = TestBed.createComponent(UpdateOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should emit event on goBack', () => {
    const emitSpy = jest.spyOn(eventMessageMock, 'emitSellerOffer');
    component.goBack();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
