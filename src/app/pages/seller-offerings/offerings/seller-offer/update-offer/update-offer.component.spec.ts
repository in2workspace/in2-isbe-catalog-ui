import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { UpdateOfferComponent } from './update-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { EventMessageService } from 'src/app/services/event-message.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';


describe('UpdateOfferComponent', () => {
  let component: UpdateOfferComponent;
  let fixture: ComponentFixture<UpdateOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: LocalStorageService, useValue: { getObject: jest.fn() } },
        { provide: EventMessageService, useValue: { messages$: new Subject(), emitSellerOffer: jest.fn() } },
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
  
  it('should initialize partyId from localStorage when logged_as equals id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: 'user1',
      id: 'user1',
      partyId: 'party123',
      organizations: []
    };
    const localStorageService = TestBed.inject<any>(Object.getPrototypeOf(component).constructor['ɵfac'].localStorage);
    jest.spyOn(localStorageService, 'getObject').mockReturnValue(mockLoginInfo);

    component.initPartyInfo();

    expect(component.partyId).toBe('party123');
  });

  it('should initialize partyId from organizations when logged_as does not equal id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: 'org2',
      id: 'user1',
      partyId: 'party123',
      organizations: [
        { id: 'org2', partyId: 'partyOrg2' }
      ]
    };
    const localStorageService = TestBed.inject<any>(Object.getPrototypeOf(component).constructor['ɵfac'].localStorage);
    jest.spyOn(localStorageService, 'getObject').mockReturnValue(mockLoginInfo);

    component.initPartyInfo();

    expect(component.partyId).toBe('partyOrg2');
  });

  it('should not set partyId if login info is expired', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) - 1000,
      logged_as: 'user1',
      id: 'user1',
      partyId: 'party123',
      organizations: []
    };
    const localStorageService = TestBed.inject<any>(Object.getPrototypeOf(component).constructor['ɵfac'].localStorage);
    jest.spyOn(localStorageService, 'getObject').mockReturnValue(mockLoginInfo);

    component.initPartyInfo();

    expect(component.partyId).toBe('');
  });

  it('should emit event on goBack', () => {
    const eventMessageService = TestBed.inject<any>(Object.getPrototypeOf(component).constructor['ɵfac'].eventMessage);
    const emitSpy = jest.spyOn(eventMessageService, 'emitSellerOffer');
    component.goBack();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
