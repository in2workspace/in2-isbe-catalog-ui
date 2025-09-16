import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { InvoicesService } from './invoices-service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(InvoicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
