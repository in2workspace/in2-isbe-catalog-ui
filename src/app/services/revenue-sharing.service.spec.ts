import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { RevenueSharingService } from './revenue-sharing.service';

describe('RevenueSharingService', () => {
  let service: RevenueSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevenueSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
