import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductInvDetailComponent } from './product-inv-detail.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductInvDetailComponent', () => {
  let component: ProductInvDetailComponent;
  let fixture: ComponentFixture<ProductInvDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } }
    ],
    imports: [ProductInvDetailComponent, HttpClientTestingModule]
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
