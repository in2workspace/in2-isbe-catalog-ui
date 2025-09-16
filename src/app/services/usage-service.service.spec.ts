import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UsageServiceService } from './usage-service.service';

describe('UsageServiceService', () => {
  let service: UsageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(UsageServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
