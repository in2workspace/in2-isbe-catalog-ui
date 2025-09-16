import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProcurementModeComponent } from './procurement-mode.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ProcurementModeComponent', () => {
  let component: ProcurementModeComponent;
  let fixture: ComponentFixture<ProcurementModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementModeComponent, TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcurementModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
