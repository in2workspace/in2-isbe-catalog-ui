import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { StatusSelectorComponent } from './status-selector.component';
import { TranslateModule } from '@ngx-translate/core';

describe('StatusSelectorComponent', () => {
  let component: StatusSelectorComponent;
  let fixture: ComponentFixture<StatusSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSelectorComponent, TranslateModule.forRoot()],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatusSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
