import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { AboutPageIsbeComponent } from './about-page-isbe.component';
import { TranslateModule } from '@ngx-translate/core';

describe('AboutPageIsbeComponent', () => {
  let component: AboutPageIsbeComponent;
  let fixture: ComponentFixture<AboutPageIsbeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageIsbeComponent,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutPageIsbeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
