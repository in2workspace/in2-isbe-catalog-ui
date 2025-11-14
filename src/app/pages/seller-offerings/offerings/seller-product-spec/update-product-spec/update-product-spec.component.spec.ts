import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UpdateProductSpecComponent } from './update-product-spec.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';

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
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
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
    expect(component.isProdValid()).toBe(true);

    component.bundleChecked = true;
    component.prodSpecsBundle = [{ id: 'a' } as any];
    expect(component.isProdValid()).toBe(false);

    component.prodSpecsBundle = [{ id: 'a' } as any, { id: 'b' } as any];
    expect(component.isProdValid()).toBe(true);
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

    it('onClick hides emoji and upload file popups and calls detectChanges', () => {
        component.showEmoji = true;
        component.showUploadFile = true;
        const detectSpy = jest.spyOn(component['cdr'], 'detectChanges');
        component.onClick();
        expect(component.showEmoji).toBe(false);
        expect(component.showUploadFile).toBe(false);
        expect(detectSpy).toHaveBeenCalledTimes(2);
    });

    it('onClick does nothing if both flags are false', () => {
        component.showEmoji = false;
        component.showUploadFile = false;
        const detectSpy = jest.spyOn(component['cdr'], 'detectChanges');
        component.onClick();
        expect(detectSpy).not.toHaveBeenCalled();
    });

    it('onClick only hides emoji if only showEmoji is true', () => {
        component.showEmoji = true;
        component.showUploadFile = false;
        const detectSpy = jest.spyOn(component['cdr'], 'detectChanges');
        component.onClick();
        expect(component.showEmoji).toBe(false);
        expect(component.showUploadFile).toBe(false);
        expect(detectSpy).toHaveBeenCalledTimes(1);
    });

    it('onClick only hides upload file if only showUploadFile is true', () => {
        component.showEmoji = false;
        component.showUploadFile = true;
        const detectSpy = jest.spyOn(component['cdr'], 'detectChanges');
        component.onClick();
        expect(component.showEmoji).toBe(false);
        expect(component.showUploadFile).toBe(false);
        expect(detectSpy).toHaveBeenCalledTimes(1);
    });

    it('addISO should move ISO from availableISOS to selectedISOS', () => {
        component.availableISOS = [{ name: 'ISO1', mandatory: false, domesupported: false }];
        component.selectedISOS = [];
        component.buttonISOClicked = false;
        component.addISO({ name: 'ISO1', mandatory: false, domesupported: false });
        expect(component.availableISOS.length).toBe(0);
        expect(component.selectedISOS.length).toBe(1);
        expect(component.selectedISOS[0].name).toBe('ISO1');
        expect(component.buttonISOClicked).toBe(true);
    });

    it('removeISO should move ISO from selectedISOS to availableISOS', () => {
        component.selectedISOS = [{ name: 'ISO2', mandatory: false, domesupported: false }];
        component.availableISOS = [];
        component.removeISO({ name: 'ISO2', mandatory: false, domesupported: false });
        expect(component.selectedISOS.length).toBe(0);
        expect(component.availableISOS.length).toBe(1);
        expect(component.availableISOS[0].name).toBe('ISO2');
    });

    it('removeSelfAtt should remove selfAtt from finishChars', () => {
        component.finishChars = [{ name: 'SelfAtt' }, { name: 'Other' }] as any;
        component.selfAtt = { name: 'SelfAtt' };
        component.removeSelfAtt();
        expect(component.finishChars.some(f => f.name === 'SelfAtt')).toBe(false);
        expect(component.selfAtt).toBe('');
    });

    it('checkValidISOS returns true if any selectedISO has empty url', () => {
        component.selectedISOS = [{ name: 'ISO', url: '' }];
        expect(component.checkValidISOS()).toBe(true);
        component.selectedISOS = [{ name: 'ISO', url: 'abc' }];
        expect(component.checkValidISOS()).toBe(false);
    });

    it('isVerified returns true if ISO is in verifiedISO', () => {
        component.verifiedISO = ['ISO3'];
        expect(component.isVerified({ name: 'ISO3' })).toBe(true);
        expect(component.isVerified({ name: 'ISO4' })).toBe(false);
    });

    it('isProdInBundle returns true if prod is in prodSpecsBundle', () => {
        component.prodSpecsBundle = [{ id: 'x' } as any];
        expect(component.isProdInBundle({ id: 'x' })).toBe(true);
        expect(component.isProdInBundle({ id: 'y' })).toBe(false);
    });

    it('addProdToBundle toggles prod in prodSpecsBundle', () => {
        const prod = { id: 'p', href: '', lifecycleStatus: '', name: '' };
        component.prodSpecsBundle = [];
        component.addProdToBundle(prod);
        expect(component.prodSpecsBundle.length).toBe(1);
        component.addProdToBundle(prod);
        expect(component.prodSpecsBundle.length).toBe(0);
    });

    it('removeImg removes image from prodAttachments', () => {
        component.prodAttachments = [{ url: 'img1' }, { url: 'img2' }] as any;
        component.imgPreview = 'img1';
        component.showImgPreview = true;
        component.removeImg();
        expect(component.prodAttachments.some(a => a.url === 'img1')).toBe(false);
        expect(component.showImgPreview).toBe(false);
        expect(component.imgPreview).toBe('');
    });

    it('saveImgFromURL adds image to prodAttachments', () => {
        component.imgURL = { nativeElement: { value: 'http://img.url' } } as any;
        component.prodAttachments = [];
        component.attImageName.setValue('http://img.url');
        component.saveImgFromURL();
        expect(component.prodAttachments.some(a => a.url === 'http://img.url')).toBe(true);
        expect(component.showImgPreview).toBe(true);
        expect(component.imgPreview).toBe('http://img.url');
        expect(component.attImageName.value).toBeNull();
    });

    it('removeAtt removes attachment by url', () => {
        component.prodAttachments = [
            { url: 'a', name: 'Manual' },
            { url: 'b', name: 'Profile Picture' }
        ] as any;
        component.removeAtt({ url: 'a' });
        expect(component.prodAttachments.some(a => a.url === 'a')).toBe(false);
    });

    it('saveAtt adds new attachment and resets fields', () => {
        component.attachName = { nativeElement: { value: 'Doc' } } as any;
        component.attachToCreate = { url: 'url', attachmentType: 'type' } as any;
        component.prodAttachments = [];
        component.attFileName.setValue('Doc');
        component.saveAtt();
        expect(component.prodAttachments.some(a => a.name === 'Doc')).toBe(true);
        expect(component.attachName.nativeElement.value).toBe('');
        expect(component.attachToCreate.url).toBe('');
        expect(component.showNewAtt).toBe(false);
        expect(component.attFileName.value).toBeNull();
    });

    it('clearAtt resets attachToCreate', () => {
        component.attachToCreate = { url: 'abc', attachmentType: 'def' } as any;
        component.clearAtt();
        expect(component.attachToCreate.url).toBe('');
        expect(component.attachToCreate.attachmentType).toBe('');
    });

    it('saveRel adds selectedProdSpec to prodRelationships', () => {
        component.selectedProdSpec = { id: 'rel', href: 'h', name: 'n' };
        component.selectedRelType = 'migration';
        component.prodRelationships = [];
        component.saveRel();
        expect(component.prodRelationships.some(r => r.id === 'rel')).toBe(true);
        expect(component.selectedRelType).toBe('migration');
        expect(component.showCreateRel).toBe(false);
    });

    it('deleteRel removes relationship by id', () => {
        component.prodRelationships = [{ id: 'r1' }, { id: 'r2' }] as any;
        component.deleteRel({ id: 'r1' });
        expect(component.prodRelationships.some(r => r.id === 'r1')).toBe(false);
    });

    it('refreshChars resets char builder state', () => {
        component.stringValue = 'a';
        component.numberValue = 'b';
        component.numberUnit = 'c';
        component.fromValue = 'd';
        component.toValue = 'e';
        component.rangeUnit = 'f';
        component.stringCharSelected = false;
        component.numberCharSelected = true;
        component.rangeCharSelected = true;
        component.creatingChars = [{ value: 1 }] as any;
        component.refreshChars();
        expect(component.stringValue).toBe('');
        expect(component.numberValue).toBe('');
        expect(component.numberUnit).toBe('');
        expect(component.fromValue).toBe('');
        expect(component.toValue).toBe('');
        expect(component.rangeUnit).toBe('');
        expect(component.stringCharSelected).toBe(true);
        expect(component.numberCharSelected).toBe(false);
        expect(component.rangeCharSelected).toBe(false);
        expect(component.creatingChars.length).toBe(0);
    });

    it('removeCharValue removes char from creatingChars', () => {
        component.creatingChars = [{ value: 1 }, { value: 2 }] as any;
        component.removeCharValue({ value: 1 }, 0);
        expect(component.creatingChars.length).toBe(1);
        expect(component.creatingChars[0].value).toBe(2);
    });

    it('deleteChar removes char from prodChars', () => {
        component.prodChars = [{ id: 'c1' }, { id: 'c2' }] as any;
        component.deleteChar({ id: 'c1' });
        expect(component.prodChars.some(c => c.id === 'c1')).toBe(false);
    });

    it('onTypeChange sets char type flags', () => {
        component.onTypeChange({ target: { value: 'string' } });
        expect(component.stringCharSelected).toBe(true);
        expect(component.numberCharSelected).toBe(false);
        expect(component.rangeCharSelected).toBe(false);

        component.onTypeChange({ target: { value: 'number' } });
        expect(component.stringCharSelected).toBe(false);
        expect(component.numberCharSelected).toBe(true);
        expect(component.rangeCharSelected).toBe(false);

        component.onTypeChange({ target: { value: 'range' } });
        expect(component.stringCharSelected).toBe(false);
        expect(component.numberCharSelected).toBe(false);
        expect(component.rangeCharSelected).toBe(true);
    });

    it('checkInput returns true for empty/whitespace, false for non-empty', () => {
        expect(component.checkInput('')).toBe(true);
        expect(component.checkInput('   ')).toBe(true);
        expect(component.checkInput('abc')).toBe(false);
    });
});
