import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerOfferComponent } from './seller-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SellerOfferComponent', () => {
  let component: SellerOfferComponent;
  let fixture: ComponentFixture<SellerOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SellerOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize offers on ngOnInit', () => {
    const initOffersSpy = jest.spyOn(component, 'initOffers');
    component.ngOnInit();
    expect(initOffersSpy).toHaveBeenCalled();
  });

  it('should call eventMessage.emitSellerCreateOffer when goToCreate is called', () => {
    const spy = jest.spyOn(component['eventMessage'], 'emitSellerCreateOffer');
    component.goToCreate();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should call eventMessage.emitSellerUpdateOffer when goToUpdate is called', () => {
    const offer = { id: 1 };
    const spy = jest.spyOn(component['eventMessage'], 'emitSellerUpdateOffer');
    component.goToUpdate(offer);
    expect(spy).toHaveBeenCalledWith(offer);
  });

  it('should update sort and call getOffers on onSortChange', () => {
    const getOffersSpy = jest.spyOn(component, 'getOffers');
    component.onSortChange({ target: { value: 'name' } });
    expect(component.sort).toBe('name');
    expect(getOffersSpy).toHaveBeenCalledWith(false);

    component.onSortChange({ target: { value: 'other' } });
    expect(component.sort).toBeUndefined();
    expect(getOffersSpy).toHaveBeenCalledWith(false);
  });

  it('should update isBundle and call getOffers on onTypeChange', () => {
    const getOffersSpy = jest.spyOn(component, 'getOffers');
    component.onTypeChange({ target: { value: 'simple' } });
    expect(component.isBundle).toBe(false);
    expect(getOffersSpy).toHaveBeenCalledWith(false);

    component.onTypeChange({ target: { value: 'bundle' } });
    expect(component.isBundle).toBe(true);
    expect(getOffersSpy).toHaveBeenCalledWith(false);

    component.onTypeChange({ target: { value: 'other' } });
    expect(component.isBundle).toBeUndefined();
    expect(getOffersSpy).toHaveBeenCalledWith(false);
  });

  it('should add or remove filter from status and call getOffers on onStateFilterChange', () => {
    const getOffersSpy = jest.spyOn(component, 'getOffers');
    const initialLength = component.status.length;
    const filter = component.status[0];
    component.onStateFilterChange(filter);
    expect(component.status.length).toBe(initialLength + 1);
    expect(getOffersSpy).toHaveBeenCalledWith(false);

    component.onStateFilterChange(filter);
    expect(component.status.includes(filter)).toBe(true);
    expect(getOffersSpy).toHaveBeenCalledWith(false);
  });
});
