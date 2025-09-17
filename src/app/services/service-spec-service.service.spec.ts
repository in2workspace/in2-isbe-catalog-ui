import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ServiceSpecServiceService } from './service-spec-service.service';

describe('ServiceSpecServiceService', () => {
  let service: ServiceSpecServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(ServiceSpecServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
