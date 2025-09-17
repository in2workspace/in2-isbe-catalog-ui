import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InventoryResourcesComponent } from './inventory-resources.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('InventoryResourcesComponent', () => {
  let component: InventoryResourcesComponent;
  let fixture: ComponentFixture<InventoryResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryResourcesComponent, HttpClientTestingModule, TranslateModule.forRoot()]
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
