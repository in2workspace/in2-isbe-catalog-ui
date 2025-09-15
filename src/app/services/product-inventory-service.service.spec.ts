import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductInventoryServiceService } from './product-inventory-service.service';

describe('ProductInventoryServiceService', () => {
  let service: ProductInventoryServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductInventoryServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
