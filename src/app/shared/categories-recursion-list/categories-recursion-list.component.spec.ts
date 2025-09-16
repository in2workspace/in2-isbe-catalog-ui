import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CategoriesRecursionListComponent } from './categories-recursion-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CategoriesRecursionListComponent', () => {
  let component: CategoriesRecursionListComponent;
  let fixture: ComponentFixture<CategoriesRecursionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CategoriesRecursionListComponent, HttpClientTestingModule]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesRecursionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
