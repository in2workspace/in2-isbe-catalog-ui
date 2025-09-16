import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CreateResourceSpecComponent } from './create-resource-spec.component';

describe('CreateResourceSpecComponent', () => {
  let component: CreateResourceSpecComponent;
  let fixture: ComponentFixture<CreateResourceSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CreateResourceSpecComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateResourceSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
