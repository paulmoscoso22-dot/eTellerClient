import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigService]
    });
    
    // Clear localStorage before each test
    localStorage.clear();
    
    service = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default configuration', () => {
    const config = service.config;
    expect(config).toBeDefined();
    expect(config.envName).toBeDefined();
    expect(config.production).toBeDefined();
    expect(config.apiUrl).toBeDefined();
    expect(config.auth).toBeDefined();
  });

  it('should get environment name', () => {
    const envName = service.getEnvName();
    expect(envName).toBeDefined();
    expect(typeof envName).toBe('string');
  });

  it('should check if is production', () => {
    const isProd = service.isProduction();
    expect(typeof isProd).toBe('boolean');
  });

  it('should get API URL', () => {
    const apiUrl = service.getApiUrl();
    expect(apiUrl).toBeDefined();
    expect(typeof apiUrl).toBe('string');
  });

  it('should get auth config', () => {
    const authConfig = service.getAuthConfig();
    expect(authConfig).toBeDefined();
    expect(authConfig).toHaveProperty('redirectUri');
  });

  it('should update config', () => {
    const newApiUrl = 'https://new-api.example.com';
    service.updateConfig({ apiUrl: newApiUrl });
    expect(service.getApiUrl()).toBe(newApiUrl);
  });

  it('should update auth config', () => {
    const newAuthUrl = 'https://auth.example.com';
    service.updateAuthConfig({ authUrl: newAuthUrl });
    const authConfig = service.getAuthConfig();
    expect(authConfig.authUrl).toBe(newAuthUrl);
  });

  it('should save config to localStorage', () => {
    const newApiUrl = 'https://test-api.example.com';
    service.updateConfig({ apiUrl: newApiUrl });
    
    const saved = localStorage.getItem('app_runtime_config');
    expect(saved).toBeTruthy();
    const config = JSON.parse(saved!);
    expect(config.apiUrl).toBe(newApiUrl);
  });

  it('should load config from localStorage', () => {
    const customConfig = {
      envName: 'testing',
      production: false,
      apiUrl: 'https://custom-api.example.com',
      auth: {
        authUrl: 'https://custom-auth.example.com',
        clientId: 'test-client',
        scope: 'openid',
        redirectUri: window.location.origin,
      },
    };
    
    localStorage.setItem('app_runtime_config', JSON.stringify(customConfig));
    
    // Create new service instance to trigger load
    const newService = new ConfigService();
    expect(newService.getApiUrl()).toBe('https://custom-api.example.com');
    expect(newService.getEnvName()).toBe('testing');
  });

  it('should reset to defaults', () => {
    // Update config
    service.updateConfig({ 
      envName: 'testing',
      apiUrl: 'https://test.example.com' 
    });
    
    expect(service.getEnvName()).toBe('testing');
    
    // Reset
    service.resetToDefaults();
    
    // Should be back to defaults
    expect(service.getEnvName()).not.toBe('testing');
    expect(localStorage.getItem('app_runtime_config')).toBeNull();
  });

  it('should get all API URLs', () => {
    const urls = service.getAllApiUrls();
    expect(urls).toBeDefined();
    expect(urls).toHaveProperty('apiUrl');
    expect(urls).toHaveProperty('transactionApiUrl');
    expect(urls).toHaveProperty('currencyApiUrl');
  });

  it('should set environment name', () => {
    service.setEnvName('production');
    expect(service.getEnvName()).toBe('production');
  });

  it('should handle initialization', async () => {
    spyOn(console, 'log');
    await service.initialize();
    expect(console.log).toHaveBeenCalled();
  });

  it('should handle loading errors gracefully', () => {
    localStorage.setItem('app_runtime_config', 'invalid json');
    spyOn(console, 'error');
    
    // Create new service instance
    const newService = new ConfigService();
    
    // Should still work with default config
    expect(newService.config).toBeDefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle file loading failure gracefully', async () => {
    spyOn(console, 'warn');
    
    // Try to load from non-existent file
    await service.loadConfigFromFile('/non-existent.json');
    
    // Should still have valid config
    expect(service.config).toBeDefined();
    expect(console.warn).toHaveBeenCalled();
  });

  it('should provide readonly signal', () => {
    const configSignal = service.config$;
    expect(configSignal).toBeDefined();
    expect(typeof configSignal).toBe('function');
  });
});
