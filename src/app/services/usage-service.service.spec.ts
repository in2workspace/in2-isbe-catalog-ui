import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { UsageServiceService } from './usage-service.service';

describe('UsageServiceService', () => {
  let service: UsageServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsageServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
