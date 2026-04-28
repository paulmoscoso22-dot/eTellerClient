import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule,
  DxPopupModule, DxTextAreaModule, DxValidatorModule, DxNumberBoxModule,
  DxSelectBoxModule, DxTagBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

export interface IScheduledTask {
  futId: string;
  futFunname: string;
  futDes: string;
  futTimeout: number | null;
  futScriptname: string;
  futTrace: boolean;
  futActive: boolean;
  futOffline: boolean;
  futAutatt: boolean;
  futOnetimerun: boolean;
  futPeriod: number | null;
  futPeriodtyp: string;
  futStart: string;
  futEnd: string;
  futLastrun: string | null;
  futLastrunok: string | null;
  futErrcount: number | null;
  futDatmod: string | null;
  futDatins: string | null;
  futNamedll: string;
  futClassname: string;
  futHosval: boolean;
}

@Component({
  selector: 'app-scheduled-tasks',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule,
    DxPopupModule, DxTextAreaModule, DxValidatorModule, DxNumberBoxModule,
    DxSelectBoxModule, DxTagBoxModule
  ],
  templateUrl: './scheduled-tasks.component.html',
  styleUrls: ['./scheduled-tasks.component.css'],
})
export class ScheduledTasksComponent implements OnInit {
  private fb = inject(FormBuilder);

  private tasks = signal<IScheduledTask[]>([]);
  searchValue = signal<string>('');
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedFutId = signal<string | null>(null);

  readonly periodTypes = [
    { id: 'D', des: 'Giorni' },
    { id: 'H', des: 'Ore' },
    { id: 'M', des: 'Minuti' },
    { id: 'R', des: 'Esecuzione singola' },
  ];

  filteredTasks = computed(() => {
    const q = this.searchValue().toLowerCase().trim();
    const all = this.tasks();
    if (!q) return all;
    return all.filter(t =>
      t.futId.toLowerCase().includes(q) ||
      t.futFunname.toLowerCase().includes(q) ||
      t.futDes.toLowerCase().includes(q)
    );
  });

  taskForm: FormGroup = this.fb.group({
    futId:         ['', Validators.required],
    futFunname:    ['', Validators.required],
    futDes:        ['', Validators.required],
    futTimeout:    [null, Validators.required],
    futScriptname: ['', Validators.required],
    futTrace:      [false],
    futActive:     [true],
    futOffline:    [false],
    futAutatt:     [false],
    futOnetimerun: [false],
    // scheduling fields
    futNamedll:    [''],
    futClassname:  [''],
    futStart:      ['00:00:00'],
    futEnd:        ['24:00:00'],
    futPeriodtyp:  ['D'],
    futPeriod:     [null],
    futErrcount:   [null],
    // non-scheduling fields
    futHosval:     [false],
  });

  get showScheduling(): boolean {
    return !!this.taskForm.get('futAutatt')?.value;
  }

  ngOnInit(): void {
    // TODO: load from backend service
    this.tasks.set([
      {
        futId: 'TASK001', futFunname: 'AggiornamentoCambi', futDes: 'Aggiornamento tassi di cambio giornaliero',
        futTimeout: 30000, futScriptname: 'update_rates.dll', futTrace: true, futActive: true,
        futOffline: false, futAutatt: true, futOnetimerun: false,
        futPeriod: 1, futPeriodtyp: 'D', futStart: '08:00:00', futEnd: '20:00:00',
        futLastrun: '2024-01-15 08:00', futLastrunok: '2024-01-15 08:00',
        futErrcount: 0, futDatmod: '2024-01-10', futDatins: '2023-06-01',
        futNamedll: 'eTellerTasks.dll', futClassname: 'eTellerTasks.AggiornamentoCambi',
        futHosval: false
      },
      {
        futId: 'TASK002', futFunname: 'ReportGiornaliero', futDes: 'Generazione report di cassa giornaliero',
        futTimeout: 60000, futScriptname: 'daily_report.dll', futTrace: false, futActive: true,
        futOffline: false, futAutatt: true, futOnetimerun: false,
        futPeriod: 1, futPeriodtyp: 'D', futStart: '23:00:00', futEnd: '23:59:00',
        futLastrun: '2024-01-14 23:00', futLastrunok: '2024-01-14 23:00',
        futErrcount: 0, futDatmod: '2024-01-10', futDatins: '2023-06-01',
        futNamedll: 'eTellerReports.dll', futClassname: 'eTellerReports.DailyReport',
        futHosval: false
      },
      {
        futId: 'TASK003', futFunname: 'ValidazioneHost', futDes: 'Verifica connessione host bancario',
        futTimeout: 5000, futScriptname: 'host_check.dll', futTrace: false, futActive: true,
        futOffline: false, futAutatt: false, futOnetimerun: false,
        futPeriod: null, futPeriodtyp: 'D', futStart: '00:00:00', futEnd: '24:00:00',
        futLastrun: '2024-01-15 09:00', futLastrunok: '2024-01-15 09:00',
        futErrcount: 2, futDatmod: '2024-01-10', futDatins: '2023-06-01',
        futNamedll: '', futClassname: '', futHosval: true
      }
    ]);
  }

  openNewPopup(): void {
    this.taskForm.reset({
      futTrace: false, futActive: true, futOffline: false,
      futAutatt: false, futOnetimerun: false, futHosval: false,
      futStart: '00:00:00', futEnd: '24:00:00', futPeriodtyp: 'D'
    });
    this.selectedFutId.set(null);
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: IScheduledTask): void {
    this.selectedFutId.set(data.futId);
    this.taskForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IScheduledTask): void {
    this.selectedFutId.set(data.futId);
    this.taskForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IScheduledTask): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
    }
  }

  onDelete(data: IScheduledTask): void {
    // TODO: call backend delete
    this.tasks.update(list => list.filter(t => t.futId !== data.futId));
    notify(`Task "${data.futId}" eliminato`, 'success', 3000);
  }

  onOneTimeRun(): void {
    const id = this.selectedFutId();
    // TODO: call backend one-time run
    notify(`Esecuzione singola avviata per "${id}"`, 'info', 3000);
  }

  onResetErrors(): void {
    const id = this.selectedFutId();
    this.tasks.update(list =>
      list.map(t => t.futId === id ? { ...t, futErrcount: 0 } : t)
    );
    // TODO: call backend reset errors
    notify(`Errori azzerati per "${id}"`, 'success', 3000);
  }

  onSubmit(): void {
    if (!this.taskForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.taskForm.getRawValue();
    const newTask: IScheduledTask = {
      ...val,
      futOnetimerun: false,
      futLastrun: null,
      futLastrunok: null,
      futErrcount: 0,
      futDatmod: null,
      futDatins: new Date().toISOString().slice(0, 10),
    };
    // TODO: call backend insert
    this.tasks.update(list => [...list, newTask]);
    notify('Task creato con successo', 'success', 3000);
    this.closePopup();
  }

  onUpdate(): void {
    if (!this.taskForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const val = this.taskForm.getRawValue();
    // TODO: call backend update
    this.tasks.update(list =>
      list.map(t => t.futId === val.futId ? { ...t, ...val } : t)
    );
    notify('Task aggiornato con successo', 'success', 3000);
    this.closePopup();
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.taskForm.reset({
      futTrace: false, futActive: true, futOffline: false,
      futAutatt: false, futOnetimerun: false, futHosval: false,
      futStart: '00:00:00', futEnd: '24:00:00', futPeriodtyp: 'D'
    });
    this.selectedFutId.set(null);
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }

  getPeriodLabel(task: IScheduledTask): string {
    if (!task.futAutatt) return '—';
    const type = this.periodTypes.find(p => p.id === task.futPeriodtyp);
    return task.futPeriod ? `${task.futPeriod} ${type?.des ?? task.futPeriodtyp}` : (type?.des ?? '—');
  }
}
