import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { OkMessageComponent } from './ok-message.component';

describe('OkMessageComponent', () => {
  let component: OkMessageComponent;
  let fixture: ComponentFixture<OkMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OkMessageComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(OkMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
