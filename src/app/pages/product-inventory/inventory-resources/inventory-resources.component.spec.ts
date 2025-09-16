import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InventoryResourcesComponent } from './inventory-resources.component';

describe('InventoryResourcesComponent', () => {
  let component: InventoryResourcesComponent;
  let fixture: ComponentFixture<InventoryResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryResourcesComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
