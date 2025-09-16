import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SellerServiceSpecComponent } from './seller-service-spec.component';

describe('SellerServiceSpecComponent', () => {
  let component: SellerServiceSpecComponent;
  let fixture: ComponentFixture<SellerServiceSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SellerServiceSpecComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerServiceSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
