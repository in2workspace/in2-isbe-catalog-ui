import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PriceComponentsTableComponent } from './price-components-table.component';

describe('PriceComponentsTableComponent', () => {
  let component: PriceComponentsTableComponent;
  let fixture: ComponentFixture<PriceComponentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceComponentsTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriceComponentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
