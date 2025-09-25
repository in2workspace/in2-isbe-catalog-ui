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
  
  it('should initialize seller from localStorage when logged_as equals id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: 'user1',
      id: 'user1',
      organizations: []
    };
    localStorageMock.getObject.mockReturnValue(mockLoginInfo);
    component.initPartyInfo();

    expect(component.seller).toBe('user1');
  });

  it('should initialize seller from organizations when logged_as does not equal id', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) + 1000,
      logged_as: 'org2',
      id: 'user1',
      organizations: [
        { id: 'org2' }
      ]
    };
    localStorageMock.getObject.mockReturnValue(mockLoginInfo);
    component.initPartyInfo();

    expect(component.seller).toBe('org2');
  });

  it('should not set seller if login info is expired', () => {
    const mockLoginInfo = {
      expire: Math.floor(Date.now() / 1000) - 1000,
      logged_as: 'user1',
      id: 'user1',
      seller: 'party123',
      organizations: []
    };
    localStorageMock.getObject.mockReturnValue(mockLoginInfo);
      component.initPartyInfo();

    expect(component.seller).toBe('');
  });

  it('should emit event on goBack', () => {
    const emitSpy = jest.spyOn(eventMessageMock, 'emitSellerOffer');
    component.goBack();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });
});
