import { Injectable } from '@angular/core';
import { SempioneGridColumn } from '../sempione-data-grid/sempione-data-grid.component';

@Injectable({ providedIn: 'root' })
export class SempioneHeaderFilterService {

  applyToCell(event: any, columns: SempioneGridColumn[]): void {
    if (event.rowType !== 'header') return;

    const col = columns.find(c => c.dataField === event.column.dataField);
    if (!col?.allowHeaderFiltering) return;
    if (col.headerFilterType !== 'calendar') return;

    // Add CSS class only — CSS background-image handles the icon display.
    // DOM manipulation is unreliable because DX re-renders filter button children
    // on every state change (active/inactive), overwriting any appended content.
    const apply = () => {
      const filterBtn: HTMLElement | null = event.cellElement.querySelector('.dx-header-filter');
      if (!filterBtn) return;
      filterBtn.classList.add('hf-calendar');
      // Mark the cell so CSS can prevent text overflow into the icon area
      (event.cellElement as HTMLElement).classList.add('hf-calendar-cell');
    };

    apply();
    setTimeout(apply, 0);
  }
}
