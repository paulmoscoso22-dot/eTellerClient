import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DxTextBoxModule, DxNumberBoxModule, DxDateBoxModule } from 'devextreme-angular';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneSearchModeComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';

export interface ISpreadItem {
  sprCurId: string;
  sprType: string;
  sprValue: number;
  sprDatini?: string;
}

@Component({
  selector: 'app-spread',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxNumberBoxModule, DxDateBoxModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneSearchModeComponent,
    SempioneDataGridComponent, SempionePopupComponent, SempionePopupCardComponent,
    SempionePopupActionBarComponent, SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
  ],
  templateUrl: './spread.component.html',
  styleUrls: ['./spread.component.css'],
})
export class SpreadComponent implements OnInit {
  private fb = inject(FormBuilder);

  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'sprCurId',  caption: 'Divisa',    alignment: 'left',  width: 120, allowHeaderFiltering: true, allowFiltering: false },
    { dataField: 'sprType',   caption: 'Tipo',       alignment: 'left',  width: 140, allowHeaderFiltering: true, allowFiltering: false },
    { dataField: 'sprValue',  caption: 'Valore',     alignment: 'right', width: 140, dataType: 'number', format: '#,##0.0000', allowHeaderFiltering: true, allowFiltering: false },
    { dataField: 'sprDatini', caption: 'Valido Dal', alignment: 'left',  minWidth: 140, allowHeaderFiltering: true, allowFiltering: false },
  ];

  spreadList = signal<ISpreadItem[]>([]);

  isLoading = signal<boolean>(false);
  isPopupVisible = false;
  isConfirmDeleteVisible = signal(false);
  pendingDeleteData = signal<ISpreadItem | null>(null);
  popupMode = signal<'new'|'edit'|'view'>('view');
  selectedLabel = signal<string>('');

  spreadForm: FormGroup = this.fb.group({
    sprCurId: [''],
    sprType: [''],
    sprValue: [0],
    sprDatini: ['']
  });

  ngOnInit(): void {
    this.spreadList.set([
      { sprCurId: 'EUR', sprType: 'SPT1', sprValue: 0.05, sprDatini: '2024-01-01' },
      { sprCurId: 'USD', sprType: 'SPT1', sprValue: 0.07, sprDatini: '2024-01-01' },
      { sprCurId: 'JPY', sprType: 'SPT2', sprValue: 0.0012, sprDatini: '2024-01-01' }
    ]);
  }

  clearGridFilters(): void { this.dataGrid?.clearFilters(); }

  openNewPopup(): void { this.popupMode.set('new'); this.selectedLabel.set('Nuovo Spread'); this.isPopupVisible = true; }
  openEditPopup(item: ISpreadItem): void { this.popupMode.set('edit'); this.selectedLabel.set(item.sprCurId); this.spreadForm.patchValue(item); this.isPopupVisible = true; }
  openViewPopup(item: ISpreadItem): void { this.popupMode.set('view'); this.selectedLabel.set(item.sprCurId); this.spreadForm.patchValue(item); this.isPopupVisible = true; }

  closePopup(): void { this.isPopupVisible = false; this.spreadForm.reset(); }

  onSave(): void {
    const v = this.spreadForm.getRawValue() as ISpreadItem;
    if (this.popupMode() === 'new') {
      this.spreadList.update(s => [...s, v]);
      notify('Spread creato', 'success', 1400);
    } else {
      this.spreadList.update(list => list.map(it => it.sprCurId === v.sprCurId && it.sprType === v.sprType ? v : it));
      notify('Spread aggiornato', 'success', 1400);
    }
    this.closePopup();
  }

  requestDelete(data: ISpreadItem): void {
    this.pendingDeleteData.set(data);
    this.isConfirmDeleteVisible.set(true);
  }

  confirmDelete(): void {
    const data = this.pendingDeleteData();
    if (!data) return;
    this.spreadList.update(list => list.filter(i => !(i.sprCurId === data.sprCurId && i.sprType === data.sprType)));
    notify(`Spread "${data.sprCurId} ${data.sprType}" eliminato`, 'success', 3000);
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible.set(false);
    this.pendingDeleteData.set(null);
  }

  onTableAction(action: string, data: ISpreadItem): void {
    if (action === 'view') this.openViewPopup(data);
    if (action === 'edit') this.openEditPopup(data);
    if (action === 'delete') this.requestDelete(data);
  }
}
