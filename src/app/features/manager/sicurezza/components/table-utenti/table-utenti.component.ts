import { Component, DestroyRef, EventEmitter, Input, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule, DxDropDownButtonModule } from 'devextreme-angular';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ISysUsersActiveAndBlockedResponse } from '../../models/utenti.models';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Service } from '../../../../../core/services/service';
import { ISTStatoEntitaResponse } from '../../../../../core/domain/stato-entita.domain';
import { Branch } from '../../../../../core/domain/branch.domain';
import { ISTLanguageResponse } from '../../../../../core/domain/laguage.domain';

@Component({
  selector: 'app-table-utenti',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxDropDownButtonModule, TranslocoPipe],
  templateUrl: './table-utenti.component.html',
  styleUrls: ['./table-utenti.component.css']
})
export class TableUtentiComponent {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;

  @Input() users$: Observable<ISysUsersActiveAndBlockedResponse[]> | null = null;
  @Input() filterValue: any = null;
  @Input() set searchValue(val: string) {
    // defer so the grid instance is ready
    setTimeout(() => this.dataGrid?.instance?.searchByText(val ?? ''));
  }
  @Output() userSelected = new EventEmitter<any>();
  @Output() actionClicked = new EventEmitter<{ action: string; data: any }>();

  private coreService  = inject(Service);
  private destroyRef   = inject(DestroyRef);
  private transloco    = inject(TranslocoService);

  statiEntita  = signal<ISTStatoEntitaResponse[]>([]);
  branches     = signal<Branch[]>([]);
  languages    = signal<ISTLanguageResponse[]>([]);
  moreActions  = signal<{ id: string; text: string }[]>([]);

  constructor() {
    this.coreService.allStatiEntita$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.statiEntita.set(d));
    this.coreService.branches$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.branches.set(d));
    this.coreService.languages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.languages.set(d));

    this.buildMoreActions();
    this.transloco.langChanges$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.buildMoreActions());
  }

  private buildMoreActions(): void {
    this.moreActions.set([
      { id: 'resetPwd', text: this.transloco.translate('utenti.actionResetPwd') },
      { id: 'storico',  text: this.transloco.translate('utenti.actionStorico') },
      { id: 'print',    text: this.transloco.translate('utenti.actionPrint') },
    ]);
  }

  onSelectionChanged(e: any): void {
    this.userSelected.emit(e);
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
