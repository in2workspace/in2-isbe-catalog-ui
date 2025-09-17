import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InventoryProductsComponent } from './inventory-products.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('InventoryProductsComponent', () => {
  let component: InventoryProductsComponent;
  let fixture: ComponentFixture<InventoryProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryProductsComponent, HttpClientTestingModule, TranslateModule.forRoot() ],
})
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
