import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UpdateServiceSpecComponent } from './update-service-spec.component';

describe('UpdateServiceSpecComponent', () => {
  let component: UpdateServiceSpecComponent;
  let fixture: ComponentFixture<UpdateServiceSpecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [UpdateServiceSpecComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateServiceSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
