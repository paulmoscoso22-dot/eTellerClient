import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { UserInfo } from '../domain/user-info';
import { environment } from '../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: UserInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get current user', () => {
    service.setCurrentUser(mockUser);
    const currentUser = service.getCurrentUser();
    expect(currentUser).toEqual(mockUser);
  });

  it('should save user to localStorage', () => {
    service.setCurrentUser(mockUser);
    const savedUser = localStorage.getItem('user_info');
    expect(savedUser).toBeTruthy();
    expect(JSON.parse(savedUser!)).toEqual(mockUser);
  });

  it('should load user from localStorage on init', () => {
    localStorage.setItem('user_info', JSON.stringify(mockUser));
    const newService = new UserService(TestBed.inject(HttpClientTestingModule) as any);
    expect(newService.getCurrentUser()).toEqual(mockUser);
  });

  it('should load user info from server', () => {
    service.loadUserInfo().subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/info`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should update user info on server', () => {
    service.updateUserInfo(mockUser).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/info`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockUser);
  });

  it('should get user initials correctly', () => {
    service.setCurrentUser(mockUser);
    const initials = service.getUserInitials();
    expect(initials).toBe('JD');
  });

  it('should get full name correctly', () => {
    service.setCurrentUser(mockUser);
    const fullName = service.getFullName();
    expect(fullName).toBe('John Doe');
  });

  it('should clear user on logout', () => {
    service.setCurrentUser(mockUser);
    expect(service.getCurrentUser()).toEqual(mockUser);
    
    service.clearUser();
    expect(service.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('user_info')).toBeNull();
  });

  it('should return default initials when no user', () => {
    service.clearUser();
    const initials = service.getUserInitials();
    expect(initials).toBe('U');
  });

  it('should return default name when no user', () => {
    service.clearUser();
    const fullName = service.getFullName();
    expect(fullName).toBe('User');
  });
});
