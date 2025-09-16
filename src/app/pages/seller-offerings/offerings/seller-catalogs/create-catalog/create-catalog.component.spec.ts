import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateCatalogComponent } from './create-catalog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateCatalogComponent', () => {
  let component: CreateCatalogComponent;
  let fixture: ComponentFixture<CreateCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CreateCatalogComponent,HttpClientTestingModule]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
