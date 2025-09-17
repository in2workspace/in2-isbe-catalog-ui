import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { TranslateModule } from '@ngx-translate/core';

import { CategoriesPanelComponent } from './categories-panel.component';

describe('CategoriesPanelComponent', () => {
  let component: CategoriesPanelComponent;
  let fixture: ComponentFixture<CategoriesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesPanelComponent,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoriesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
