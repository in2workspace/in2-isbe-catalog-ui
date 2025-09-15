import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { AttachmentServiceService } from './attachment-service.service';

describe('AttachmentServiceService', () => {
  let service: AttachmentServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttachmentServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
