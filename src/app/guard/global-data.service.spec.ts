import { TestBed } from '@angular/core/testing';
import { GlobalDataService } from './global-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { afterEach } from 'node:test';

describe('GlobalDataService', () => {
  let service: GlobalDataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GlobalDataService],
    });
    service = TestBed.inject(GlobalDataService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear(); 
  });

  afterEach(() => {
    httpTestingController.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should retrieve the token from localStorage on init', () => {
    service.setToken('test-token');
      expect(service.getTokenValue()).toBe('test-token');
    });

    it('should set and retrieve the token using BehaviorSubject', () => {
      service.setToken('new-token');
      service.getToken().subscribe((token) => {
        expect(token).toBe('new-token');
      });
    });

    it('should clear the token and update BehaviorSubject', () => {
      service.setToken('new-token');
      service.clearToken();
      service.getToken().subscribe((token) => {
        expect(token).toBe('');
      });
      expect(localStorage.getItem('userToken')).toBeNull();
    });

    it('should get the current token value', () => {
      service.setToken('test-token');
      expect(service.getTokenValue()).toBe('test-token');
    });

    it('should check if the token is valid using HTTP', () => {
      service.isTokenValid().subscribe();
      const req = httpTestingController.expectOne(service.apiBaseUrl + '/init_config.js');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('No Header No Footer and No Home', () => {
    it('should set and get NoHeaderNoFooter value', () => {
      service.setNoHeaderNoFooter(true);
      service.getNoHeaderNoFooter().subscribe((value) => {
        expect(value).toBe(true);
      });
    });

    it('should set and get NoHome value', () => {
      service.setNoHome(true);
      service.getNoHome().subscribe((value) => {
        expect(value).toBe(true);
      });
    });
  });
});
