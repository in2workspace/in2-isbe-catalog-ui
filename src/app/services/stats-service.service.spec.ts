import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { StatsServiceService } from './stats-service.service';

describe('StatsServiceService', () => {
  let service: StatsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
