import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CategoriesFilterComponent } from './categories-filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CategoriesFilterComponent', () => {
  let component: CategoriesFilterComponent;
  let fixture: ComponentFixture<CategoriesFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesFilterComponent, HttpClientTestingModule],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
