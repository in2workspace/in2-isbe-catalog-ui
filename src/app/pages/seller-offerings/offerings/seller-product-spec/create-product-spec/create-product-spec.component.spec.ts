import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { CreateProductSpecComponent } from './create-product-spec.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CreateProductSpecComponent', () => {
  let component: CreateProductSpecComponent;
  let fixture: ComponentFixture<CreateProductSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateProductSpecComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        FormsModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProductSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values for generalForm fields', () => {
    expect(component.generalForm.value.name).toBe('');
    expect(component.generalForm.value.brand).toBe('');
    expect(component.generalForm.value.version).toBe('0.1');
    expect(component.generalForm.value.number).toBe('');
    expect(component.generalForm.value.description).toBe('');
  });

  it('should validate required fields in generalForm', () => {
    component.generalForm.controls['name'].setValue('');
    component.generalForm.controls['brand'].setValue('');
    expect(component.generalForm.valid).toBe(false);

    component.generalForm.controls['name'].setValue('Product 1');
    component.generalForm.controls['brand'].setValue('Brand X');
    expect(component.generalForm.valid).toBe(true);
  });

  it('should toggleGeneral sets the correct flags', () => {
    component.toggleGeneral();
    expect(component.showGeneral).toBe(true);
    expect(component.showBundle).toBe(false);
  });

  it('should toggleBundle sets the correct flags', () => {
    component.toggleBundle();
    expect(component.showBundle).toBe(true);
    expect(component.showGeneral).toBe(false);
  });

  it('should toggleCompliance sets the correct flags', () => {
    component.toggleCompliance();
    expect(component.showCompliance).toBe(true);
  });

  it('should toggleChars sets the correct flags', () => {
    component.toggleChars();
    expect(component.showChars).toBe(true);
    expect(component.stringCharSelected).toBe(true);
  });

  it('should toggleAttach sets the correct flags', () => {
    component.toggleAttach();
    expect(component.showAttach).toBe(true);
  });

  it('should toggleRelationship sets the correct flags', () => {
    component.toggleRelationship();
    expect(component.showRelationships).toBe(true);
  });

  it('should addCharValue for string type', () => {
    component.stringValue = 'Test';
    component.addCharValue();
    expect(component.creatingChars.length).toBe(1);
    expect(component.creatingChars[0].value).toBe('Test');
  });

  it('should saveChar and reset form', () => {
    component.charsForm.controls['name'].setValue('Char 1');
    component.stringValue = 'Val1';
    component.addCharValue();
    component.saveChar();
    expect(component.prodChars.length).toBe(1);
    expect(component.creatingChars.length).toBe(0);
  });

  it('should checkInput returns true for whitespace', () => {
    expect(component.checkInput('   ')).toBe(true);
    expect(component.checkInput('abc')).toBe(false);
  });

  it('should validate filename correctly', () => {
    expect(component.isValidFilename('file_123.txt')).toBe(true);
    expect(component.isValidFilename('file@123.txt')).toBe(false);
  });

  it('should showFinish sets summary flags and productSpecToCreate', () => {
    component.generalForm.controls['name'].setValue('Prod');
    component.generalForm.controls['version'].setValue('1.0');
    component.generalForm.controls['brand'].setValue('BrandX');
    component.showFinish();
    expect(component.showSummary).toBe(true);
    expect(component.productSpecToCreate?.name).toBe('Prod');
  });

  it('should add and remove product from bundle', () => {
    const prod = { id: '1', href: 'href1', lifecycleStatus: 'Active', name: 'Prod1' };
    component.prodSpecsBundle = [];
    component.addProdToBundle(prod);
    expect(component.prodSpecsBundle.length).toBe(1);
    expect(component.isProdInBundle(prod)).toBe(true);
    component.addProdToBundle(prod);
    expect(component.prodSpecsBundle.length).toBe(0);
    expect(component.isProdInBundle(prod)).toBe(false);
  });

  it('should add and remove ISO', () => {
    const iso = { name: 'ISO1', mandatory: true, domesupported: false };
    component.availableISOS = [iso];
    component.selectedISOS = [];
    component.addISO(iso);
    expect(component.selectedISOS.length).toBe(1);
    expect(component.availableISOS.length).toBe(0);
    component.removeISO(iso);
    expect(component.selectedISOS.length).toBe(0);
    expect(component.availableISOS.length).toBe(1);
  });

  it('should checkValidISOS returns true if any ISO url is empty', () => {
    component.selectedISOS = [{ name: 'ISO1', url: '', mandatory: true, domesupported: false }];
    expect(component.checkValidISOS()).toBe(true);
    component.selectedISOS = [{ name: 'ISO1', url: 'http://url', mandatory: true, domesupported: false }];
    expect(component.checkValidISOS()).toBe(false);
  });

  it('should removeSelfAtt from finishChars', () => {
    component.finishChars = [{ name: 'SelfAtt' }];
    component.selfAtt = { name: 'SelfAtt' };
    component.removeSelfAtt();
    expect(component.finishChars.length).toBe(0);
    expect(component.selfAtt).toBe('');
  });

  it('should removeAtt and handle Profile Picture', () => {
    const att = { url: 'img1', name: 'Profile Picture' };
    component.prodAttachments = [att];
    component.imgPreview = 'img1';
    component.showImgPreview = true;
    component.removeAtt(att);
    expect(component.prodAttachments.length).toBe(0);
    expect(component.showImgPreview).toBe(false);
    expect(component.imgPreview).toBe('');
  });

  it('should saveAtt and clear fields', () => {
    component.attachName = { nativeElement: { value: 'file1', reset: () => {} } } as any;
    component.attachToCreate = { url: 'url1', attachmentType: 'type1' };
    component.prodAttachments = [];
    component.attFileName.setValue('file1');
    component.saveAtt();
    expect(component.prodAttachments.length).toBe(1);
    expect(component.attachToCreate.url).toBe('');
    expect(component.attachToCreate.attachmentType).toBe('');
    expect(component.showNewAtt).toBe(false);
    expect(component.attFileName.value).toBe(null);
  });

  it('should clearAtt reset attachToCreate', () => {
    component.attachToCreate = { url: 'url1', attachmentType: 'type1' };
    component.clearAtt();
    expect(component.attachToCreate.url).toBe('');
    expect(component.attachToCreate.attachmentType).toBe('');
  });

  it('should add and delete characteristic', () => {
    const char = { id: 'char1', name: 'Char1', productSpecCharacteristicValue: [] };
    component.prodChars = [];
    component.prodChars.push(char);
    component.deleteChar(char);
    expect(component.prodChars.length).toBe(0);
  });

  it('should add and delete relationship', () => {
    const rel = { id: 'rel1', href: 'href', relationshipType: 'migration', name: 'Rel1' };
    component.prodRelationships = [rel];
    component.deleteRel(rel);
    expect(component.prodRelationships.length).toBe(0);
  });

  it('should selectRelationship sets selectedProdSpec', () => {
    const rel = { id: 'rel1', href: 'href', name: 'Rel1' };
    component.selectRelationship(rel);
    expect(component.selectedProdSpec).toBe(rel);
  });

  it('should onTypeChange set correct flags', () => {
    component.onTypeChange({ target: { value: 'string' } });
    expect(component.stringCharSelected).toBe(true);
    component.onTypeChange({ target: { value: 'number' } });
    expect(component.numberCharSelected).toBe(true);
    component.onTypeChange({ target: { value: 'range' } });
    expect(component.rangeCharSelected).toBe(true);
  });

  it('should addCharValue for number type', () => {
    component.stringCharSelected = false;
    component.numberCharSelected = true;
    component.rangeCharSelected = false;
    component.numberValue = '42';
    component.numberUnit = 'kg';
    component.creatingChars = [];
    component.addCharValue();
    expect(component.creatingChars.length).toBe(1);
    expect(component.creatingChars[0].value).toBe('42');
    expect(component.creatingChars[0].unitOfMeasure).toBe('kg');
  });

  it('should addCharValue for range type', () => {
    component.stringCharSelected = false;
    component.numberCharSelected = false;
    component.rangeCharSelected = true;
    component.fromValue = '1';
    component.toValue = '10';
    component.rangeUnit = 'm';
    component.creatingChars = [];
    component.addCharValue();
    expect(component.creatingChars.length).toBe(1);
    expect(component.creatingChars[0].valueFrom).toBe('1');
    expect(component.creatingChars[0].valueTo).toBe('10');
    expect(component.creatingChars[0].unitOfMeasure).toBe('m');
  });

  it('should checkInput returns false for non-whitespace', () => {
    expect(component.checkInput('abc')).toBe(false);
  });

  it('should isValidFilename return false for invalid name', () => {
    expect(component.isValidFilename('file@name.txt')).toBe(false);
  });

  it('should call goBack and emit event', () => {
    const spy = jest.spyOn(component['eventMessage'], 'emitSellerProductSpec');
    component.goBack();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should togglePreview sets description from generalForm', () => {
    component.generalForm.controls['description'].setValue('desc');
    component.togglePreview();
    expect(component.description).toBe('desc');
    component.generalForm.controls['description'].setValue('');
    component.togglePreview();
    expect(component.description).toBe('');
  });

  it('should toggleBundleCheck enable and disable bundle', async () => {
    component.bundleChecked = false;
    component.prodSpecs = [1, 2];
    const getProdSpecsSpy = jest.spyOn(component, 'getProdSpecs').mockImplementation(async () => {});
    component.toggleBundleCheck();
    expect(component.bundleChecked).toBe(true);
    expect(getProdSpecsSpy).toHaveBeenCalledWith(false);

    component.bundleChecked = true;
    component.prodSpecsBundle = [{ id: '1' }];
    component.toggleBundleCheck();
    expect(component.bundleChecked).toBe(false);
    expect(component.prodSpecsBundle.length).toBe(0);
  });

  it('should isProdInBundle return correct boolean', () => {
    const prod = { id: '1' };
    component.prodSpecsBundle = [{ id: '1' }];
    expect(component.isProdInBundle(prod)).toBe(true);
    component.prodSpecsBundle = [];
    expect(component.isProdInBundle(prod)).toBe(false);
  });

  it('should addISO and removeISO update arrays', () => {
    const iso = { name: 'ISO2', mandatory: false, domesupported: true };
    component.availableISOS = [iso];
    component.selectedISOS = [];
    component.addISO(iso);
    expect(component.selectedISOS[0].name).toBe('ISO2');
    component.removeISO(iso);
    expect(component.availableISOS[0].name).toBe('ISO2');
  });

  it('should selectDefaultChar set only one default', () => {
    component.creatingChars = [
      { isDefault: false, value: {} },
      { isDefault: true, value: {} }
    ];
    component.selectDefaultChar(component.creatingChars[0], 0);
    expect(component.creatingChars[0].isDefault).toBe(true);
    expect(component.creatingChars[1].isDefault).toBe(false);
  });

  it('should refreshChars reset char fields', () => {
    component.stringValue = 'x';
    component.numberValue = 'y';
    component.numberUnit = 'z';
    component.fromValue = 'a';
    component.toValue = 'b';
    component.rangeUnit = 'c';
    component.stringCharSelected = false;
    component.numberCharSelected = true;
    component.rangeCharSelected = true;
    component.creatingChars = [{ value: {} }];
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

  it('should removeClass remove class from element', () => {
    const elem = { className: 'foo bar' } as any;
    component.removeClass(elem, 'bar');
    expect(elem.className.includes('bar')).toBe(false);
  });

  it('should addClass add class to element', () => {
    const elem = { className: 'foo' } as any;
    component.addClass(elem, 'bar');
    expect(elem.className.includes('bar')).toBe(true);
  });

  it('should unselectMenu remove class if present', () => {
    const elem = { className: 'foo bar', classNameMatch: true } as any;
    component.unselectMenu(elem, 'bar');
    expect(elem.className.includes('bar')).toBe(false);
  });

  it('should selectMenu add class if not present', () => {
    const elem = { className: 'foo' } as any;
    component.selectMenu(elem, 'bar');
    expect(elem.className.includes('bar')).toBe(true);
  });

  it('should selectStep update stepsElements and stepsCircles', () => {
    document.body.innerHTML = `
      <div id="general-info" class="text-gray-500"></div>
      <div id="general-circle" class="border-gray-400"></div>
    `;
    component.stepsElements = ['general-info', 'bundle'];
    component.stepsCircles = ['general-circle', 'bundle-circle'];
    component.selectStep('general-info', 'general-circle');
    expect(component.stepsElements.includes('general-info')).toBe(true);
    expect(component.stepsCircles.includes('general-circle')).toBe(true);
  });

  it('should clearAtt reset attachToCreate', () => {
    component.attachToCreate = { url: 'abc', attachmentType: 'xyz' };
    component.clearAtt();
    expect(component.attachToCreate.url).toBe('');
    expect(component.attachToCreate.attachmentType).toBe('');
  });

  it('should saveImgFromURL push image and reset', () => {
    component.imgURL = { nativeElement: { value: 'http://img.com/img.jpg' } } as any;
    component.prodAttachments = [];
    component.attImageName.setValue('img.jpg');
    component.saveImgFromURL();
    expect(component.prodAttachments.length).toBe(1);
    expect(component.showImgPreview).toBe(true);
    expect(component.imgPreview).toBe('http://img.com/img.jpg');
    expect(component.attImageName.value).toBe(null);
  });

  it('should removeImg remove image preview', () => {
    component.prodAttachments = [{ url: 'img1', name: 'Profile Picture' }];
    component.imgPreview = 'img1';
    component.showImgPreview = true;
    component.removeImg();
    expect(component.prodAttachments.length).toBe(0);
    expect(component.imgPreview).toBe('');
    expect(component.showImgPreview).toBe(false);
  });

  it('should saveRel add relationship and reset selectedRelType', () => {
    component.selectedProdSpec = { id: 'rel2', href: 'href2', name: 'Rel2' };
    component.selectedRelType = 'migration';
    component.prodRelationships = [];
    component.saveRel();
    expect(component.prodRelationships.length).toBe(1);
    expect(component.selectedRelType).toBe('migration');
  });

  it('should onRelChange update selectedRelType', () => {
    component.selectedRelType = '';
    component.onRelChange({ target: { value: 'replacement' } });
    expect(component.selectedRelType).toBe('replacement');
  });

  it('should checkInput return true for empty string', () => {
    expect(component.checkInput('')).toBe(true);
  });

  it('should dropped handle files', () => {
    const file = new File([''], 'filename.txt');
    const fileEntry = {
      isFile: true,
      file: (cb: any) => cb(file)
    } as any;
    const droppedFile = { fileEntry } as any;
    component.dropped([droppedFile], null);
    expect(component.files.length).toBe(1);
  });

  it('should fileOver and fileLeave log events', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    component.fileOver('event');
    component.fileLeave('event');
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('should toggleUploadSelfAtt and toggleUploadFile set flags', () => {
    component.showUploadFile = false;
    component.showUploadAtt = false;
    component.toggleUploadSelfAtt();
    expect(component.showUploadFile).toBe(true);
    expect(component.showUploadAtt).toBe(true);

    component.showUploadFile = false;
    component.selectedISO = null;
    component.toggleUploadFile('sel');
    expect(component.showUploadFile).toBe(true);
    expect(component.selectedISO).toBe('sel');
  });

  it('should uploadFile log uploading', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    component.uploadFile();
    expect(logSpy).toHaveBeenCalledWith('uploading...');
    logSpy.mockRestore();
  });

  it('should initPartyInfo set partyId from localStorage', () => {
    const loginInfo = {
      expire: Math.floor(Date.now() / 1000) + 10,
      logged_as: '1',
      id: '1',
      partyId: 'party1',
      organizations: []
    };
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(loginInfo);
    component.initPartyInfo();
    expect(component.partyId).toBe('party1');
  });

  it('should initPartyInfo set partyId from organizations', () => {
    const loginInfo = {
      expire: Math.floor(Date.now() / 1000) + 10,
      logged_as: '2',
      id: '1',
      organizations: [{ id: '2', partyId: 'party2' }]
    };
    jest.spyOn(component['localStorage'], 'getObject').mockReturnValue(loginInfo);
    component.initPartyInfo();
    expect(component.partyId).toBe('party2');
  });
  
});
