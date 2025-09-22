import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateOfferComponent } from './create-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CreateOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()]
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
    expect(component.partyId).toBe('');
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
    expect(component.partyId).toBe('');
  });

  it('should emit event on goBack', () => {
    const emitSpy = jest.spyOn(component['eventMessage'], 'emitSellerOffer');
    component.goBack();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should call initPartyInfo on ChangedSession event', () => {
    const initSpy = jest.spyOn(component, 'initPartyInfo');
    // Simulate event emission
    (component['eventMessage'].messages$ as any).next({ type: 'ChangedSession' });
    expect(initSpy).toHaveBeenCalled();
  });
});
