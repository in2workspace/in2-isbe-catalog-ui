import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CharacteristicComponent } from './characteristic.component';
import { ReactiveFormsModule } from '@angular/forms';
describe('CharacteristicComponent', () => {
  let component: CharacteristicComponent;
  let fixture: ComponentFixture<CharacteristicComponent>;

  const mockCharacteristic = {
    id: '1',
    name: 'Test Characteristic',
    description: 'A test characteristic',
    productSpecCharacteristicValue: [
      { isDefault: true, value: 'default', unitOfMeasure: 'kg' },
      { isDefault: false, value: 'other', unitOfMeasure: 'kg' }
    ]
  };

  beforeEach(async () => {
    
    await TestBed.configureTestingModule({
      imports: [CharacteristicComponent, ReactiveFormsModule],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CharacteristicComponent);
    component = fixture.componentInstance;
    component.characteristic = mockCharacteristic as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize control with default value', () => {
    expect(component.control.value).toBe('default');
  });

  it('should emit valueChange when control value changes and not readOnly', () => {
    jest.spyOn(component.valueChange, 'emit');
    component.control.setValue('other');
    expect(component.valueChange.emit).toHaveBeenCalledWith({
      characteristicId: '1',
      selectedValue: 'other'
    });
  });

  it('should not emit valueChange when readOnly is true', () => {
    component.readOnly = true;
    component.ngOnInit();
    jest.spyOn(component.valueChange, 'emit');
    component.control.setValue('other');
    expect(component.valueChange.emit).not.toHaveBeenCalled();
  });

  it('isSlider should return false if no valueFrom/valueTo', () => {
    expect(component.isSlider()).toBe(false);
  });

  it('isSlider should return true if valueFrom/valueTo present', () => {
    component.characteristic.productSpecCharacteristicValue = [
      { isDefault: false, valueFrom: 1, valueTo: 10, unitOfMeasure: 'kg' }
    ] as any;
    expect(component.isSlider()).toBe(true);
  });

  it('getSliderRange should return correct min and max', () => {
    component.characteristic.productSpecCharacteristicValue = [
      { isDefault: false, valueFrom: 2, valueTo: 8, unitOfMeasure: 'kg' }
    ] as any;
    expect(component.getSliderRange()).toEqual({ min: 2, max: 8 });
  });

  it('getSliderRange should return null if no range', () => {
    component.characteristic.productSpecCharacteristicValue = [
      { isDefault: false, value: 'abc', unitOfMeasure: 'kg' }
    ] as any;
    expect(component.getSliderRange()).toBeNull();
  });

  it('getUnit should return unitOfMeasure', () => {
    expect(component.getUnit()).toBe('kg');
  });

  it('getUnit should return undefined if no values', () => {
    component.characteristic.productSpecCharacteristicValue = [];
    expect(component.getUnit()).toBeUndefined();
  });
});
  