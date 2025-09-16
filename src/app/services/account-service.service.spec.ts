import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { AccountServiceService } from './account-service.service';

describe('AccountServiceService', () => {
  let service: AccountServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(AccountServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
