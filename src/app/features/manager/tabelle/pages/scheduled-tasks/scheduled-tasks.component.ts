import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule,
  DxPopupModule, DxTextAreaModule, DxValidatorModule, DxNumberBoxModule,
  DxSelectBoxModule, DxTagBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { TabelleService } from '../../services/tabelle.service';
import {
  FunzioniScheduleResponse,
  InsertFunzioneScheduleCommand,
  IPeriodTypeResponse,
} from '../../models/FunzioneSchedule.models';

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
  private readonly fb = inject(FormBuilder);
  private readonly tabelleService = inject(TabelleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  private readonly tasks = signal<FunzioniScheduleResponse[]>([]);
  private readonly searchSubject = new Subject<string>();

  readonly searchValue = signal<string>('');
  readonly popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  readonly selectedFutId = signal<string | null>(null);

  readonly periodTypes = signal<IPeriodTypeResponse[]>([]);

  readonly filteredTasks = computed(() => this.tasks());

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
    futNamedll:    [''],
    futClassname:  [''],
    futStart:      ['00:00:00'],
    futEnd:        ['24:00:00'],
    futPeriodtyp:  ['D'],
    futPeriod:     [null],
    futErrcount:   [null],
    futHosval:     [false],
    futLoop:       [false],
  });

  get showScheduling(): boolean {
    return !!this.taskForm.get('futAutatt')?.value;
  }

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => this.tabelleService.getFunzioniSchedule({
        nomeLike: term || null,
        desLike:  term || null,
      })),
      takeUntilDestroyed(),
    ).subscribe(data => this.tasks.set(data));
  }

  ngOnInit(): void {
    this.loadFunzioniSchedule();
    this.loadPeriodTypes();
  }

  private loadFunzioniSchedule(): void {
    const term = this.searchValue();
    this.tabelleService
      .getFunzioniSchedule({ nomeLike: term || null, desLike: term || null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.tasks.set(data));
  }

  private loadPeriodTypes(): void {
    this.tabelleService.getPeriodTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.periodTypes.set(data));
  }

  // ── Validazione orari (replica logica C# FunzEschedule.aspx.cs) ──────────

  private timeToSeconds(time: string): number {
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  private isTimeValid(time: string): boolean {
    try {
      const parts = time.split(':');
      if (parts.length !== 3) return false;
      const [h, m, s] = parts.map(Number);
      if ([h, m, s].some(isNaN)) return false;
      if (h < 0 || h > 24) return false;
      if (m < 0 || m > 59) return false;
      if (s < 0 || s > 59) return false;
      if (h === 24 && (m !== 0 || s !== 0)) return false;
      return true;
    } catch { return false; }
  }

  private validateTimeRange(start: string, end: string): boolean {
    try { return this.timeToSeconds(start) <= this.timeToSeconds(end); }
    catch { return true; }
  }

  private validateForm(): boolean {
    if (!this.taskForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return false;
    }
    if (this.showScheduling) {
      const start = this.taskForm.get('futStart')?.value as string;
      const end   = this.taskForm.get('futEnd')?.value as string;
      if (start && !this.isTimeValid(start)) {
        notify('Orario "Dalle" non valido — formato HH:MM:SS', 'error', 3000);
        return false;
      }
      if (end && !this.isTimeValid(end)) {
        notify('Orario "Alle" non valido — formato HH:MM:SS', 'error', 3000);
        return false;
      }
      if (start && end && !this.validateTimeRange(start, end)) {
        notify('"Dalle" deve essere precedente ad "Alle"', 'error', 3000);
        return false;
      }
    }
    return true;
  }

  // ── Costruzione command ───────────────────────────────────────────────────

  private buildCommand(): InsertFunzioneScheduleCommand {
    const v = this.taskForm.getRawValue();
    const isAuto = !!v.futAutatt;
    return {
      traUser:       '',
      traStation:    '',
      futId:         v.futId,
      futDes:        v.futDes,
      futFunname:    v.futFunname,
      futScriptname: v.futScriptname,
      futTimeout:    v.futTimeout,
      futAutatt:     isAuto,
      futActive:     v.futActive  ?? true,
      futOffline:    v.futOffline ?? false,
      futTrace:      v.futTrace   ?? false,
      futPeriodtyp:  isAuto ? (v.futPeriodtyp || null) : null,
      futPeriod:     isAuto ? (v.futPeriod    ?? null) : null,
      futStart:      isAuto ? (v.futStart     || null) : null,
      futEnd:        isAuto ? (v.futEnd       || null) : null,
      futNamedll:    isAuto ? (v.futNamedll || null) : null,
      futClassname:  isAuto ? (v.futClassname || null) : null,
      futErrcount:   isAuto ? (v.futErrcount  ?? null) : null,
      futHosval:     isAuto ? null : (v.futHosval ?? null),
    };
  }

  // ── Popup ─────────────────────────────────────────────────────────────────

  openNewPopup(): void {
    this.taskForm.reset({
      futTrace: false, futActive: true, futOffline: false,
      futAutatt: false, futOnetimerun: false, futHosval: false,
      futLoop: false, futStart: '00:00:00', futEnd: '24:00:00', futPeriodtyp: 'D'
    });
    this.selectedFutId.set(null);
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: FunzioniScheduleResponse): void {
    this.selectedFutId.set(data.futId);
    this.taskForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: FunzioniScheduleResponse): void {
    this.selectedFutId.set(data.futId);
    this.taskForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: FunzioniScheduleResponse): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
    }
  }

  // ── Azioni CRUD ───────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.validateForm()) return;
    const command = this.buildCommand();
    this.tabelleService.insertFunzioneSchedule(command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`Task "${command.futId}" creato con successo`, 'success', 3000);
          this.closePopup();
          this.loadFunzioniSchedule();
        },
        error: () => notify('Errore durante la creazione del task', 'error', 3000),
      });
  }

  onUpdate(): void {
    if (!this.validateForm()) return;
    const command = this.buildCommand();
    this.tabelleService.updateFunzioneSchedule(command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`Task "${command.futId}" aggiornato con successo`, 'success', 3000);
          this.closePopup();
          this.loadFunzioniSchedule();
        },
        error: () => notify('Errore durante l\'aggiornamento del task', 'error', 3000),
      });
  }

  onDelete(data: FunzioniScheduleResponse): void {
    this.tabelleService.deleteFunzioneSchedule({ traUser: '127', traStation: '', futId: data.futId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`Task "${data.futId}" eliminato`, 'success', 3000);
          this.loadFunzioniSchedule();
        },
        error: () => notify('Errore durante l\'eliminazione del task', 'error', 3000),
      });
  }

  onOneTimeRun(): void {
    const id = this.selectedFutId();
    if (!id) return;
    this.tabelleService.scheduleOneTimeTask({ traUser: '127', traStation: '', futId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => notify(`Esecuzione singola avviata per "${id}"`, 'info', 3000),
        error: () => notify('Errore nell\'avvio dell\'esecuzione singola', 'error', 3000),
      });
  }

  onResetErrors(): void {
    const id = this.selectedFutId();
    if (!id) return;
    this.tabelleService.resetFunctionError({ traUser: '127', traStation: '', futId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`Errori azzerati per "${id}"`, 'success', 3000);
          this.loadFunzioniSchedule();
        },
        error: () => notify('Errore durante il reset degli errori', 'error', 3000),
      });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.taskForm.reset({
      futTrace: false, futActive: true, futOffline: false,
      futAutatt: false, futOnetimerun: false, futHosval: false,
      futLoop: false, futStart: '00:00:00', futEnd: '24:00:00', futPeriodtyp: 'D'
    });
    this.selectedFutId.set(null);
  }

  // ── Ricerca ───────────────────────────────────────────────────────────────

  onSearchChanged(e: any): void {
    const term = e.value ?? '';
    this.searchValue.set(term);
    this.searchSubject.next(term);
  }

  onRefresh(): void {
    this.loadFunzioniSchedule();
  }

  // ── Helpers griglia ───────────────────────────────────────────────────────

  // ── Traccia da riga ──
  onTraceFromRow(data: FunzioniScheduleResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'FUNZIONISHEDULE', traEntCode: data.futId }
    });
  }

  // ── Traccia da popup ──
  onTrace(): void {
    const id = this.selectedFutId();
    if (!id) return;
    this.isDetailPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'FUNZIONISHEDULE', traEntCode: id }
    });
  }

  getPeriodLabel(task: FunzioniScheduleResponse): string {
    if (!task.futAutatt) return '—';
    const type = this.periodTypes().find((p: IPeriodTypeResponse) => p.id === task.futPeriodtyp);
    return task.futPeriod
      ? `${task.futPeriod} ${type?.des ?? task.futPeriodtyp}`
      : (type?.des ?? '—');
  }
}
