import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { QrVerifierService } from './qr-verifier.service';

describe('QrVerifierService', () => {
  let service: QrVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
