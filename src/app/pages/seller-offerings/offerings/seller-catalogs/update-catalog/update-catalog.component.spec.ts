import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UpdateCatalogComponent } from './update-catalog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UpdateCatalogComponent', () => {
  let component: UpdateCatalogComponent;
  let fixture: ComponentFixture<UpdateCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UpdateCatalogComponent, HttpClientTestingModule]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
