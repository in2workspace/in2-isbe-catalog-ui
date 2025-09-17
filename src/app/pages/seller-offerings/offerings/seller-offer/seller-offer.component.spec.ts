import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerOfferComponent } from './seller-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SellerOfferComponent', () => {
  let component: SellerOfferComponent;
  let fixture: ComponentFixture<SellerOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SellerOfferComponent, HttpClientTestingModule, TranslateModule.forRoot()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
