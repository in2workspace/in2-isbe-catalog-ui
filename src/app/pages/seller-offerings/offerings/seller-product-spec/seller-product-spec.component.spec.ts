import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerProductSpecComponent } from './seller-product-spec.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SellerProductSpecComponent', () => {
  let component: SellerProductSpecComponent;
  let fixture: ComponentFixture<SellerProductSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerProductSpecComponent, TranslateModule.forRoot(), HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerProductSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize prodSpecs and call getProdSpecs on ngOnInit', () => {
    const spy = jest.spyOn(component, 'getProdSpecs');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit event when goToCreate is called', () => {
    const spy = jest.spyOn(component['eventMessage'], 'emitSellerCreateProductSpec');
    component.goToCreate();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should emit event when goToUpdate is called', () => {
    const prod = { id: 1 };
    const spy = jest.spyOn(component['eventMessage'], 'emitSellerUpdateProductSpec');
    component.goToUpdate(prod);
    expect(spy).toHaveBeenCalledWith(prod);
  });

  it('should update sort and call getProdSpecs on onSortChange', () => {
    const spy = jest.spyOn(component, 'getProdSpecs');
    component.onSortChange({ target: { value: 'name' } });
    expect(component.sort).toBe('name');
    expect(spy).toHaveBeenCalledWith(false);

    component.onSortChange({ target: { value: 'other' } });
    expect(component.sort).toBeUndefined();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should update isBundle and call getProdSpecs on onTypeChange', () => {
    const spy = jest.spyOn(component, 'getProdSpecs');
    component.onTypeChange({ target: { value: 'simple' } });
    expect(component.isBundle).toBe(false);
    expect(spy).toHaveBeenCalledWith(false);

    component.onTypeChange({ target: { value: 'bundle' } });
    expect(component.isBundle).toBe(true);

    component.onTypeChange({ target: { value: 'other' } });
    expect(component.isBundle).toBeUndefined();
  });

  it('should add and remove filters in onStateFilterChange', () => {
    const spy = jest.spyOn(component, 'getProdSpecs');
    const filter = 'Active';
    component.status = ['Active', 'Launched'];
    component.onStateFilterChange(filter);
    expect(component.status).not.toContain('Active');
    expect(spy).toHaveBeenCalledWith(false);

    component.onStateFilterChange(filter);
    expect(component.status).toContain('Active');
  });

  it('should call getProdSpecs with true on next()', async () => {
    const spy = jest.spyOn(component, 'getProdSpecs').mockResolvedValue(undefined);
    await component.next();
    expect(spy).toHaveBeenCalledWith(true);
  });
});
