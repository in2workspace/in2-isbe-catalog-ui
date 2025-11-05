import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ReminderMessageComponent } from './reminder-message.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ReminderMessageComponent', () => {
  let component: ReminderMessageComponent;
  let fixture: ComponentFixture<ReminderMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ReminderMessageComponent, TranslateModule.forRoot()],
})
    .compileComponents();
    
    fixture = TestBed.createComponent(ReminderMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
