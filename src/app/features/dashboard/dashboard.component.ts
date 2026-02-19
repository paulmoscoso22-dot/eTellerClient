import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DxListModule, DxButtonModule, DxToolbarModule, DxDataGridModule, DxTreeListModule, DxTextBoxModule } from 'devextreme-angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MenuService } from './services/menu.service';
import { Logo } from './components/logo/logo';

interface MenuItem {
  key?: string;
  Full_Name?: string;
  path?: string;
  icon?: string;
  items?: MenuItem[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
     DxListModule, DxButtonModule, DxToolbarModule, DxDataGridModule, RouterOutlet, DxTreeListModule, DxTextBoxModule, FormsModule, CommonModule, Logo
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit {
   sidebarOpen = true;
   menuItems = signal<MenuItem[]>([]);
   filteredMenuItems = signal<MenuItem[]>([]);
   expandedRowKeys = signal<any[]>([]);
   searchQuery = signal<string>('');
   activeMenuItem = signal<string | null>(null);

  constructor(
    private router: Router,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    const items = this.menuService.getMenuItems();
    this.menuItems.set(items);
    this.filteredMenuItems.set(items);
  }

  getDisplayExpr(itemData: any): string {
    return itemData.key || itemData.text || '';
  }

  onRowExpanding(e: any): void {
    const key = e.key;
    const currentExpanded = this.expandedRowKeys();
    if (currentExpanded.indexOf(key) === -1) {
      this.expandedRowKeys.set([...currentExpanded, key]);
    }
  }

  onRowCollapsing(e: any): void {
    const key = e.key;
    const currentExpanded = this.expandedRowKeys();
    const index = currentExpanded.indexOf(key);
    if (index > -1) {
      const newExpanded = [...currentExpanded];
      newExpanded.splice(index, 1);
      this.expandedRowKeys.set(newExpanded);
    }
  }

  onMenuItemClick(e: any): void {
    if (e.data?.path) {
      this.activeMenuItem.set(e.data.path);
      this.router.navigate([e.data.path], { relativeTo: this.router.routerState.root.firstChild });
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (query.trim()) {
      const filtered = this.menuService.searchMenuItems(query);
      this.filteredMenuItems.set(filtered);
      // Auto expand all items when searching
      this.expandedRowKeys.set(this.getAllKeys(filtered));
    } else {
      this.filteredMenuItems.set(this.menuItems());
      this.expandedRowKeys.set([]);
    }
  }

  private getAllKeys(items: MenuItem[]): any[] {
    let keys: any[] = [];
    items.forEach(item => {
      if (item.Full_Name) {
        keys.push(item.Full_Name);
      }
      if (item.items && item.items.length > 0) {
        keys = keys.concat(this.getAllKeys(item.items));
      }
    });
    return keys;
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.filteredMenuItems.set(this.menuItems());
    this.expandedRowKeys.set([]);
  }

  logout(): void {
    // Clear authentication data
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Navigate to login
    this.router.navigate(['/auth/login']);
  }
}


