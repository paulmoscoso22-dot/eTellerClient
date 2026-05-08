import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxButtonModule,
  DxPopupModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { TabellaVarcharService, TabellaVarcharItem } from '../../services/tabella-varchar.service';

const TABLE = 'ST_TABLENAME';

@Component({
  selector: 'app-nomi-tabelle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxButtonModule,
    DxPopupModule,
  ],
  templateUrl: './nomi-tabelle.component.html',
  styleUrls: ['./nomi-tabelle.component.css'],
})
export class NomiTabelleComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly service = inject(TabellaVarcharService);

  items = signal<TabellaVarcharItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filterForm: FormGroup = this.fb.group({
    id: [null],
    des: [null],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    id: [null],
    des: [null],
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
    this.filterForm.reset({ id: null, des: null });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.saveError.set(null);
    this.editForm.reset({ id: null, des: null });
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaVarcharItem): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
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
      ? this.service.update(TABLE, payload.id, payload.des)
      : this.service.insert(TABLE, payload.id, payload.des);

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => this.handleSaveResult(result, isEdit, payload.id),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  onTrace(): void {
    this.router.navigate(['/trace'], {
      queryParams: {
        ENTNAME: TABLE,
        traEntCode: this.selectedId(),
      },
    });
  }

  private handleSearchResult(data: TabellaVarcharItem[]): void {
    this.items.set(data);
    this.isLoading.set(false);
  }

  private handleSearchError(err: any): void {
    this.error.set(err.message || 'Errore nel recupero dei dati');
    this.isLoading.set(false);
  }

  private validateSaveForm(): boolean {
    const v = this.editForm.value;
    if (!v.id?.trim()) {
      this.saveError.set('Il campo ID è obbligatorio');
      return false;
    }
    if (!v.des?.trim()) {
      this.saveError.set('Il campo Descrizione è obbligatorio');
      return false;
    }
    return true;
  }

  private buildPayload(): { id: string; des: string } {
    const v = this.editForm.value;
    return { id: v.id.trim(), des: v.des.trim() };
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

