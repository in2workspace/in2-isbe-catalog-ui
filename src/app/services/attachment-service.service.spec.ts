import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { AttachmentServiceService } from './attachment-service.service';

describe('AttachmentServiceService', () => {
  let service: AttachmentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(AttachmentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
