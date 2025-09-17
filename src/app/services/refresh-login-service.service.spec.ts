import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { RefreshLoginServiceService } from './refresh-login-service.service';

describe('RefreshLoginServiceService', () => {
  let service: RefreshLoginServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(RefreshLoginServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
