import { TestBed } from '@angular/core/testing';

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
