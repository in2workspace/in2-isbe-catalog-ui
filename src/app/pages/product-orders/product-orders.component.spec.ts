import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductOrdersComponent } from './product-orders.component';

describe('ProductOrdersComponent', () => {
  let component: ProductOrdersComponent;
  let fixture: ComponentFixture<ProductOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
