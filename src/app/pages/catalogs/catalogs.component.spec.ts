import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CatalogsComponent } from './catalogs.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CatalogsComponent', () => {
  let component: CatalogsComponent;
  let fixture: ComponentFixture<CatalogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogsComponent, HttpClientTestingModule ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
