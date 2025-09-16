import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { MultipleSelectComponent } from './multiple-select.component';

describe('MultipleSelectComponent', () => {
  let component: MultipleSelectComponent;
  let fixture: ComponentFixture<MultipleSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultipleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
