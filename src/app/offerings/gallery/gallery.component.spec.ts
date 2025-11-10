import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { GalleryComponent } from './gallery.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { EventMessageService } from 'src/app/services/event-message.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  const authMock = { isAuthenticated$: new BehaviorSubject<boolean>(true) };
  const cdrMock = { detectChanges: jest.fn() };
  const routeMock = { snapshot: { paramMap: { get: jest.fn(() => null) } } } as unknown as Partial<ActivatedRoute>;
  const localStorageMock = { getObject: jest.fn(() => []), setItem: jest.fn() };
  const messages$ = new Subject<any>();
  const eventMessageMock = { messages$: messages$, emitFilterShown: jest.fn(), emitFilterShownCategory: jest.fn() } as Partial<EventMessageService>;
  const paginationServiceMock = {
    getItemsPaginated: jest.fn(() =>
      Promise.resolve({
        page_check: true,
        items: [{ id: '1', name: 'p1' }],
        nextItems: [],
        page: 0
      })
    ),
    getProducts: jest.fn()
  } as Partial<PaginationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent, HttpClientTestingModule, TranslateModule.forRoot(), MarkdownModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: LocalStorageService, useValue: localStorageMock },
        { provide: EventMessageService, useValue: eventMessageMock },
        { provide: PaginationService, useValue: paginationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init via paginationService and set products', async () => {
    await fixture.whenStable();
    expect(paginationServiceMock.getItemsPaginated).toHaveBeenCalled();
    expect(component.products).toEqual([{ id: '1', name: 'p1' }]);
    expect(component.page_check).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('checkPanel should emit and persist when filters present', () => {
    (localStorageMock.getObject as jest.Mock).mockReturnValue([{ id: 'cat1' }]);
    (eventMessageMock.emitFilterShown as jest.Mock).mockClear();
    component.showPanel = false;
    component.checkPanel();
    expect(eventMessageMock.emitFilterShown).toHaveBeenCalledWith(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('is_filter_panel_shown', 'true');
  });

  it('filterSearch should set keywords and call getProducts', async () => {
    const getProductsSpy = jest.spyOn(component, 'getProducts').mockResolvedValue(undefined);
    component.searchField.setValue('search-term');
    await component.filterSearch({ preventDefault: () => {} } as any);
    expect(component.keywords).toBe('search-term');
    expect(getProductsSpy).toHaveBeenCalledWith(false);
    getProductsSpy.mockRestore();
  });

  it('filterSearch should clear keywords and call getProducts when empty', async () => {
    const getProductsSpy = jest.spyOn(component, 'getProducts').mockResolvedValue(undefined);
    component.searchField.setValue('');
    await component.filterSearch({ preventDefault: () => {} } as any);
    expect(component.keywords).toBeUndefined();
    expect(getProductsSpy).toHaveBeenCalledWith(false);
    getProductsSpy.mockRestore();
  });

  afterAll(() => {
    messages$.complete();
  });
});
