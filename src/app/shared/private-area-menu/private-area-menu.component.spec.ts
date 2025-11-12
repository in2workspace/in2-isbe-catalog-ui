import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PrivateAreaMenuComponent } from './private-area-menu.component';

describe('PrivateAreaMenuComponent', () => {
  let component: PrivateAreaMenuComponent;
  let fixture: ComponentFixture<PrivateAreaMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateAreaMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateAreaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
