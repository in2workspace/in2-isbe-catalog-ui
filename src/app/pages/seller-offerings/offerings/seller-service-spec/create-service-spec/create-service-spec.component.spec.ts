import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateServiceSpecComponent } from './create-service-spec.component';

describe('CreateServiceSpecComponent', () => {
  let component: CreateServiceSpecComponent;
  let fixture: ComponentFixture<CreateServiceSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CreateServiceSpecComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateServiceSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
