import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, ApiError } from './api.service';
import { EnvironmentService } from './environment.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let envService: jasmine.SpyObj<EnvironmentService>;

  beforeEach(() => {
    const envServiceSpy = jasmine.createSpyObj('EnvironmentService', ['buildApiUrl']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: EnvironmentService, useValue: envServiceSpy }
      ]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    envService = TestBed.inject(EnvironmentService) as jasmine.SpyObj<EnvironmentService>;
    
    // Setup default behavior
    envService.buildApiUrl.and.callFake((endpoint: string) => `https://api.example.com${endpoint}`);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('GET requests', () => {
    it('should make a GET request', () => {
      const mockResponse = { data: 'test' };

      service.get('/test').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle GET request errors', () => {
      service.get('/error').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiError) => {
          expect(error.status).toBe(404);
          expect(error.message).toBeTruthy();
        }
      });

      const req = httpMock.expectOne('https://api.example.com/error');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('POST requests', () => {
    it('should make a POST request', () => {
      const mockBody = { name: 'test' };
      const mockResponse = { id: 1, name: 'test' };

      service.post('/create', mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/create');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request', () => {
      const mockBody = { id: 1, name: 'updated' };
      const mockResponse = { id: 1, name: 'updated' };

      service.put('/update/1', mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/update/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('PATCH requests', () => {
    it('should make a PATCH request', () => {
      const mockBody = { name: 'patched' };
      const mockResponse = { id: 1, name: 'patched' };

      service.patch('/patch/1', mockBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/patch/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(mockBody);
      req.flush(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request', () => {
      service.delete('/delete/1').subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne('https://api.example.com/delete/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('File operations', () => {
    it('should download file', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });

      service.downloadFile('/download').subscribe(response => {
        expect(response).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('https://api.example.com/download');
      expect(req.request.method).toBe('GET');
      req.flush(blob);
    });

    it('should upload file', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = { fileId: '123' };

      service.uploadFile('/upload', file).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockResponse);
    });

    it('should upload file with additional data', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const additionalData = { userId: '123', category: 'documents' };
      const mockResponse = { fileId: '123' };

      service.uploadFile('/upload', file, additionalData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('https://api.example.com/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush(mockResponse);
    });
  });

  describe('Request options', () => {
    it('should handle custom headers', () => {
      const headers = { 'X-Custom-Header': 'test-value' };

      service.get('/test', { headers }).subscribe();

      const req = httpMock.expectOne('https://api.example.com/test');
      expect(req.request.headers.get('X-Custom-Header')).toBe('test-value');
      req.flush({});
    });

    it('should handle query parameters', () => {
      const params = service.buildParams({ page: 1, size: 10 });

      service.get('/test', { params }).subscribe();

      const req = httpMock.expectOne('https://api.example.com/test?page=1&size=10');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      req.flush({});
    });
  });

  describe('Error handling', () => {
    it('should handle 400 error', () => {
      service.get('/test').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiError) => {
          expect(error.status).toBe(400);
          expect(error.message).toContain('non valida');
        }
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 error', () => {
      service.get('/test').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiError) => {
          expect(error.status).toBe(401);
          expect(error.message).toContain('autorizzato');
        }
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 500 error', () => {
      service.get('/test').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiError) => {
          expect(error.status).toBe(500);
          expect(error.message).toContain('server');
        }
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should extract error message from response', () => {
      const errorResponse = { message: 'Custom error message' };

      service.get('/test').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiError) => {
          expect(error.message).toBe('Custom error message');
        }
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Utility methods', () => {
    it('should build params from object', () => {
      const params = service.buildParams({ 
        name: 'test', 
        active: true, 
        count: 5 
      });

      expect(params.get('name')).toBe('test');
      expect(params.get('active')).toBe('true');
      expect(params.get('count')).toBe('5');
    });

    it('should handle array parameters', () => {
      const params = service.buildParams({ 
        ids: [1, 2, 3] 
      });

      expect(params.getAll('ids')).toEqual(['1', '2', '3']);
    });

    it('should skip null and undefined parameters', () => {
      const params = service.buildParams({ 
        name: 'test', 
        nullValue: null, 
        undefinedValue: undefined 
      });

      expect(params.get('name')).toBe('test');
      expect(params.has('nullValue')).toBe(false);
      expect(params.has('undefinedValue')).toBe(false);
    });

    it('should build headers from object', () => {
      const headers = service.buildHeaders({ 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      });

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer token');
    });
  });

  describe('URL building', () => {
    it('should use full URL if provided', () => {
      service.get('https://external-api.com/data').subscribe();

      const req = httpMock.expectOne('https://external-api.com/data');
      expect(req.request.url).toBe('https://external-api.com/data');
      req.flush({});
    });

    it('should build URL for relative endpoint', () => {
      service.get('/users').subscribe();

      const req = httpMock.expectOne('https://api.example.com/users');
      expect(envService.buildApiUrl).toHaveBeenCalledWith('/users');
      req.flush({});
    });
  });
});
