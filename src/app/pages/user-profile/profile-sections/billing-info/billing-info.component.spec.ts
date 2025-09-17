import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { BillingInfoComponent } from './billing-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BillingInfoComponent', () => {
  let component: BillingInfoComponent;
  let fixture: ComponentFixture<BillingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BillingInfoComponent, HttpClientTestingModule]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(BillingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
