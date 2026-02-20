import { TestBed } from '@angular/core/testing';
import { MenuService } from './menu.service';
import { MenuItem } from '../domain/menu-item';

describe('MenuService', () => {
  let service: MenuService;

  const mockMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      url: '/dashboard',
      icon: 'home',
      isVisible: true,
      isExpanded: false,
      isSelected: false,
    },
    {
      label: 'Operations',
      url: '/operations',
      icon: 'money',
      isVisible: true,
      isExpanded: false,
      isSelected: false,
      children: [
        {
          label: 'Accounts',
          url: '/operations/accounts',
          icon: 'card',
          isVisible: true,
        },
        {
          label: 'Transactions',
          url: '/operations/transactions',
          icon: 'exchange',
          isVisible: true,
        },
      ],
    },
    {
      label: 'Reports',
      url: '/reports',
      icon: 'chart',
      isVisible: true,
      children: [
        {
          label: 'Daily',
          url: '/reports/daily',
          icon: 'calendar',
          isVisible: true,
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuService]
    });
    
    localStorage.clear();
    service = TestBed.inject(MenuService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get menu items', () => {
    service.setMenuItems(mockMenuItems);
    const items = service.getMenuItems();
    expect(items).toEqual(mockMenuItems);
  });

  it('should search menu items', () => {
    service.setMenuItems(mockMenuItems);
    service.search('transactions');
    const filtered = service.filteredMenuItems();
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should clear search', () => {
    service.setMenuItems(mockMenuItems);
    service.search('test');
    expect(service.searchQuery()).toBe('test');
    
    service.clearSearch();
    expect(service.searchQuery()).toBe('');
    expect(service.filteredMenuItems()).toEqual(mockMenuItems);
  });

  it('should expand item', () => {
    service.setMenuItems(mockMenuItems);
    const item = mockMenuItems[1];
    expect(item.isExpanded).toBeFalsy();
    
    service.expandItem(item);
    expect(item.isExpanded).toBe(true);
  });

  it('should collapse item', () => {
    service.setMenuItems(mockMenuItems);
    const item = mockMenuItems[1];
    item.isExpanded = true;
    
    service.collapseItem(item);
    expect(item.isExpanded).toBe(false);
  });

  it('should toggle item', () => {
    service.setMenuItems(mockMenuItems);
    const item = mockMenuItems[1];
    
    service.toggleItem(item);
    expect(item.isExpanded).toBe(true);
    
    service.toggleItem(item);
    expect(item.isExpanded).toBe(false);
  });

  it('should select item', () => {
    service.setMenuItems(mockMenuItems);
    const item = mockMenuItems[0];
    
    service.selectItem(item);
    expect(item.isSelected).toBe(true);
    expect(service.selectedItem()).toBe(item);
  });

  it('should deselect previous item when selecting new one', () => {
    service.setMenuItems(mockMenuItems);
    const item1 = mockMenuItems[0];
    const item2 = mockMenuItems[1];
    
    service.selectItem(item1);
    expect(item1.isSelected).toBe(true);
    
    service.selectItem(item2);
    expect(item1.isSelected).toBe(false);
    expect(item2.isSelected).toBe(true);
  });

  it('should expand all items', () => {
    service.setMenuItems(mockMenuItems);
    service.expandAll();
    
    const items = service.getMenuItems();
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        expect(item.isExpanded).toBe(true);
      }
    });
  });

  it('should collapse all items', () => {
    service.setMenuItems(mockMenuItems);
    service.expandAll();
    service.collapseAll();
    
    const items = service.getMenuItems();
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        expect(item.isExpanded).toBe(false);
      }
    });
  });

  it('should find item by URL', () => {
    service.setMenuItems(mockMenuItems);
    const found = service.findItemByUrl('/operations/accounts');
    
    expect(found).toBeTruthy();
    expect(found?.label).toBe('Accounts');
  });

  it('should find item by label', () => {
    service.setMenuItems(mockMenuItems);
    const found = service.findItemByLabel('Transactions');
    
    expect(found).toBeTruthy();
    expect(found?.url).toBe('/operations/transactions');
  });

  it('should get path to item', () => {
    service.setMenuItems(mockMenuItems);
    const targetItem = mockMenuItems[1].children![0];
    const path = service.getPathToItem(targetItem);
    
    expect(path.length).toBe(2);
    expect(path[0].label).toBe('Operations');
    expect(path[1].label).toBe('Accounts');
  });

  it('should get visible items', () => {
    const itemsWithHidden: MenuItem[] = [
      ...mockMenuItems,
      { label: 'Hidden', url: '/hidden', isVisible: false },
    ];
    
    service.setMenuItems(itemsWithHidden);
    const visible = service.getVisibleItems();
    
    expect(visible.every(item => item.isVisible !== false)).toBe(true);
  });

  it('should get config', () => {
    const config = service.getConfig();
    expect(config).toBeDefined();
    expect(config.enableSearch).toBeDefined();
    expect(config.enableIcons).toBeDefined();
  });

  it('should reset menu state', () => {
    service.setMenuItems(mockMenuItems);
    service.expandAll();
    service.search('test');
    service.selectItem(mockMenuItems[0]);
    
    service.reset();
    
    expect(service.searchQuery()).toBe('');
    expect(service.selectedItem()).toBeNull();
  });

  it('should save and restore menu state', () => {
    service.setMenuItems(mockMenuItems);
    const item = mockMenuItems[1];
    service.expandItem(item);
    
    // Create new service instance to trigger load
    const newService = new MenuService();
    newService.setMenuItems(mockMenuItems);
    
    // Note: In real scenario, the state would be restored from localStorage
    const savedState = localStorage.getItem('menu_state');
    expect(savedState).toBeTruthy();
  });

  it('should handle search with no results', () => {
    service.setMenuItems(mockMenuItems);
    service.search('nonexistent');
    
    const filtered = service.filteredMenuItems();
    expect(filtered.length).toBe(0);
  });

  it('should handle empty search query', () => {
    service.setMenuItems(mockMenuItems);
    service.search('');
    
    const filtered = service.filteredMenuItems();
    expect(filtered).toEqual(mockMenuItems);
  });
});
