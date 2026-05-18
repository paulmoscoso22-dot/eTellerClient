---
name: angular-testing
description: >
  Pattern e regole per scrivere test unitari Jest in Angular 21 per eTellerClient:
  struttura file spec, TestBed, HttpClientTestingModule, Signals, interceptor funzionali,
  componenti DevExtreme. Riferimento obbligatorio per agent-angular-tester.
applyTo: "eTellerClient/**"
---

# Angular Testing — eTeller Frontend

## Stack di Test

- **Framework**: Jest (Angular 21 default)
- **Test runner**: `npx jest` / `ng test`
- **Utilities**: `TestBed`, `HttpClientTestingModule`, `HttpTestingController`
- **Mocking**: `jest.fn()`, `jest.spyOn()`, `jest.mock()`

---

## 1. Struttura File

```
feature/
  auth.service.ts
  auth.service.spec.ts     ← accanto al sorgente
```

**Convenzioni di naming:**
```typescript
describe('AuthService', () => {           // nome della classe
  describe('login()', () => {             // nome del metodo
    it('should return OK when credentials are valid', ...) // scenario in inglese
    it('should redirect to /auth/login on 401', ...)
  })
})
```

---

## 2. Setup Componente

```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [LoginComponent],           // standalone component
    providers: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: Router, useValue: mockRouter },
    ]
  }).compileComponents();

  fixture = TestBed.createComponent(LoginComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

afterEach(() => {
  jest.clearAllMocks();
  fixture.destroy();                     // importante per cleanup
});
```

---

## 3. Test Servizi HTTP

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [AuthService]
  });
  service = TestBed.inject(AuthService);
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => {
  httpMock.verify();                     // verifica nessuna richiesta pendente
});

it('should call POST /api/auth/login', () => {
  service.login(mockRequest).subscribe();
  const req = httpMock.expectOne('/api/auth/login');
  expect(req.request.method).toBe('POST');
  req.flush({ resultCode: 'OK', token: 'mock.jwt.token' });
});

// Simulazione errore HTTP
it('should handle 401 error', () => {
  service.login(mockRequest).subscribe({
    error: (err) => expect(err.status).toBe(401)
  });
  const req = httpMock.expectOne('/api/auth/login');
  req.flush(null, { status: 401, statusText: 'Unauthorized' });
});
```

---

## 4. Test Signals (AuthStore)

```typescript
it('should set token after successful login', () => {
  const store = TestBed.runInInjectionContext(() => new AuthStore());

  TestBed.runInInjectionContext(() => {
    store.set('mock.jwt.token', mockSession);
    expect(store.token()).toBe('mock.jwt.token');
    expect(store.isAuthenticated()).toBe(true);
  });
});

it('should reset all signals after logout', () => {
  TestBed.runInInjectionContext(() => {
    store.set('mock.jwt.token', mockSession);
    store.reset();
    expect(store.token()).toBeNull();
    expect(store.currentUser()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });
});
```

---

## 5. Test Interceptor Funzionali

```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: AuthStore, useValue: { token: () => 'mock.jwt.token' } }
    ]
  });
  httpMock = TestBed.inject(HttpTestingController);
});

it('should add Authorization header to protected requests', () => {
  TestBed.inject(HttpClient).get('/api/data').subscribe();
  const req = httpMock.expectOne('/api/data');
  expect(req.request.headers.has('Authorization')).toBe(true);
  expect(req.request.headers.get('Authorization')).toBe('Bearer mock.jwt.token');
  req.flush({});
});

it('should skip Authorization header for /api/auth/login', () => {
  TestBed.inject(HttpClient).post('/api/auth/login', {}).subscribe();
  const req = httpMock.expectOne('/api/auth/login');
  expect(req.request.headers.has('Authorization')).toBe(false);
  req.flush({});
});
```

---

## 6. Test Guard

```typescript
it('should redirect to /auth/login if not authenticated', async () => {
  const mockAuthStore = { isAuthenticated: () => false };
  const mockRouter = { navigate: jest.fn() };

  TestBed.configureTestingModule({
    providers: [
      AuthGuard,
      { provide: AuthStore, useValue: mockAuthStore },
      { provide: Router, useValue: mockRouter }
    ]
  });

  const guard = TestBed.inject(AuthGuard);
  const result = await guard.canActivate();
  expect(result).toBe(false);
  expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
});
```

---

## 7. Test Componenti con DevExtreme

> ⚠️ **Regola fondamentale**: testare **solo la logica del componente TypeScript**, non il rendering interno di DevExtreme.
> DevExtreme ha i propri test — noi testiamo che i dati e i metodi siano corretti.

```typescript
// ✅ Corretto — testa la logica
it('should call AuthService.login with form values', () => {
  const loginSpy = jest.spyOn(authService, 'login').mockReturnValue(of(mockResponse));
  component.formData.userId = 'USER01';
  component.formData.password = 'Test@1234!';
  component.onSubmit();
  expect(loginSpy).toHaveBeenCalledWith({ userId: 'USER01', password: 'Test@1234!' });
});

// ❌ Evitare — testa rendering DevExtreme (fragile, lento)
it('should render DxButton', () => {
  expect(fixture.nativeElement.querySelector('dx-button')).toBeTruthy();
});
```

---

## 8. Placeholder Sicuri per Test

| Dato | Placeholder da usare |
|---|---|
| Password | `'Test@1234!'` |
| Token JWT | `'mock.jwt.token'` |
| UserId | `'TESTUSER'` |
| IP | `'127.0.0.1'` |
| SessionId | `'00000000-0000-0000-0000-000000000000'` |

> ❌ MAI usare password reali, token JWT reali o dati di produzione nei test.
