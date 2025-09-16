import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { SearchCatalogComponent } from './search-catalog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SearchCatalogComponent', () => {
  let component: SearchCatalogComponent;
  let fixture: ComponentFixture<SearchCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
      ],
      imports: [SearchCatalogComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
