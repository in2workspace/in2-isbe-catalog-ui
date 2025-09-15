import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UsageListComponent } from './usage-list.component';

describe('UsageListComponent', () => {
  let component: UsageListComponent;
  let fixture: ComponentFixture<UsageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
