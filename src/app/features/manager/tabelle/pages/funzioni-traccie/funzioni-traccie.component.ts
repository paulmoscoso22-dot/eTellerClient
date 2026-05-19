import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { FunzioniTraccieService } from '../../services/funzioni-traccie.service';
import { IFunzioniTraccieItemResponse, IFunzioniTraccieUpsertRequest } from '../../models/funzioni-traccie.models';
import {
  SempionePageHeaderComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempioneDataGridComponent,
  SempioneGridColumn,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
  SempioneButtonComponent,
  SempioneAlertComponent,
} from '../../../../../components/General';

const NOME_TABELLA = 'ST_TRACE_FUNCTION';

@Component({
  selector: 'app-funzioni-traccie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule,
    SempionePageHeaderComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempioneDataGridComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
    SempioneButtonComponent,
    SempioneAlertComponent,
  ],
  templateUrl: './funzioni-traccie.component.html',
  styleUrls: ['./funzioni-traccie.component.css'],
})
export class FunzioniTraccieComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly funzioniTraccieService = inject(FunzioniTraccieService);
  private readonly router = inject(Router);

  items = signal<IFunzioniTraccieItemResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'id',  caption: 'Codice',       alignment: 'left', width: 140 },
    { dataField: 'des', caption: 'Descrizione',   alignment: 'left' },
  ];

  filterForm: FormGroup = this.fb.group({
    id: [null],
    desLike: [null],
  });

  isFormPopupVisible = false;
  isEditMode = signal(false);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    id:  ['', [Validators.required, Validators.maxLength(5)]],
    des: ['', Validators.required],
  });

  constructor() {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.funzioniTraccieService.getAll(null, null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => { this.error.set(err.message || 'Errore nel recupero dei dati'); this.isLoading.set(false); },
      });
  }

  search(): void {
    const { id, desLike } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);
    this.funzioniTraccieService.getAll(id ?? null, desLike ?? null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => { this.error.set(err.message || 'Errore nel recupero dei dati'); this.isLoading.set(false); },
      });
  }

  showAll(): void {
    this.filterForm.reset({ id: null, desLike: null });
    this.loadAll();
  }

  resetFilters(): void {
    this.filterForm.reset({ id: null, desLike: null });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.saveError.set(null);
    this.editForm.reset({ id: '', des: '' });
    this.editForm.get('id')!.enable();
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: IFunzioniTraccieItemResponse): void {
    this.isEditMode.set(true);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des ?? '' });
    this.editForm.get('id')!.disable();
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  save(): void {
    if (!this.validateSaveForm()) return;
    const payload = this.buildPayload();
    const isEdit = this.isEditMode();

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = isEdit
      ? this.funzioniTraccieService.update(payload)
      : this.funzioniTraccieService.insert(payload);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => this.handleSaveResult(result, isEdit, payload.id),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private validateSaveForm(): boolean {
    const v = this.editForm.getRawValue();
    if (!v.id?.trim()) {
      this.saveError.set('Il campo Codice è obbligatorio');
      return false;
    }
    if (v.id.trim().length > 5) {
      this.saveError.set('Il campo Codice non può superare 5 caratteri');
      return false;
    }
    if (!v.des?.trim()) {
      this.saveError.set('Il campo Descrizione è obbligatorio');
      return false;
    }
    return true;
  }

  private buildPayload(): IFunzioniTraccieUpsertRequest {
    const v = this.editForm.getRawValue();
    return { nomeTabella: NOME_TABELLA, id: v.id.trim(), des: v.des.trim() };
  }

  private handleSaveResult(result: boolean, isEdit: boolean, id: string): void {
    this.isSaving.set(false);
    if (result) {
      this.isFormPopupVisible = false;
      notify(isEdit ? `Funzione traccia "${id}" aggiornata` : `Funzione traccia "${id}" inserita`, 'success', 3000);
      this.loadAll();
    } else {
      const msg = 'Operazione non riuscita. Il codice potrebbe essere già presente.';
      notify(msg, 'error', 4000);
      this.saveError.set(msg);
    }
  }

  private handleSaveError(err: any): void {
    this.isSaving.set(false);
    const msg = err?.message || 'Errore durante il salvataggio';
    notify(msg, 'error', 4000);
    this.saveError.set(msg);
  }

  openTrace(item: IFunzioniTraccieItemResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: NOME_TABELLA, traEntCode: item.id },
    });
  }
}
