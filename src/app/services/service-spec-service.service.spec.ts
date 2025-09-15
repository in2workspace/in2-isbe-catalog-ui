import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ServiceSpecServiceService } from './service-spec-service.service';

describe('ServiceSpecServiceService', () => {
  let service: ServiceSpecServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceSpecServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
