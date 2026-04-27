import { Component, DestroyRef, EventEmitter, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule, DxDropDownButtonModule } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { IClientResponse } from '../../models/cliente.models';

@Component({
  selector: 'app-table-clienti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxDropDownButtonModule, TranslocoPipe],
  templateUrl: './table-clienti.component.html',
  styleUrls: ['./table-clienti.component.css'],
})
export class TableClientiComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  @Input() clients$: Observable<IClientResponse[]> | null = null;
  @Input() filterValue: any = null;
  @Input() set searchValue(val: string) {
    setTimeout(() => this.dataGrid?.instance?.searchByText(val ?? ''));
  }
  @Output() clientSelected = new EventEmitter<any>();
  @Output() actionClicked = new EventEmitter<{ action: string; data: any }>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  moreActions = signal<{ id: string; text: string }[]>([]);

  constructor() {
    this.buildMoreActions();
    this.transloco.langChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildMoreActions());
  }

  private buildMoreActions(): void {
    this.moreActions.set([
      { id: 'storico', text: this.transloco.translate('clienti.actionStorico') },
      { id: 'print',   text: this.transloco.translate('clienti.actionPrint') },
    ]);
  }

  onSelectionChanged(e: any): void {
    this.clientSelected.emit(e);
  }

  onAction(action: string, data: any): void {
    this.actionClicked.emit({ action, data });
  }

  onMoreAction(e: any, data: any): void {
    this.actionClicked.emit({ action: e.itemData.id, data });
  }

  clearSelection(): void {
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.clearSelection();
    }
  }
}
