import { TestBed } from '@angular/core/testing';

import { Theme } from './theme';


type ThemeId = 
  | 'fluent-light-blue' 
  | 'fluent-light-saas' 
  | 'fluent-dark-blue' 
  | 'fluent-dark-saas';

describe('Theme', () => {
  let service: Theme;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Theme);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
