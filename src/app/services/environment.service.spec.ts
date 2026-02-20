import { TestBed } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService]
    });
    service = TestBed.inject(EnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return environment info', () => {
    const envInfo = service.getEnvironmentInfo();
    expect(envInfo).toBeDefined();
    expect(envInfo.production).toBeDefined();
    expect(envInfo.apiUrl).toBeDefined();
  });

  it('should check if is production', () => {
    const isProd = service.isProduction();
    expect(typeof isProd).toBe('boolean');
  });

  it('should check if is development', () => {
    const isDev = service.isDevelopment();
    expect(typeof isDev).toBe('boolean');
    expect(isDev).toBe(!service.isProduction());
  });

  it('should get API URL', () => {
    const apiUrl = service.getApiUrl();
    expect(apiUrl).toBeDefined();
    expect(typeof apiUrl).toBe('string');
  });

  it('should get environment label', () => {
    const label = service.getEnvironmentLabel();
    expect(label).toBeDefined();
    expect(['DEV', 'PROD'].includes(label)).toBeTruthy();
  });

  it('should build URL correctly', () => {
    const endpoint = 'users/list';
    const url = service.buildUrl(endpoint);
    expect(url).toContain('users/list');
    expect(url).toContain(service.getApiUrl());
  });

  it('should build URL with leading slash', () => {
    const endpoint = '/users/list';
    const url = service.buildUrl(endpoint);
    expect(url).toContain('users/list');
    expect(url).not.toContain('//users');
  });

  it('should get transaction API URL', () => {
    const url = service.getTransactionApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });

  it('should get currency API URL', () => {
    const url = service.getCurrencyApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });

  it('should get branch API URL', () => {
    const url = service.getBranchApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });

  it('should get currency type API URL', () => {
    const url = service.getCurrencyTypeApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });

  it('should get ST operation type API URL', () => {
    const url = service.getStOperationTypeApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });

  it('should get totale cassa API URL', () => {
    const url = service.getTotaleCassaApiUrl();
    expect(url === undefined || typeof url === 'string').toBeTruthy();
  });
});
