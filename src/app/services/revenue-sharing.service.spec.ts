import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { RevenueSharingService } from './revenue-sharing.service';

describe('RevenueSharingService', () => {
  let service: RevenueSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(RevenueSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
