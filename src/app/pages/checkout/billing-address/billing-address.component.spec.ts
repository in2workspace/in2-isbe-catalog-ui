import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { BillingAddressComponent } from './billing-address.component';

describe('BillingAddressComponent', () => {
  let component: BillingAddressComponent;
  let fixture: ComponentFixture<BillingAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingAddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
