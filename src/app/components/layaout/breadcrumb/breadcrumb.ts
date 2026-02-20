import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BreadcrumbItem } from '../../../domain/breadcrumb-item';

@Component({
  selector: 'app-breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  @Input() items: BreadcrumbItem[] = [];
  @Input() isDarkTheme: boolean = false;
  @Output() itemClick = new EventEmitter<BreadcrumbItem>();

  onBreadcrumbClick(item: BreadcrumbItem): void {
    if (!item.isActive) {
      this.itemClick.emit(item);
    }
  }

}
