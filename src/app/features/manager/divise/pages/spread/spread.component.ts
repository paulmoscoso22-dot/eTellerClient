import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
} from 'devextreme-angular';
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
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
  ],
  templateUrl: './spread.component.html',
  styleUrls: ['./spread.component.css'],
})
export class SpreadComponent implements OnInit {
  private fb = inject(FormBuilder);

  spreadList = signal<ISpreadItem[]>([]);

  filterCur = signal<string>('');
  filterTipo = signal<string>('');

  isPopupVisible = false;
  popupMode = signal<'new'|'edit'|'view'>('view');
  selectedLabel = signal<string>('');

  filteredSpread = computed(() => {
    const c = this.filterCur().toLowerCase().trim();
    const t = this.filterTipo().toLowerCase().trim();
    return this.spreadList().filter(s => {
      if (c && !s.sprCurId.toLowerCase().includes(c)) return false;
      if (t && !s.sprType.toLowerCase().includes(t)) return false;
      return true;
    });
  });

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

  onCerca(): void { notify('Filtri applicati', 'info', 1400); }
  onResetFiltri(): void { this.filterCur.set(''); this.filterTipo.set(''); }

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

  onTableAction(action: string, data: ISpreadItem): void {
    if (action === 'view') this.openViewPopup(data);
    if (action === 'edit') this.openEditPopup(data);
    if (action === 'delete') {
      this.spreadList.update(list => list.filter(i => !(i.sprCurId === data.sprCurId && i.sprType === data.sprType)));
      notify('Spread eliminato', 'success', 1200);
    }
  }
}
