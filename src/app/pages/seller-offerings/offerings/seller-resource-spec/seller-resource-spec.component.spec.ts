import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerResourceSpecComponent } from './seller-resource-spec.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SellerResourceSpecComponent', () => {
  let component: SellerResourceSpecComponent;
  let fixture: ComponentFixture<SellerResourceSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SellerResourceSpecComponent, HttpClientTestingModule, TranslateModule.forRoot() ],
})
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerResourceSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
