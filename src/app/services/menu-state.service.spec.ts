import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { MenuStateService } from './menu-state.service';

describe('MenuStateService', () => {
  let service: MenuStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
