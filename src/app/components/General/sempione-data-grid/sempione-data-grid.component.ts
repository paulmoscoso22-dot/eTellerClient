import { Component, Input, Output, EventEmitter, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { SempioneRowActionsComponent } from '../sempione-row-actions/sempione-row-actions.component';
import { SempioneHeaderFilterService } from '../sempione-header-filter/sempione-header-filter.service';

export interface SempioneGridColumn {
  dataField: string;
  caption: string;
  width?: number;
  minWidth?: number;
  alignment?: 'left' | 'center' | 'right';
  allowSorting?: boolean;
  allowFiltering?: boolean;
  allowHeaderFiltering?: boolean;
  headerFilterDataSource?: { text: string; value: any }[];
  headerFilterType?: 'list' | 'calendar';
  type?: 'text' | 'status' | 'bool' | 'bool-text' | 'bool-text-inverted' | 'segno' | 'currency' | 'tipo-pill' | 'entity-status' | 'stato-operazione';
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'datetime';
  format?: string;
  wrap?: boolean;
  cssClass?: string;
}

@Component({
  selector: 'app-sempione-data-grid',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, SempioneRowActionsComponent],
  templateUrl: './sempione-data-grid.component.html',
  styleUrls: ['./sempione-data-grid.component.css'],
})
export class SempioneDataGridComponent implements OnDestroy {
  private readonly headerFilterService = inject(SempioneHeaderFilterService);

  @ViewChild(DxDataGridComponent) private grid?: DxDataGridComponent;

  public clearSelection(): void { this.grid?.instance?.clearSelection(); }
  public clearFilters(): void { this.grid?.instance?.clearFilter(); }

  onCellPrepared(e: any): void {
    this.headerFilterService.applyToCell(e, this.effectiveColumns);
  }

  get effectiveColumns(): SempioneGridColumn[] {
    if (!this.showHeaderFilter) return this.columns;
    return this.columns.map(col => {
      if (!col.allowHeaderFiltering) return col;

      const updated: SempioneGridColumn = { ...col };

      // Auto-calendar for date/datetime columns
      if ((col.dataType === 'date' || col.dataType === 'datetime') && !col.headerFilterType) {
        updated.headerFilterType = 'calendar';
        updated.cssClass = (col.cssClass ? col.cssClass + ' ' : '') + 'col-date';
      }

      // Auto allowFiltering: false
      if (updated.allowFiltering === undefined) {
        updated.allowFiltering = false;
      }

      // Auto-width: caption uppercase 11px bold ≈ 8px/char + 17px icon + 25px padding/margins
      const captionMin = Math.ceil(col.caption.length * 8.0) + 42;
      const current = col.width ?? col.minWidth ?? 0;
      if (captionMin > current) {
        if (col.width !== undefined) updated.width = captionMin;
        else updated.minWidth = captionMin;
      }

      return updated;
    });
  }

  onHeaderFilterShowing(): void {
    document.documentElement.style.setProperty(
      '--hf-list-max-height',
      `${this.headerFilterMaxItems * 30}px`
    );
  }

  onHeaderFilterHidden(): void {
    document.documentElement.style.removeProperty('--hf-list-max-height');
  }

  ngOnDestroy(): void {
    document.documentElement.style.removeProperty('--hf-list-max-height');
  }

  @Input() dataSource: any[] = [];
  @Input() columns: SempioneGridColumn[] = [];
  @Input() keyExpr: string | string[] = '';
  @Input() pageSize: number = 30;
  @Input() allowedPageSizes: number[] = [20, 30, 50, 100];
  @Input() noDataText: string = 'Nessun risultato trovato.';
  @Input() showViewAction: boolean = false;
  @Input() showEditAction: boolean = true;
  @Input() showTraceAction: boolean = false;
  @Input() showDeleteAction: boolean = false;
  @Input() showForceAction: boolean = false;
  @Input() showFilterRow: boolean = false;
  @Input() showHeaderFilter: boolean = false;
  @Input() headerFilterMaxItems: number = 8;
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() emptyStateText: string | null = null;
  @Input() emptyStateIcon: 'user' | 'shield' | 'default' = 'default';

  @Output() rowView = new EventEmitter<any>();
  @Output() rowEdit = new EventEmitter<any>();
  @Output() rowTrace = new EventEmitter<any>();
  @Output() rowDelete = new EventEmitter<any>();
  @Output() rowForce = new EventEmitter<any>();
  @Output() rowDblClick = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  onRowDblClick(e: any): void {
    if (e.data) this.rowDblClick.emit(e.data);
  }

  onOptionChanged(e: { fullName?: string; value?: unknown }): void {
    if (e.fullName === 'paging.pageSize') {
      this.pageSizeChanged.emit(Number(e.value));
    }
  }

  get hasWrapColumn(): boolean {
    return this.columns.some(c => c.wrap);
  }

  get actionsColumnWidth(): number {
    const count = [this.showViewAction, this.showEditAction, this.showTraceAction, this.showDeleteAction, this.showForceAction].filter(Boolean).length;
    if (count >= 3) return 90;
    if (count === 2) return 70;
    return 60;
  }
}
