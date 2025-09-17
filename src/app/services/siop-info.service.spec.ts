import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { SiopInfoService } from './siop-info.service';

describe('SiopInfoService', () => {
  let service: SiopInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(SiopInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
