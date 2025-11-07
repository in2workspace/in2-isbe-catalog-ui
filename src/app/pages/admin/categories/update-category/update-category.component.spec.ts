import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';
import { UpdateCategoryComponent } from './update-category.component';
import { of, Subject } from 'rxjs';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { EventMessageService } from 'src/app/services/event-message.service';
import { AuthService } from 'src/app/guard/auth.service';


describe('UpdateCategoryComponent', () => {
  let component: UpdateCategoryComponent;
  let fixture: ComponentFixture<UpdateCategoryComponent>;

  const apiMock = {
    getLaunchedCategories: jest.fn().mockResolvedValue([]),
    getCategoriesByParentId: jest.fn().mockResolvedValue([]),
    updateCategory: jest.fn().mockReturnValue(of({})),
  };

  const eventMock = {
    messages$: new Subject<any>(),
    emitAdminCategories: jest.fn()
  };

  const authMock = {
    sellerId$: of('seller-1'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        { provide: ApiServiceService, useValue: apiMock },
        { provide: EventMessageService, useValue: eventMock },
        { provide: AuthService, useValue: authMock },
      ],
      imports: [UpdateCategoryComponent, HttpClientTestingModule, TranslateModule.forRoot()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UpdateCategoryComponent);
    component = fixture.componentInstance;

    component.category = {
      id: 'cat-1',
      name: 'Category 1',
      description: 'desc',
      lifecycleStatus: 'Launched',
      isRoot: true,
      version: '1.0',
      parentId: undefined
    };

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('incrementVersion increments major and resets minor', () => {
    expect(component.incrementVersion('1.2')).toBe('2.0');
    expect(component.incrementVersion('0.0')).toBe('1.0');
    expect(component.incrementVersion('10.5')).toBe('11.0');
  });

  it('toggleParent flips isParent and parentSelectionCheck', () => {
    const initialIsParent = component.isParent;
    const initialParentSelection = component.parentSelectionCheck;
    component.toggleParent();
    expect(component.isParent).toBe(!initialIsParent);
    expect(component.parentSelectionCheck).toBe(!initialParentSelection);
  });

  it('addCategory selects a category when none selected and toggles off when same added again', () => {
    const cat = { id: 'c1', name: 'C1' };
    component.selectedCategory = undefined;
    component.selected = [];

    component.addCategory(cat);
    expect(component.selectedCategory).toEqual(cat);
    expect(Array.isArray(component.selected)).toBe(true);
    expect(component.selected.length).toBe(1);
    expect(component.selected[0]).toEqual(cat);

    component.addCategory(cat);
    expect(component.selectedCategory).toBeUndefined();
    expect(component.selected.length).toBe(0);
  });

  it('isCategorySelected returns true only for the selected category', () => {
    const catA = { id: 'a', name: 'A' };
    const catB = { id: 'b', name: 'B' };
    component.selectedCategory = catA;
    expect(component.isCategorySelected(catA)).toBe(true);
    expect(component.isCategorySelected(catB)).toBe(false);

    component.selectedCategory = undefined;
    expect(component.isCategorySelected(catA)).toBe(false);
  });

  it('isCatValid returns true when form invalid, and respects edited/status conditions', () => {
    
    component.generalForm.controls['name'].setValue('');
    component.edited = false;
    component.catStatusDraft = 'Active';
    expect(component.generalForm.valid).toBe(false);
    expect(component.isCatValid()).toBe(true);
    component.generalForm.controls['name'].setValue('Valid Name');
    component.edited = true;
    component.catStatusDraft = 'Launched';
    expect(component.generalForm.valid).toBe(true);
    expect(component.isCatValid()).toBe(true);

    component.edited = false;
    component.catStatusDraft = 'Active';
    expect(component.isCatValid()).toBe(false);
  });
});
