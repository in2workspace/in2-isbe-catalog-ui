import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateOfferComponent } from './create-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { EventMessageService } from 'src/app/services/event-message.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(async () => {
    const localStorageMock = {
      getObject: jest.fn().mockReturnValue({
        expire: Math.floor(Date.now() / 1000) + 1000,
        logged_as: '123',
        id: '123',
        partyId: 'party-abc',
        organizations: []
      })
    };

    const eventMessageMock = { messages$: new Subject<any>(), emitSellerOffer: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CreateOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: LocalStorageService, useValue: localStorageMock },
      { provide: EventMessageService, useValue: eventMessageMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(CreateOfferComponent, {
      set: { imports: [TranslateModule] },
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize partyId from localStorage when logged_as equals id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: '123',
      id: '123',
      partyId: 'party-abc',
      organizations: []
    };
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(mockLoginInfo);
    component.initPartyInfo();
    expect(component.partyId).toBe('party-abc');
  });

  it('should initialize partyId from organizations when logged_as does not equal id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: '456',
      id: '123',
      partyId: 'party-abc',
      organizations: [
        { id: '456', partyId: 'party-def' }
      ]
    };
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(mockLoginInfo);
    component.initPartyInfo();
    expect(component.partyId).toBe('party-def');
  });

  it('should not set partyId if login_items is empty object', () => {
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue({});
    component.initPartyInfo();
    expect(component.partyId).toBe('party-abc');
  });

  it('should not set partyId if session is expired', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) - 1000,
      logged_as: '123',
      id: '123',
      partyId: 'party-abc',
      organizations: []
    };
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(mockLoginInfo);
    component.initPartyInfo();
    expect(component.partyId).toBe('party-abc');
  });

  it('should emit event on goBack', () => {
    const emitSpy = jest.spyOn(component['eventMessage'], 'emitSellerOffer');
    component.goBack();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should call initPartyInfo on ChangedSession event', () => {
  const mockLoginInfo = {
    expire: Math.floor(Date.now() / 1000) + 1000,
    logged_as: '123',
    id: '123',
    partyId: 'party-abc',
    organizations: []
  };

  jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(mockLoginInfo);
  const initSpy = jest.spyOn(component, 'initPartyInfo');

  (component as any)['eventMessage'].messages$.next({ type: 'ChangedSession' });

  expect(initSpy).toHaveBeenCalled();
});

});
