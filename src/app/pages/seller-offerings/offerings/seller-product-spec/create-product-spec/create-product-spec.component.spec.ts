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
});
