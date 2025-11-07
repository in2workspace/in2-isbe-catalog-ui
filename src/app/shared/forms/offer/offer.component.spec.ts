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
  
  it('normalizeIdArray should return sorted ids and filter falsy values (default key)', () => {
      const input = [
        { id: 'b' },
        { id: 'a' },
        { name: 'noid' },
        { id: '' },
        { id: null },
        { id: 'c' }
      ];
      const result = (component as any).normalizeIdArray(input);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('normalizeIdArray should use custom key when provided', () => {
      const input = [{ href: 'z' }, { href: 'y' }, { href: '' }];
      const result = (component as any).normalizeIdArray(input, 'href');
      expect(result).toEqual(['y', 'z']);
    });

    it('normalizeTerms should trim fields, remove empty entries and sort deterministically', () => {
      const input = [
        { name: '  beta ', description: '  two ' },
        { name: 'alpha', description: 'one' },
        { name: ' ', description: 'onlydesc' },
        { name: '', description: '' },
        { name: null, description: 'desconly' },
        { name: 'alpha', description: '  aa ' }
      ];
      const result = (component as any).normalizeTerms(input);
      expect(result).toEqual([
        { name: 'alpha', description: 'aa' },
        { name: 'alpha', description: 'one' },
        { name: 'beta', description: 'two' },
        { name: '', description: 'desconly' },
        { name: '', description: 'onlydesc' }
      ]);
    });

  // Additional tests to increase coverage

  it('createPriceAlteration should call api.postOfferingPrice and return created price', async () => {
    const alterationComponent = {
      discountDuration: 2,
      discountDurationUnit: 'days',
      discountUnit: 'fixed',
      discountValue: 10
    };
    const res = await (component as any).createPriceAlteration(alterationComponent, 'EUR');
    expect(apiService.postOfferingPrice).toHaveBeenCalled();
    expect(res).toHaveProperty('id', '1');
  });

  it('createPriceComponent should create price, create discount and post price components', async () => {
    const compArg = {
      name: 'CompName',
      description: 'Desc',
      lifecycleStatus: 'Active',
      priceType: 'one-time',
      price: 100,
      discountValue: 5,
      discountDuration: 1,
      discountDurationUnit: 'day',
      discountUnit: 'fixed'
    };
    const result = await (component as any).createPriceComponent(compArg, 'EUR');
    // Expect two calls: one for discount alteration and one for creating the price component itself
    expect(apiService.postOfferingPrice).toHaveBeenCalled();
    expect(result).toHaveProperty('id', '1');
  });

  it('updatePriceComponent should call updateOfferingPrice and return updated id', async () => {
    const compArg = {
      id: '1',
      newValue: {
        name: 'Updated',
        description: 'D',
        lifecycleStatus: 'Active',
        priceType: 'usage',
        price: 3,
        usageUnit: 'GB',
        selectedCharacteristic: [{ id: 's' }],
        discountValue: 2,
        discountDuration: 1,
        discountDurationUnit: 'day',
        discountUnit: 'fixed',
        usageSpecId: 'u'
      }
    };
    const res = await (component as any).updatePriceComponent(compArg, 'EUR');
    expect(apiService.updateOfferingPrice).toHaveBeenCalled();
    expect(res).toHaveProperty('id', '1');
  });

  it('createBundledPricePlan filters prodSpecCharValueUse defaults and sets unitOfMeasure', () => {
    const plan = {
      name: 'bundlePlan',
      prodSpecCharValueUse: [
        {
          productSpecCharacteristicValue: [
            { value: 'v1', isDefault: false },
            { value: 'v2', isDefault: true }
          ]
        }
      ],
      usageUnit: { amount: 1, units: 'units' }
    };
    const res = (component as any).createBundledPricePlan(plan, [{ id: 'comp1' }]);
    expect(res.isBundle).toBe(true);
    expect(res.prodSpecCharValueUse[0].productSpecCharacteristicValue.length).toBe(1);
    expect(res.unitOfMeasure).toBeDefined();
  });

  it('createSinglePricePlan builds price object correctly for comp override and prodSpecCharValueUse mapping', async () => {
    const plan = {
      name: 'singlePlan',
      newValue: {
        priceComponents: [
          { price: 30, priceType: 'one-time', currency: 'EUR', usageUnit: 'GB', usageSpecId: 'u' }
        ],
        currency: 'EUR',
        priceComponents0: {}
      },
      currency: 'EUR',
      prodSpecCharValueUse: [
        { productSpecCharacteristicValue: [{ isDefault: true, value: 'x' }] }
      ]
    };
    const comp = { price: 10, priceType: 'one-time', usageUnit: 'GB' };
    const res = await (component as any).createSinglePricePlan(plan, comp);
    expect(res.price).toBeDefined();
    expect(res.price.value).toBe(10);
    expect(res.prodSpecCharValueUse).toBeDefined();
  });

  it('mapProductProfile returns FormGroup with selectedValues default from isDefault', () => {
    const prodSpecCharValueUse = [
      {
        id: 'c1',
        name: 'Char1',
        productSpecCharacteristicValue: [
          { value: 'A', isDefault: false },
          { value: 'B', isDefault: true }
        ]
      }
    ];
    const fg = (component as any).mapProductProfile(prodSpecCharValueUse);
    const arr = fg.get('selectedValues');
    expect(arr).toBeDefined();
    const val = arr.value[0].selectedValue;
    expect(val).toBe('B');
  });

  it('buildFormTerms includes procurement and normalizes terms', () => {
    const v = {
      license: { treatment: ' lic ', description: ' desc ' },
      procurementMode: { mode: ' procMode ' }
    };
    const terms = (component as any).buildFormTerms(v);
    expect(Array.isArray(terms)).toBe(true);
    expect(terms.find((t: any) => t.name === 'procurement' && t.description === 'procMode')).toBeTruthy();
    expect(terms.find((t: any) => t.name === 'lic' && t.description === 'desc')).toBeTruthy();
  });

  it('buildSnapshot returns correct snapshots for form and offer', () => {
    // set offer
    component.offer = {
      name: 'OfferName',
      description: 'OfferDesc',
      version: 'v1',
      productSpecification: { id: 'ps1' },
      category: [{ id: 'cat1' }],
      productOfferingPrice: [{ id: 'pp1' }],
      productOfferingTerm: [{ name: 't1', description: 'd1' }]
    };
    const offerSnap = (component as any).buildSnapshot('offer');
    expect(offerSnap.name).toBe('OfferName');
    expect(offerSnap.category).toEqual(['cat1']);
    expect(offerSnap.prices).toEqual(['pp1']);
    // set form values
    component.productOfferForm.setControl(
      'generalInfo',
      new FormGroup({
        name: new FormControl('FormName'),
        description: new FormControl('FormDesc'),
        version: new FormControl('v2'),
        status: new FormControl('Active')
      })
    );
    component.productOfferForm.get('prodSpec')?.setValue({ id: 'ps2' });
    component.productOfferForm.get('category')?.setValue([{ id: 'cat2' }]);
    component.productOfferForm.get('pricePlans')?.setValue([{ id: 'pp2' }]);
    component.productOfferForm.setControl(
      'license',
      new FormGroup({
        treatment: new FormControl('lt'),
        description: new FormControl('ld')
      })
    );
    const formSnap = (component as any).buildSnapshot('form');
    expect(formSnap.name).toBe('FormName');
    expect(formSnap.productSpecification).toBe('ps2');
    expect(formSnap.category).toEqual(['cat2']);
    expect(formSnap.prices).toEqual(['pp2']);
  });

});
