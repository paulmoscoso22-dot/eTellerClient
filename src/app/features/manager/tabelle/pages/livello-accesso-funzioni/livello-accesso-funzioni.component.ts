import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxButtonModule,
  DxPopupModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { TabellaIntService, TabellaIntItem } from '../../services/tabella-int.service';

const TABLE = 'ST_FUNACCTYP';

@Component({
  selector: 'app-livello-accesso-funzioni',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxButtonModule,
    DxPopupModule,
  ],
  templateUrl: './livello-accesso-funzioni.component.html',
  styleUrls: ['./livello-accesso-funzioni.component.css'],
})
export class LivelloAccessoFunzioniComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TabellaIntService);

  items = signal<TabellaIntItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filterForm: FormGroup = this.fb.group({
    id: [null],
    des: [null]
  });

  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    id: [null],
    des: [null]
  });

  ngOnInit(): void {
    this.showAll();
  }

  search(): void {
    const { id, des } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);

    this.service.search(TABLE, id ?? null, des ?? null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.handleSearchResult(data),
        error: (err: any) => this.handleSearchError(err),
      });
  }

  showAll(): void {
    this.filterForm.reset({ id: null, des: null });
    this.search();
  }

  resetFilters(): void {
    this.filterForm.reset({ id: '', des: '' });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.saveError.set(null);
    this.editForm.reset({ id: null, des: '' });
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaIntItem): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  onTrace(): void {
    const id = this.selectedId() ?? this.editForm.get('id')?.value;
    if (id === null || id === undefined || id === '') {
      notify('Selezionare un record da tracciare', 'warning', 3000);
      return;
    }

    this.router.navigate(['/trace'], {
      queryParams: {
        ENTNAME: TABLE,
        traEntCode: id,
      },
    });
  }

  save(): void {
    if (!this.validateSaveForm()) return;

    const payload = this.buildPayload();
    const isEdit = this.isEditMode();
    const label = `${payload.id} / ${payload.des}`;

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = isEdit
      ? this.service.update(TABLE, payload.id, payload.des)
      : this.service.insert(TABLE, payload.id, payload.des);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => this.handleSaveResult(result, isEdit, label),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private handleSearchResult(data: TabellaIntItem[]): void {
    this.items.set(data);
    this.isLoading.set(false);
  }

  private handleSearchError(err: any): void {
    this.error.set(err.message || 'Errore nel recupero dei dati');
    this.isLoading.set(false);
  }

  private validateSaveForm(): boolean {
    const v = this.editForm.value;
    if (v.id === null || v.id === undefined || isNaN(Number(v.id))) {
      this.saveError.set('Il campo ID è obbligatorio e deve essere un numero intero');
      return false;
    }
    if (!v.des?.trim()) {
      this.saveError.set('Il campo Descrizione è obbligatorio');
      return false;
    }
    return true;
  }

  private buildPayload(): { id: number; des: string } {
    const v = this.editForm.value;
    return { id: Number(v.id), des: v.des.trim() };
  }

  private handleSaveResult(result: boolean, isEdit: boolean, label: string): void {
    this.isSaving.set(false);
    if (result) {
      this.isFormPopupVisible = false;
      notify(
        isEdit
          ? `Record "${label}" aggiornato con successo`
          : `Record "${label}" inserito con successo`,
        'success',
        3000
      );
      this.search();
    } else {
      notify('Operazione non riuscita. Verificare i dati inseriti.', 'error', 4000);
      this.saveError.set('Operazione non riuscita.');
    }
  }

  private handleSaveError(err: any): void {
    this.isSaving.set(false);
    const msg = err.message || 'Errore durante il salvataggio';
    notify(msg, 'error', 4000);
    this.saveError.set(msg);
  }
}

