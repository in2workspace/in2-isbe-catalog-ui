import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PlatformBenefitsComponent } from './platform-benefits.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PlatformBenefitsComponent', () => {
  let component: PlatformBenefitsComponent;
  let fixture: ComponentFixture<PlatformBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformBenefitsComponent, TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatformBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
