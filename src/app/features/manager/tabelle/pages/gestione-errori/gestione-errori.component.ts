import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxTextBoxModule, DxSelectBoxModule,
  DxCheckBoxModule, DxTextAreaModule,
} from 'devextreme-angular';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { GestioneErroriService } from '../../services/gestione-errori.service';
import {
  IGestioneErroriItemResponse,
  IGestioneErroriUpsertRequest,
  IForceCodeResponse,
} from '../../models/gestione-errori.models';
import {
  SempionePageShellComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,

  SempioneAlertComponent,
  SempioneDataGridComponent,
  SempioneGridColumn,
  SempioneConfirmDeleteComponent,
  SempioneCrudToolbarActionsComponent,
} from '../../../../../components/General';

const ENTNAME = 'ST_ERRORCODE';

@Component({
  selector: 'app-gestione-errori',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  
    SempioneAlertComponent,
    SempioneDataGridComponent,
    SempioneConfirmDeleteComponent,
    SempioneCrudToolbarActionsComponent,
  ],
  templateUrl: './gestione-errori.component.html',
  styleUrls: ['./gestione-errori.component.css'],
})
export class GestioneErroriComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly gestioneErroriService = inject(GestioneErroriService);
  private readonly router = inject(Router);

  items = signal<IGestioneErroriItemResponse[]>([]);
  forceCodes = signal<IForceCodeResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filterForm: FormGroup = this.fb.group({
    errId: [null],
    testoLike: [null],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  selectedErrId = signal('');
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    errId:      ['', [Validators.required, Validators.maxLength(25)]],
    errTyp:     [null],
    errDescIt:  ['', Validators.required],
    errDescEn:  [null],
    errDescFr:  [null],
    errDescDe:  [null],
    errCanFlag: [false],
    errConFlag: [false],
    errForFlag: [false],
    errFocId:   [null],
    errDesSol:  [null],
  });

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'errId',     caption: 'Codice',      alignment: 'left',   width: 140 },
    { dataField: 'errTyp',    caption: 'Tipo',        alignment: 'center', width: 60  },
    { dataField: 'errDescIt', caption: 'Descrizione', alignment: 'left', wrap: true   },
  ];

  readonly errTypOptions = [
    { id: 'S', label: 'S - System' },
    { id: 'W', label: 'W - Warning' },
    { id: 'E', label: 'E - Error' },
    { id: 'C', label: 'C - Critical' },
  ];

  // ── Confirm delete popup ──
  isConfirmDeleteVisible = false;
  itemToDelete = signal<IGestioneErroriItemResponse | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.loadForceCodes();
    this.loadAll();
  }

  private loadForceCodes(): void {
    this.gestioneErroriService.getForceCodes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.forceCodes.set(data) });
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.gestioneErroriService.getAll({ errId: null, testoLike: null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        },
      });
  }

  search(): void {
    const { errId, testoLike } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);

    this.gestioneErroriService.getAll({ errId: errId ?? null, testoLike: testoLike ?? null })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        },
      });
  }

  showAll(): void {
    this.filterForm.reset({ errId: null, testoLike: null });
    this.loadAll();
  }

  resetFilters(): void {
    this.filterForm.reset({ errId: null, testoLike: null });
    this.items.set([]);
    this.error.set(null);
  }

  get isFocIdEnabled(): boolean {
    return !!this.editForm.get('errForFlag')?.value;
  }

  openAddPopup(): void {
    this.popupMode.set('new');
    this.selectedErrId.set('');
    this.saveError.set(null);
    this.editForm.reset({
      errId: '', errTyp: null, errDescIt: '', errDescEn: null,
      errDescFr: null, errDescDe: null,
      errCanFlag: false, errConFlag: false, errForFlag: false,
      errFocId: null, errDesSol: null,
    });
    this.editForm.get('errId')!.enable();
    this.isFormPopupVisible = true;
  }

  openViewPopup(item: IGestioneErroriItemResponse): void {
    this.popupMode.set('view');
    this.selectedErrId.set(item.errId);
    this.saveError.set(null);
    this.editForm.reset({
      errId:      item.errId,
      errTyp:     item.errTyp,
      errDescIt:  item.errDescIt ?? '',
      errDescEn:  item.errDescEn,
      errDescFr:  item.errDescFr,
      errDescDe:  item.errDescDe,
      errCanFlag: item.errCanFlag,
      errConFlag: item.errConFlag,
      errForFlag: item.errForFlag,
      errFocId:   item.errFocId,
      errDesSol:  item.errDesSol,
    });
    this.editForm.get('errId')!.disable();
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: IGestioneErroriItemResponse): void {
    this.popupMode.set('edit');
    this.selectedErrId.set(item.errId);
    this.saveError.set(null);
    this.editForm.reset({
      errId:      item.errId,
      errTyp:     item.errTyp,
      errDescIt:  item.errDescIt ?? '',
      errDescEn:  item.errDescEn,
      errDescFr:  item.errDescFr,
      errDescDe:  item.errDescDe,
      errCanFlag: item.errCanFlag,
      errConFlag: item.errConFlag,
      errForFlag: item.errForFlag,
      errFocId:   item.errFocId,
      errDesSol:  item.errDesSol,
    });
    this.editForm.get('errId')!.disable();
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    if (!this.validateSaveForm()) return;

    const payload = this.buildPayload();
    const isEdit = this.popupMode() === 'edit';

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs: Observable<unknown> = isEdit
      ? this.gestioneErroriService.update(payload)
      : this.gestioneErroriService.insert(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.handleSaveSuccess(isEdit, payload.errId),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private validateSaveForm(): boolean {
    const v = this.editForm.getRawValue();
    if (!v.errId?.trim()) {
      this.saveError.set('Il campo Codice Errore è obbligatorio');
      return false;
    }
    if (v.errId.trim().length > 25) {
      this.saveError.set('Il campo Codice Errore non può superare 25 caratteri');
      return false;
    }
    if (!v.errDescIt?.trim()) {
      this.saveError.set('La Descrizione IT è obbligatoria');
      return false;
    }
    return true;
  }

  private buildPayload(): IGestioneErroriUpsertRequest {
    const v = this.editForm.getRawValue();
    return {
      errId:      v.errId?.trim() ?? '',
      errTyp:     v.errTyp ?? null,
      errDescIt:  v.errDescIt?.trim() ?? '',
      errDescEn:  v.errDescEn?.trim() || null,
      errDescFr:  v.errDescFr?.trim() || null,
      errDescDe:  v.errDescDe?.trim() || null,
      errCanFlag: !!v.errCanFlag,
      errConFlag: !!v.errConFlag,
      errForFlag: !!v.errForFlag,
      errFocId:   v.errForFlag ? (v.errFocId ?? null) : null,
      errDesSol:  v.errDesSol?.trim() || null,
    };
  }

  private handleSaveSuccess(isEdit: boolean, id: string): void {
    this.isSaving.set(false);
    this.isFormPopupVisible = false;
    notify(
      isEdit
        ? `Errore "${id}" aggiornato con successo`
        : `Errore "${id}" inserito con successo`,
      'success',
      3000
    );
    this.loadAll();
  }

  private handleSaveError(err: any): void {
    this.isSaving.set(false);
    const msg = err?.message || 'Errore durante il salvataggio';
    notify(msg, 'error', 4000);
    this.saveError.set(msg);
  }

  requestDelete(item: IGestioneErroriItemResponse): void {
    this.itemToDelete.set(item);
    this.isConfirmDeleteVisible = true;
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible = false;
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.isConfirmDeleteVisible = false;
    this.gestioneErroriService.delete(item.errId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify(`Errore "${item.errId}" eliminato con successo`, 'success', 3000);
          this.loadAll();
        },
        error: (err: any) => notify(err?.message || 'Errore durante la cancellazione', 'error', 4000),
      });
  }

  openTrace(item: IGestioneErroriItemResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: ENTNAME,
        traEntCode: item.errId,
      },
    });
  }
}
