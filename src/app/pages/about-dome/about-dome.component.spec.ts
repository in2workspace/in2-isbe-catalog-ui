import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { AboutDomeComponent } from './about-dome.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AboutDomeComponent', () => {
  let component: AboutDomeComponent;
  let fixture: ComponentFixture<AboutDomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutDomeComponent,TranslateModule.forRoot()]
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
