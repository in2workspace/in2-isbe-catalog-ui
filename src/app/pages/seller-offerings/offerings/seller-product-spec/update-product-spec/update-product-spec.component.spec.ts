import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UpdateProductSpecComponent } from './update-product-spec.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

jest.mock('flowbite', () => ({
  initFlowbite: jest.fn(),
}));

class ProductSpecServiceServiceMock {
  getResSpecById = (_: any) =>
    Promise.resolve({ id: 'rel-1', name: 'Rel Name' });

  updateProdSpec = jest.fn().mockReturnValue(of({}));
  getProdSpecByUser = jest.fn();
}


class LocalStorageServiceMock {
  getObject = jest.fn().mockReturnValue({});
}

class EventMessageServiceMock {
  messages$ = of({ type: 'None' });
  emitSellerProductSpec = jest.fn();
}

class AttachmentServiceServiceMock {
  uploadFile = jest.fn().mockReturnValue(of({ content: 'https://file/url' }));
}


describe('UpdateProductSpecComponent', () => {
  let component: UpdateProductSpecComponent;
  let fixture: ComponentFixture<UpdateProductSpecComponent>;

  const prodInput = {
    id: 'prod-1',
    name: 'Prod Name',
    description: 'Prod Desc',
    brand: 'Brand A',
    version: '1.2',
    productNumber: 'ABC-123',
    lifecycleStatus: 'Active',
    isBundle: false,
    bundledProductSpecification: [],
    productSpecCharacteristic: [
      {
        name: 'Color',
        description: 'Primary color',
        productSpecCharacteristicValue: [{ isDefault: true, value: 'Blue' }],
      },
    ],
    attachment: [
      { name: 'Manual', url: 'https://example/manual.pdf', attachmentType: 'application/pdf' },
      { name: 'Profile Picture', url: 'https://example/pic.jpg', attachmentType: 'image/jpeg' },
    ],
    productSpecificationRelationship: [
      { id: 'rel-1', name: 'Rel One', relationshipType: 'migration' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UpdateProductSpecComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        { provide: 'ProductSpecServiceService', useClass: ProductSpecServiceServiceMock },
        { provide: (require('src/app/services/product-spec-service.service').ProductSpecServiceService), useClass: ProductSpecServiceServiceMock },
        { provide: (require('src/app/services/local-storage.service').LocalStorageService), useClass: LocalStorageServiceMock },
        { provide: (require('src/app/services/event-message.service').EventMessageService), useClass: EventMessageServiceMock },
        { provide: (require('src/app/services/attachment-service.service').AttachmentServiceService), useClass: AttachmentServiceServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateProductSpecComponent);
    component = fixture.componentInstance;

    component.prod = prodInput;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate generalForm from input prod on init', () => {
    expect(component.generalForm.value.name).toBe(prodInput.name);
    expect(component.generalForm.value.description).toBe(prodInput.description);
    expect(component.generalForm.value.brand).toBe(prodInput.brand);
    expect(component.generalForm.value.version).toBe(prodInput.version);
    expect(component.generalForm.value.number).toBe(prodInput.productNumber);
  });

  it('should set initial flags and preview controls', () => {
    expect(component.showGeneral).toBe(true);
    expect(component.showSummary).toBe(false);
    component.togglePreview();
    expect(component.description).toBe(prodInput.description);
  });

  it('should toggle sections correctly', () => {
    component.toggleBundle();
    expect(component.showBundle).toBe(true);
    expect(component.showGeneral).toBe(false);

    component.toggleCompliance();
    expect(component.showCompliance).toBe(true);

    component.toggleChars();
    expect(component.showChars).toBe(true);
    expect(component.stringCharSelected).toBe(true);

    component.toggleAttach();
    expect(component.showAttach).toBe(true);

    component.toggleRelationship();
    expect(component.showRelationships).toBe(true);
  });

  it('should have prodChars from non-compliance characteristics', () => {
    expect(component.prodChars.length).toBeGreaterThanOrEqual(1);
    const color = component.prodChars.find(c => c.name === 'Color');
    expect(color).toBeTruthy();
  });

  it('should addCharValue for string type', () => {
    component.stringCharSelected = true;
    component.stringValue = 'Test';
    component.addCharValue();
    expect(component.creatingChars.length).toBe(1);
    expect(component.creatingChars[0].value).toBe('Test');
  });

  it('should saveChar pushes to prodChars and reset builder state', () => {
    component.charsForm.controls['name'].setValue('Char 1');
    component.stringValue = 'Val1';
    component.addCharValue();
    component.saveChar();
    expect(component.prodChars.some(c => c.name === 'Char 1')).toBe(true);
    expect(component.creatingChars.length).toBe(0);
    expect(component.showCreateChar).toBe(false);
  });

  it('checkInput returns true for whitespace and false for non-empty', () => {
    expect(component.checkInput('   ')).toBe(true);
    expect(component.checkInput('abc')).toBe(false);
  });

  it('isValidFilename validates allowed chars', () => {
    expect(component.isValidFilename('file_123.txt')).toBe(true);
    expect(component.isValidFilename('file@123.txt')).toBe(false);
  });

  it('showFinish builds productSpecToUpdate and shows summary', async () => {
    component.generalForm.controls['name'].setValue('ProdX');
    component.generalForm.controls['version'].setValue('2.0');
    component.generalForm.controls['brand'].setValue('BrandZ');

    component.showFinish();

    expect(component.showSummary).toBe(true);
    expect(component.productSpecToUpdate).toBeTruthy();
    expect(component.productSpecToUpdate?.name).toBe('ProdX');
    expect(component.productSpecToUpdate?.brand).toBe('BrandZ');
    expect(component.productSpecToUpdate?.version).toBe('2.0');

    expect(component.productSpecToUpdate?.attachment?.length).toBeGreaterThan(0);
    expect(component.productSpecToUpdate?.productSpecCharacteristic?.length).toBeGreaterThan(0);
    expect(component.productSpecToUpdate?.productSpecificationRelationship?.length).toBeGreaterThan(0);
  });

  it('isProdValid returns expected boolean according to bundle & validity', () => {
    component.generalForm.controls['name'].setValue('Prod');
    component.generalForm.controls['brand'].setValue('Brand');
    component.generalForm.controls['version'].setValue('1.0');
    component.bundleChecked = false;
    expect(component.isProdValid()).toBe(false);

    component.bundleChecked = true;
    component.prodSpecsBundle = [{ id: 'a' } as any];
    expect(component.isProdValid()).toBe(true);

    component.prodSpecsBundle = [{ id: 'a' } as any, { id: 'b' } as any];
    expect(component.isProdValid()).toBe(false);
  });

  it('updateProduct calls service update and navigates back', () => {
    component.productSpecToUpdate = {
      name: 'P',
      description: '',
      version: '1',
      brand: 'B',
      productNumber: '',
      lifecycleStatus: 'Active',
      productSpecCharacteristic: [],
      productSpecificationRelationship: [],
      attachment: [],
    };

    const prodSpecSvc: any = TestBed.inject(
      require('src/app/services/product-spec-service.service').ProductSpecServiceService
    );
    const events: any = TestBed.inject(
      require('src/app/services/event-message.service').EventMessageService
    );

    component.updateProduct();

    expect(prodSpecSvc.updateProdSpec).toHaveBeenCalled();
    expect(events.emitSellerProductSpec).toHaveBeenCalledWith(false);
  });
});
