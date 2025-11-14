import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductDetailsComponent } from './product-details.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule } from 'ngx-markdown';
import { oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ApiServiceService } from 'src/app/services/product-service.service';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  const mockApi = {
    getProductSpecification: jest.fn(),
    getProductPrice: jest.fn(),
  };

  beforeEach(async () => {
    mockApi.getProductSpecification.mockReset();
    mockApi.getProductPrice.mockReset();

    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '123' }) } } },
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        { provide: ApiServiceService, useValue: mockApi }
      ],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), MarkdownModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default category to none and return placeholder image when productOff is empty', () => {
    component.productOff = undefined as any;
    component.ngOnInit();
    expect(component.category).toBe('none');
    expect(component.getProductImage()).toContain('placehold.co');
  });

  it('should slice categories when more than 5 and set checkMoreCats true', () => {
    component.productOff = {
      category: [{ name: 'c1' }, { name: 'c2' }, { name: 'c3' }, { name: 'c4' }, { name: 'c5' }, { name: 'c6' }]
    } as any;
    component.ngOnInit();
    expect(component.category).toBe('c1');
    expect(component.categories?.length).toBe(4);
    expect(component.categoriesMore?.length).toBe(2);
    expect(component.checkMoreCats).toBe(true);
  });

  it('should select "Profile Picture" attachment when present', () => {
    component.productOff = {
      attachment: [
        { name: 'Profile Picture', url: 'profile-url' },
        { attachmentType: 'Picture', url: 'pic-url' }
      ]
    } as any;
    component.ngOnInit();
    expect(component.images.length).toBe(1);
    expect(component.getProductImage()).toBe('profile-url');
  });

  it('should fallback to Picture attachments when no profile picture', () => {
    component.productOff = {
      attachment: [
        { attachmentType: 'Picture', url: 'pic-url' }
      ]
    } as any;
    component.ngOnInit();
    expect(component.images.length).toBe(1);
    expect(component.getProductImage()).toBe('pic-url');
  });

  it('loadMoreCategories should toggle flags appropriately', () => {
    component.productOff = {
      category: [{ name: 'c1' }, { name: 'c2' }, { name: 'c3' }, { name: 'c4' }, { name: 'c5' }, { name: 'c6' }]
    } as any;
    component.ngOnInit();
    expect(component.checkMoreCats).toBe(true);
    component.loadMoreCategories();
    expect(component.loadMoreCats).toBe(true);
    expect(component.checkMoreCats).toBe(false);
    expect(component.closeCats).toBe(true);
  });

  it('closeCategories should reset flags and slice categories, toggling loadMoreCats', () => {
    component.productOff = {
      category: [{ name: 'c1' }, { name: 'c2' }, { name: 'c3' }, { name: 'c4' }, { name: 'c5' }, { name: 'c6' }]
    } as any;
    component.ngOnInit();
    component.loadMoreCats = true;
    component.closeCategories();
    expect(component.closeCats).toBe(false);
    expect(component.checkMoreCats).toBe(true);
    expect(component.categories?.length).toBe(4);
    expect(component.loadMoreCats).toBe(false);
  });

  it('hideModal should emit close and reset flags', () => {
    let emitted = false;
    component.closeModal.subscribe(() => emitted = true);
    component.loadMoreCats = true;
    component.checkMoreCats = false;
    component.hideModal();
    expect(emitted).toBe(true);
    expect(component.loadMoreCats).toBe(false);
    expect(component.checkMoreCats).toBe(true);
  });

  it('should set checkCustom true when api price returns custom', async () => {
    component.productOff = {
      productSpecification: { id: 'spec1' },
      productOfferingPrice: [{ id: 'price1' }]
    } as any;

    mockApi.getProductSpecification.mockResolvedValue({});
    mockApi.getProductPrice.mockResolvedValue({ priceType: 'custom' });

    component.ngOnInit();
    await fixture.whenStable();

    await Promise.resolve();

    expect(mockApi.getProductSpecification).toHaveBeenCalledWith('spec1');
    expect(mockApi.getProductPrice).toHaveBeenCalledWith('price1');
    expect(component.checkCustom).toBe(true);
  });


});
