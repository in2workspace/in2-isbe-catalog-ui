import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { BillingAccountFormComponent } from './billing-account-form.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('BillingAccountFormComponent', () => {
  let component: BillingAccountFormComponent;
  let fixture: ComponentFixture<BillingAccountFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingAccountFormComponent, HttpClientTestingModule, TranslateModule.forRoot() ],
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
