import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CategoriesRecursionComponent } from './categories-recursion.component';

describe('CategoriesRecursionComponent', () => {
  let component: CategoriesRecursionComponent;
  let fixture: ComponentFixture<CategoriesRecursionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CategoriesRecursionComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesRecursionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
