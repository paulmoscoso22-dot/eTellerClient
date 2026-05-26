import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  DxDataGridModule, DxTextBoxModule, DxCheckBoxModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { TabelleService } from '../../services/tabelle.service';
import { AuthStore } from '../../../../../features/auth/auth.store';
import {
  SempionePageShellComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
  SempioneButtonComponent,
  SempioneRowActionsComponent,
} from '../../../../../components/General';
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
    DxDataGridModule, DxTextBoxModule, DxCheckBoxModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule,
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
    SempioneButtonComponent,
    SempioneRowActionsComponent,
  ],
  templateUrl: './scheduled-tasks.component.html',
  styleUrls: ['./scheduled-tasks.component.css'],
})
export class ScheduledTasksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tabelleService = inject(TabelleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  // ── Dizionario user-friendly per campi e hint ────────────────────────────
  private readonly fieldLabelsAndHints: Record<string, { label: string; hint: string }> = {
    'FutId': {
      label: 'ID del Task',
      hint: 'Identificativo univoco del task (max 20 caratteri, es: CMSG, UPLOAD, SYNC)'
    },
    'FutDes': {
      label: 'Descrizione',
      hint: 'Cosa fa questo task? (max 50 caratteri, es: "Carica elenco messaggi")'
    },
    'FutFunname': {
      label: 'Nome Funzione',
      hint: 'Nome della funzione da eseguire (max 50 caratteri, es: "PURGE MESSAGE")'
    },
    'FutScriptname': {
      label: 'Script Name',
      hint: 'Nome dello script (max 50 caratteri)'
    },
    'FutTimeout': {
      label: 'Timeout (ms)',
      hint: 'Tempo massimo di esecuzione in millisecondi (100-10.000.000, es: 5000 = 5 secondi)'
    },
    'FutActive': {
      label: 'Task Attivo',
      hint: 'Abilita o disabilita l\'esecuzione di questo task'
    },
    'FutOffline': {
      label: 'Modalità Offline',
      hint: 'Se abilitato, il task si esegue anche senza connessione'
    },
    'FutAutatt': {
      label: 'Schedulazione Automatica',
      hint: 'Se abilitato, il task si esegue automaticamente secondo il calendario'
    },
    'FutPeriodtyp': {
      label: 'Tipo di Periodo',
      hint: 'Ogni quanto eseguire il task? (D=giorno, W=settimana, M=mese, H=ora)'
    },
    'FutPeriod': {
      label: 'Ogni Quanti Periodi',
      hint: 'Es: se Tipo=Giorno e Periodo=2, si esegue ogni 2 giorni'
    },
    'FutStart': {
      label: 'Orario di Inizio',
      hint: 'A che ora iniziare? (formato: HH:MM:SS, es: 08:30:00)'
    },
    'FutEnd': {
      label: 'Orario di Fine',
      hint: 'Fino a che ora eseguire? (formato: HH:MM:SS, es: 20:30:00)'
    },
    'FutNamedll': {
      label: 'Percorso DLL',
      hint: 'Percorso completo del file DLL (es: C:\\eTeller\\task\\MyDll.dll)'
    },
    'FutClassname': {
      label: 'Nome Classe',
      hint: 'Classe .NET da eseguire (es: MyNamespace.MyClass)'
    },
    'FutErrcount': {
      label: 'Conteggio Errori',
      hint: 'Numero di errori tollerati prima di disabilitare il task'
    },
    'FutTrace': {
      label: 'Tracciamento',
      hint: 'Se abilitato, registra ogni esecuzione del task'
    },
    'FutHosval': {
      label: 'Validazione Host',
      hint: 'Se abilitato, valida l\'host prima di eseguire'
    },
  };

  private readonly tasks = signal<FunzioniScheduleResponse[]>([]);
  private readonly searchSubject = new Subject<string>();

  readonly searchValue = signal<string>('');
  readonly popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  readonly selectedFutId = signal<string | null>(null);
  readonly isSaving = signal(false);

  readonly periodTypes = signal<IPeriodTypeResponse[]>([]);

  readonly filteredTasks = computed(() => this.tasks());

  taskForm: FormGroup = this.fb.group({
    futId:         ['', Validators.required],
    futFunname:    ['', Validators.required],
    futDes:        ['', Validators.required],
    futTimeout:    [1000, Validators.required],
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
    futPeriod:     [null, [Validators.min(1)]],
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
    
    // Normalizza futNamedll: converti backslash a forward slash
    // per evitare problemi di JSON deserialization in ASP.NET
    // Esempio: "C:\eTeller\messaggi\file.dll" → "C:/eTeller/messaggi/file.dll"
    const normalizedNamedll = v.futNamedll 
      ? v.futNamedll.replace(/\\/g, '/') 
      : null;
    
    return {
      traUser:       this.authStore.currentUser()?.userId ?? '',
      traStation:    window.location.hostname,
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
      futNamedll:    isAuto ? (normalizedNamedll || null) : null,
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

    // Fallback: se futTimeout non viene dal server, usa default
    if (!this.taskForm.get('futTimeout')?.value) {
      this.taskForm.get('futTimeout')?.setValue(1000);
    }

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
    this.isSaving.set(true);
    this.tabelleService.insertFunzioneSchedule(command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          notify(`✅ Task "${command.futId}" creato con successo`, 'success', 3000);
          this.closePopup();
          this.loadFunzioniSchedule();
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          const errorMessage = this.getDetailedErrorMessage(err);
          notify(errorMessage, 'error', 8000);
        },
      });
  }

  onUpdate(): void {
    if (!this.validateForm()) return;
    const command = this.buildCommand();
    console.log("command:", command);
    this.isSaving.set(true);
    this.tabelleService.updateFunzioneSchedule(command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          notify(`✅ Task "${command.futId}" aggiornato con successo`, 'success', 3000);
          this.closePopup();
          this.loadFunzioniSchedule();
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving.set(false);
          const errorMessage = this.getDetailedErrorMessage(err);
          notify(errorMessage, 'error', 8000);
        },
      });
  }

  onDelete(data: FunzioniScheduleResponse): void {
    this.tabelleService.deleteFunzioneSchedule({
      traUser: this.authStore.currentUser()?.userId ?? '',
      traStation: window.location.hostname,
      futId: data.futId
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`✅ Task "${data.futId}" eliminato`, 'success', 3000);
          this.loadFunzioniSchedule();
        },
        error: (err: HttpErrorResponse) => {
          const errorMessage = this.getDetailedErrorMessage(err);
          notify(errorMessage, 'error', 8000);
        },
      });
  }

  onOneTimeRun(): void {
    const id = this.selectedFutId();
    if (!id) return;
    this.tabelleService.scheduleOneTimeTask({
      traUser: this.authStore.currentUser()?.userId ?? '',
      traStation: window.location.hostname,
      futId: id
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => notify(`✅ Esecuzione singola avviata per "${id}"`, 'info', 3000),
        error: (err: HttpErrorResponse) => {
          const errorMessage = this.getDetailedErrorMessage(err);
          notify(errorMessage, 'error', 8000);
        },
      });
  }

  onResetErrors(): void {
    const id = this.selectedFutId();
    if (!id) return;
    this.tabelleService.resetFunctionError({
      traUser: this.authStore.currentUser()?.userId ?? '',
      traStation: window.location.hostname,
      futId: id
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`✅ Errori azzerati per "${id}"`, 'success', 3000);
          this.loadFunzioniSchedule();
        },
        error: (err: HttpErrorResponse) => {
          const errorMessage = this.getDetailedErrorMessage(err);
          notify(errorMessage, 'error', 8000);
        },
      });
  }

  // ── Gestione dettagliata errori con messaggi user-friendly ─────────────────

  private getDetailedErrorMessage(error: HttpErrorResponse): string {
    console.error('Backend error details:', error.error);

    // Se 400/422 con validazione
    if (error.status === 400 || error.status === 422) {
      const errorBody = error.error;

      // Se ASP.NET ritorna errori di validazione (FluentValidation)
      if (errorBody?.errors && typeof errorBody.errors === 'object') {
        const fieldErrors = Object.entries(errorBody.errors)
          .map(([field, messages]: [string, any]) => {
            const firstError = Array.isArray(messages) ? messages[0] : messages;
            return this.buildUserFriendlyError(field, firstError);
          })
          .filter(msg => msg.length > 0)
          .join('\n\n');

        if (fieldErrors.length === 0) {
          return 'Errore di validazione: verifica i dati inseriti';
        }

        return `❌ **Errori nel salvataggio:**\n\n${fieldErrors}\n\n💡 **Verifica:**\n- Tutti i campi obbligatori sono compilati?\n- I valori rientrano nei limiti?\n- Il formato è corretto?`;
      }

      // Se ASP.NET ritorna un messaggio dettagliato
      if (errorBody?.detail) {
        return `❌ Errore: ${errorBody.detail}`;
      }

      if (errorBody?.message) {
        return `❌ Errore: ${errorBody.message}`;
      }

      // Fallback per 400/422
      return '❌ Errore: I dati inseriti non sono validi.\n💡 Verifica i campi obbligatori e i formati.';
    }

    // Se 401/403
    if (error.status === 401 || error.status === 403) {
      return '🔐 Non sei autorizzato. Verifica le tue credenziali o contatta l\'amministratore.';
    }

    // Se 500
    if (error.status === 500) {
      return '⚠️ Errore del server. Contatta l\'amministratore per assistenza.';
    }

    // Fallback generico
    return `❌ Errore (${error.status}): ${error.statusText || 'Errore sconosciuto'}`;
  }

  /**
   * Converte un errore tecnico di validazione in un messaggio user-friendly
   * con label, hint ed emojis per una migliore comprensione
   */
  private buildUserFriendlyError(fieldName: string, originalMessage: string): string {
    const fieldInfo = this.fieldLabelsAndHints[fieldName];

    if (!fieldInfo || !originalMessage) {
      // Se campo o messaggio non trovato, ritorna stringa vuota
      return '';
    }

    // Estrai il tipo di errore dal messaggio tecnico
    let userMessage = '';

    if (originalMessage.includes('non può superare')) {
      const match = originalMessage.match(/(\d+)/);
      const maxChars = match ? match[1] : '?';
      userMessage = `❌ ${fieldInfo.label}: troppi caratteri (massimo ${maxChars} consentiti)`;
    } else if (originalMessage.includes('deve essere tra') || (originalMessage.includes('tra') && originalMessage.includes('e'))) {
      // Range numerico
      userMessage = `❌ ${fieldInfo.label}: valore non valido`;
    } else if (originalMessage.includes('obbligatorio') || originalMessage.includes('required')) {
      userMessage = `❌ ${fieldInfo.label}: campo obbligatorio`;
    } else if (originalMessage.includes('formato') || originalMessage.includes('format')) {
      userMessage = `❌ ${fieldInfo.label}: formato non corretto`;
    } else if (originalMessage.includes('deve essere') || originalMessage.includes('invalid')) {
      userMessage = `❌ ${fieldInfo.label}: valore non valido`;
    } else {
      // Fallback generico mantenendo il messaggio tecnico
      userMessage = `❌ ${fieldInfo.label}: ${originalMessage}`;
    }

    // Aggiungi hint per aiutare l'utente
    return `${userMessage}\n💡 ${fieldInfo.hint}`;
  }

  private translateFieldName(fieldName: string): string {
    return this.fieldLabelsAndHints[fieldName]?.label || fieldName;
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
