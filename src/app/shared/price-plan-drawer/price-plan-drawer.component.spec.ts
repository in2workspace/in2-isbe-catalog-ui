import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PricePlanDrawerComponent } from './price-plan-drawer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PricePlanDrawerComponent', () => {
  let component: PricePlanDrawerComponent;
  let fixture: ComponentFixture<PricePlanDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricePlanDrawerComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PricePlanDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
