import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItem } from '../../../domain/menu-item';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnChanges {
  @Input() items: MenuItem[] = [];
  @Input() showSearch: boolean = false;
  @Input() searchPlaceholder: string = 'Search...';
  
  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() breadcrumbChanged = new EventEmitter<MenuItem[]>();
  
  searchQuery = signal<string>('');
  filteredItems = signal<MenuItem[]>([]);
  currentTrail: MenuItem[] = [];

  ngOnInit(): void {
    this.filteredItems.set(this.items);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.items) {
      if (this.searchQuery()) {
        this.onSearch();
      } else {
        this.filteredItems.set(this.items);
      }
    }
  }

  onSearch(): void {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      this.filteredItems.set(this.items);
      return;
    }

    const filtered = this.filterItems(this.items, query);
    this.filteredItems.set(filtered);
  }

  private filterItems(items: MenuItem[], query: string): MenuItem[] {
    const result: MenuItem[] = [];
    
    for (const item of items) {
      const labelMatch = item.label.toLowerCase().includes(query);
      const urlMatch = item.url?.toLowerCase().includes(query) || false;
      
      let matchingChildren: MenuItem[] = [];
      if (item.children) {
        matchingChildren = this.filterItems(item.children, query);
      }

      if (labelMatch || urlMatch || matchingChildren.length > 0) {
        result.push({
          ...item,
          children: matchingChildren.length > 0 ? matchingChildren : item.children,
          isExpanded: matchingChildren.length > 0 ? true : item.isExpanded,
        });
      }
    }
    
    return result;
  }

  onItemClick(item: MenuItem, trail: MenuItem[]): void {
    // Toggle expansion for items with children
    if (item.children && item.children.length > 0) {
      item.isExpanded = !item.isExpanded;
    }

    // Emit click event
    this.itemClick.emit(item);
    
    // Update breadcrumb trail
    this.currentTrail = trail;
    this.breadcrumbChanged.emit(trail);
  }

  toggleExpanded(item: MenuItem): void {
    item.isExpanded = !item.isExpanded;
  }

  getItemClass(item: MenuItem): string {
    const classes: string[] = ['menu-item'];
    
    if (item.isSelected) {
      classes.push('selected');
    }
    
    if (item.children && item.children.length > 0) {
      classes.push('has-children');
    }
    
    return classes.join(' ');
  }
}
