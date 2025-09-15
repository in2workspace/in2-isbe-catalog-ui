import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { BillingAccountFormComponent } from './billing-account-form.component';

describe('BillingAccountFormComponent', () => {
  let component: BillingAccountFormComponent;
  let fixture: ComponentFixture<BillingAccountFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingAccountFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingAccountFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
