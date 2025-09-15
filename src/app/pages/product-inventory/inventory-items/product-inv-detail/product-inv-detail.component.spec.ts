import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductInvDetailComponent } from './product-inv-detail.component';

describe('ProductInvDetailComponent', () => {
  let component: ProductInvDetailComponent;
  let fixture: ComponentFixture<ProductInvDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductInvDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductInvDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
