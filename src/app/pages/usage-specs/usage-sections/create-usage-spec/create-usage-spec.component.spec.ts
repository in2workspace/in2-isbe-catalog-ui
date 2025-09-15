import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateUsageSpecComponent } from './create-usage-spec.component';

describe('CreateUsageSpecComponent', () => {
  let component: CreateUsageSpecComponent;
  let fixture: ComponentFixture<CreateUsageSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUsageSpecComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateUsageSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
