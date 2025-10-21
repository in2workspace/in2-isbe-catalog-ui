import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CategoriesComponent } from './categories.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';
import { Subject, of } from 'rxjs';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;

  const apiMock = {
      getCategories: jest.fn(),
      getCategoriesByParentId: jest.fn()
    };

    const messages$ = new Subject<any>();
    const eventMessageMock = {
      messages$: messages$.asObservable(),
      emitCreateCategory: jest.fn(),
      emitUpdateCategory: jest.fn()
    };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
    imports: [CategoriesComponent, HttpClientTestingModule, TranslateModule.forRoot()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call api.getCategories and build nested categories', async () => {
    const data = [
      { id: 1, parentId: null, isRoot: true, name: 'Root' },
      { id: 2, parentId: 1, isRoot: false, name: 'Child' },
      { id: 3, parentId: 2, isRoot: false, name: 'Grandchild' }
    ];
    apiMock.getCategories.mockResolvedValueOnce(data);

    component.categories = [];
    component.unformattedCategories = [];
    component.loading = true;

    await component.getCategories();
    await fixture.whenStable();

    expect(apiMock.getCategories).toHaveBeenCalled();
    expect(component.unformattedCategories.length).toBe(3);
    expect(component.categories.length).toBeGreaterThanOrEqual(1);

    const root = component.categories.find(c => c.id === 1);
    expect(root).toBeDefined();
    expect(root.children).toBeDefined();
    expect(root.children.length).toBe(1);
    expect(root.children[0].id).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('createCategory should emit create event with true', () => {
    eventMessageMock.emitCreateCategory.mockClear();
    component.createCategory();
    expect(eventMessageMock.emitCreateCategory).toHaveBeenCalledWith(true);
  });

  it('goToUpdate should emit update event passing category', () => {
    const cat = { id: 7, name: 'Test' };
    eventMessageMock.emitUpdateCategory.mockClear();
    component.goToUpdate(cat);
    expect(eventMessageMock.emitUpdateCategory).toHaveBeenCalledWith(cat);
  });

  it('onStateFilterChange toggles status and calls getCategories', () => {
    const spy = jest.spyOn(component, 'getCategories').mockImplementation(() => {});
    expect(component.status).toEqual([]);

    component.onStateFilterChange('ACTIVE');
    expect(component.status).toContain('ACTIVE');
    expect(spy).toHaveBeenCalledTimes(1);

    component.onStateFilterChange('ACTIVE');
    expect(component.status).not.toContain('ACTIVE');
    expect(spy).toHaveBeenCalledTimes(2);

    spy.mockRestore();
  });

  it('responds to ChangedSession message by calling initCatalogs', () => {
    const initSpy = jest.spyOn(component, 'initCatalogs').mockImplementation(() => {});
    messages$.next({ type: 'ChangedSession' });
    expect(initSpy).toHaveBeenCalled();
    initSpy.mockRestore();
  });
});
