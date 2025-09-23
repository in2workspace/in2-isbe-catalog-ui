import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { OfferComponent } from './offer.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiServiceService } from '../../../services/product-service.service';
import { EventMessageService } from 'src/app/services/event-message.service';
import { of, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

class MockApiService {
  postProductOffering = jest.fn().mockReturnValue(of({}));
  updateProductOffering = jest.fn().mockReturnValue(of({}));
  postOfferingPrice = jest.fn().mockReturnValue(of({ id: '1', name: 'Test', href: '1' }));
  updateOfferingPrice = jest.fn().mockReturnValue(of({ id: '1', name: 'Test', href: '1' }));
  getProductSpecification = jest.fn().mockResolvedValue({});
}

class MockEventMessageService {
  messages$ = new Subject<any>();
  emitUpdateOffer = jest.fn();
  emitSellerOffer = jest.fn();
}

describe('OfferComponent', () => {
  let component: OfferComponent;
  let fixture: ComponentFixture<OfferComponent>;
  let apiService: MockApiService;
  let eventMessage: MockEventMessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ApiServiceService, useClass: MockApiService },
        { provide: EventMessageService, useClass: MockEventMessageService }
      ]
    })
    .overrideTemplate(OfferComponent, '<div></div>')
    .compileComponents();

    fixture = TestBed.createComponent(OfferComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService) as unknown as MockApiService;
    eventMessage = TestBed.inject(EventMessageService) as unknown as MockEventMessageService;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formType as create by default', () => {
    expect(component.formType).toBe('create');
  });

  it('should set isFormValid to true when form is valid', () => {
    component.productOfferForm.patchValue({
      prodSpec: { id: '1' },
      catalogue: { id: '1' }
    });
    component.productOfferForm.get('generalInfo')?.setValue({});
    expect(component.isFormValid).toBe(true);
  });

  it('should handle subform changes', () => {
    component.handleSubformChange({
      subformType: 'test',
      isDirty: false,
      dirtyFields: [],
      originalValue: undefined,
      currentValue: undefined
    });
    expect(component.hasChanges).toBe(true);
  });

  it('should unsubscribe on destroy', () => {
    const spy = jest.spyOn(component['formSubscription']!, 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should not navigate to next step if current step is invalid in create mode', () => {
    component.formType = 'create';
    component.currentStep = 0;
    jest.spyOn(component, 'validateCurrentStep').mockReturnValue(false);
    component.goToStep(1);
    expect(component.currentStep).toBe(0);
  });

  it('should navigate to next step if allowed', () => {
    component.formType = 'create';
    component.currentStep = 0;
    jest.spyOn(component, 'validateCurrentStep').mockReturnValue(true);
    component.goToStep(1);
    expect(component.currentStep).toBe(1);
  });

  it('canNavigate should return true if generalInfo is valid and index <= currentStep', () => {
    component.formType = 'create';
    component.currentStep = 1;
    component.highestStep = 1;
    component.productOfferForm.get('generalInfo')?.setErrors(null);
    expect(component.canNavigate(1)).toBe(true);
  });

  it('handleStepClick should call goToStep if canNavigate is true', () => {
    const spy = jest.spyOn(component, 'goToStep');
    jest.spyOn(component, 'canNavigate').mockReturnValue(true);
    component.handleStepClick(2);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it('submitForm should call createOffer in create mode', () => {
    const spy = jest.spyOn(component, 'createOffer').mockImplementation(jest.fn());
    component.formType = 'create';
    component.submitForm();
    expect(spy).toHaveBeenCalled();
  });

  it('submitForm should call updateOffer in update mode', () => {
    const spy = jest.spyOn(component, 'updateOffer').mockImplementation(jest.fn());
    component.formType = 'update';
    component.submitForm();
    expect(eventMessage.emitUpdateOffer).toHaveBeenCalledWith(true);
    expect(spy).toHaveBeenCalled();
  });

  it('addToISOString should return correct ISO string for valid unit', () => {
    const result = component.addToISOString(1, 'month');
    expect(typeof result).toBe('string');
    expect(result).toContain('T');
  });

  it('calculateDiscountDuration should return correct duration', () => {
    const now = new Date();
    const start = now.toISOString();
    const end = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const duration = component.calculateDiscountDuration({ startDateTime: start, endDateTime: end }, 'days');
    expect(duration).toBe(2);
  });

  it('goBack should emit seller offer event', () => {
    component.goBack();
    expect(eventMessage.emitSellerOffer).toHaveBeenCalledWith(true);
  });

  it('saveOfferInfo should call api.postProductOffering in create mode', () => {
    component.formType = 'create';
    component.bundleChecked = false;

    component.productOfferForm.setControl(
      'generalInfo',
      new FormGroup({
        name: new FormControl('Test'),
        description: new FormControl(''),
        version: new FormControl('1'),
      })
    );

    component.productOfferForm.get('prodSpec')?.setValue({ id: '1' });
    component.productOfferForm.get('catalogue')?.setValue({ id: '1' });
    component.productOfferForm.get('category')?.setValue([]);
    component.productOfferForm.get('pricePlans')?.setValue([{ id: '1' }]);

    component.saveOfferInfo();
    expect(apiService.postProductOffering).toHaveBeenCalled();
  });

  it('saveOfferInfo should call api.updateProductOffering in update mode', () => {
    component.formType = 'update';
    component.offer = { id: '123' };

    component.productOfferForm.setControl(
      'generalInfo',
      new FormGroup({
        name: new FormControl('Test'),
        description: new FormControl(''),
        version: new FormControl('1'),
        status: new FormControl('Active')
      })
    );
    component.productOfferForm.get('prodSpec')?.setValue({ id: '1' });
    component.productOfferForm.get('catalogue')?.setValue({ id: '1' });
    component.productOfferForm.get('category')?.setValue([]);
    component.productOfferForm.get('pricePlans')?.setValue([{ id: '1' }]);

    component.saveOfferInfo();
    expect(apiService.updateProductOffering).toHaveBeenCalled();
  });
});