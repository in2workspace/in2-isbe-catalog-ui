import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InventoryServicesComponent } from './inventory-services.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('InventoryServicesComponent', () => {
  let component: InventoryServicesComponent;
  let fixture: ComponentFixture<InventoryServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [InventoryServicesComponent, HttpClientTestingModule, TranslateModule.forRoot()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(InventoryServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
