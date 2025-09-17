import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { OrgInfoComponent } from './org-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OrgInfoComponent', () => {
  let component: OrgInfoComponent;
  let fixture: ComponentFixture<OrgInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgInfoComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrgInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
