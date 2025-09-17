import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProdSpecComponent } from './prod-spec.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProdSpecComponent', () => {
  let component: ProdSpecComponent;
  let fixture: ComponentFixture<ProdSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdSpecComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProdSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
