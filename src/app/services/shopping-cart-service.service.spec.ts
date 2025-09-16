import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ShoppingCartServiceService } from './shopping-cart-service.service';

describe('ShoppingCartServiceService', () => {
  let service: ShoppingCartServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    service = TestBed.inject(ShoppingCartServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
