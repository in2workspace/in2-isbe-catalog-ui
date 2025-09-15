import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { AboutDomeComponent } from './about-dome.component';

describe('AboutDomeComponent', () => {
  let component: AboutDomeComponent;
  let fixture: ComponentFixture<AboutDomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutDomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutDomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
