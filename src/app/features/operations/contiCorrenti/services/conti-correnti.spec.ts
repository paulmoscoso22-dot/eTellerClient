import { TestBed } from '@angular/core/testing';

import { ContiCorrenti } from './conti-correnti';

describe('ContiCorrenti', () => {
  let service: ContiCorrenti;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContiCorrenti);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
