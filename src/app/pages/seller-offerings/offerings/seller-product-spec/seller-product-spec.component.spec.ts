import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerProductSpecComponent } from './seller-product-spec.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SellerProductSpecComponent', () => {
  let component: SellerProductSpecComponent;
  let fixture: ComponentFixture<SellerProductSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerProductSpecComponent, TranslateModule.forRoot(), HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerProductSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
