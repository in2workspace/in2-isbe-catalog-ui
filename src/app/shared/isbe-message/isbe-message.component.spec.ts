import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { IsbeMessageComponent } from './isbe-message.component';
import { TranslateModule } from '@ngx-translate/core';

describe('IsbeMessageComponent', () => {
  let component: IsbeMessageComponent;
  let fixture: ComponentFixture<IsbeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [IsbeMessageComponent, TranslateModule.forRoot()],
})
    .compileComponents();
    
    fixture = TestBed.createComponent(IsbeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
