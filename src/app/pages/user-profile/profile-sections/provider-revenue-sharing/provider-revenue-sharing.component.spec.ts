import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProviderRevenueSharingComponent } from './provider-revenue-sharing.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProviderRevenueSharingComponent', () => {
  let component: ProviderRevenueSharingComponent;
  let fixture: ComponentFixture<ProviderRevenueSharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderRevenueSharingComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderRevenueSharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
