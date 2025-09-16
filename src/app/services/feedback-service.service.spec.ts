import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { FeedbackServiceService } from './feedback-service.service';

describe('FeedbackServiceService', () => {
  let service: FeedbackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(FeedbackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
