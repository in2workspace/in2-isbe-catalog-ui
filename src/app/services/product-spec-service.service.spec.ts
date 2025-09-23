import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProductSpecServiceService } from './product-spec-service.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';


describe('ProductSpecServiceService', () => {
  let service: ProductSpecServiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ProductSpecServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getProdSpecByUser with correct URL and params', async () => {
    const page = 1;
    const status = ['ACTIVE', 'INACTIVE'];
    const seller = '123';
    const sort = 'name';
    const isBundle = true;
    const expectedUrl = `${environment.BASE_URL}${environment.PRODUCT_SPEC}?limit=${environment.PROD_SPEC_LIMIT}&offset=${page}&seller=${seller}&sort=${sort}&isBundle=${isBundle}&lifecycleStatus=ACTIVE,INACTIVE`;

    const promise = service.getProdSpecByUser(page, status, seller, sort, isBundle);
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
    await expect(promise).resolves.toEqual({ data: [] });
  });

  it('should call getProdSpecByUser without optional params', async () => {
    const page = 0;
    const status: string[] = [];
    const seller = '456';
    const expectedUrl = `${environment.BASE_URL}${environment.PRODUCT_SPEC}?limit=${environment.PROD_SPEC_LIMIT}&offset=${page}&seller=${seller}`;

    const promise = service.getProdSpecByUser(page, status, seller);
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({});
    await expect(promise).resolves.toEqual({});
  });

  it('should call getResSpecById with correct URL', async () => {
    const id = 'abc';
    const expectedUrl = `${environment.BASE_URL}${environment.PRODUCT_SPEC}/${id}`;

    const promise = service.getResSpecById(id);
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ id });
    await expect(promise).resolves.toEqual({ id });
  });

  it('should call postProdSpec with correct URL and body', () => {
    const body = { name: 'test' };
    const expectedUrl = `${environment.BASE_URL}${environment.PRODUCT_SPEC}`;

    service.postProdSpec(body).subscribe(response => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true });
  });

  it('should call updateProdSpec with correct URL and body', () => {
    const body = { name: 'updated' };
    const id = '789';
    const expectedUrl = `${environment.BASE_URL}${environment.PRODUCT_SPEC}/${id}`;

    service.updateProdSpec(body, id).subscribe(response => {
      expect(response).toEqual({ updated: true });
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({ updated: true });
  });
});
