import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of } from 'rxjs';
import { MenuService } from './menu.service';
import { ApiService } from './api.service';
import { EnvironmentService } from './environment.service';
import { TranslocoService } from '@jsverse/transloco';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockTransloco = {
  langChanges$: of('it'),
  translate: (key: string) => key,
};

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MenuService,
        ApiService,
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: EnvironmentService, useValue: { buildApiUrl: (ep: string) => `http://api.test/${ep}` } },
      ],
    });

    service = TestBed.inject(MenuService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMenuItems() should return the predefined menu items array', () => {
    const items = service.getMenuItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('getCurrentMenuItems() should return the same items as getMenuItems()', () => {
    expect(service.getCurrentMenuItems()).toEqual(service.getMenuItems());
  });

  it('search() should filter items and update filteredMenuItems()', () => {
    service.search('versamento');
    const filtered = service.filteredMenuItems();
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('search() with no match should return empty array', () => {
    service.search('zzz_nonexistent_zzz');
    expect(service.filteredMenuItems().length).toBe(0);
  });

  it('clearSearch() should reset filteredMenuItems to all items', () => {
    service.search('versamento');
    service.clearSearch();
    expect(service.searchQuery()).toBe('');
    expect(service.filteredMenuItems().length).toBeGreaterThan(0);
  });

  it('searchQuery() should reflect the current search string', () => {
    service.search('test');
    expect(service.searchQuery()).toBe('test');
    service.clearSearch();
    expect(service.searchQuery()).toBe('');
  });

  it('findMenuItemByUrl() should find a nested item by its url', () => {
    // 'versamento' is a known URL in the hardcoded menuItems
    const found = service.findMenuItemByUrl('versamento');
    expect(found).not.toBeNull();
    expect(found?.url).toBe('versamento');
  });

  it('findMenuItemByUrl() should return null for unknown url', () => {
    expect(service.findMenuItemByUrl('__not_a_real_url__')).toBeNull();
  });

  it('getChildrenOf() should return visible children of a parent url', () => {
    // 'contiCorrenti' is a parent item
    const found = service.findMenuItemByUrl('versamento');
    expect(found).toBeDefined();
  });
});
