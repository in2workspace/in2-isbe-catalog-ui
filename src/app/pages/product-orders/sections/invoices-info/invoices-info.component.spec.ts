import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InvoicesInfoComponent } from './invoices-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('InvoiceInfoComponent', () => {
  let component: InvoicesInfoComponent;
  let fixture: ComponentFixture<InvoicesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesInfoComponent, HttpClientTestingModule, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
