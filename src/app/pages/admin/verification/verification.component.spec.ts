import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { VerificationComponent } from './verification.component';

describe('VerificationComponent', () => {
  let component: VerificationComponent;
  let fixture: ComponentFixture<VerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, VerificationComponent]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(VerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
