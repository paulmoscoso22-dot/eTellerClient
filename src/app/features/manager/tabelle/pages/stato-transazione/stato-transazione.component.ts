import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxButtonModule,
  DxPopupModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabellaIntService, TabellaIntItem } from '../../services/tabella-int.service';

const TABLE = 'sys_TRX_STATUS';

@Component({
  selector: 'app-stato-transazione',
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
  templateUrl: './stato-transazione.component.html',
  styleUrls: ['./stato-transazione.component.css'],
})
export class StatoTransazioneComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TabellaIntService);

  items = signal<TabellaIntItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filterForm: FormGroup = this.fb.group({
    id: [''],
    des: [''],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    id: [null],
    des: [''],
  });

  search(): void {
    const { id, des } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);

    this.service.search(TABLE, id ?? '', des ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        }
      });
  }

  showAll(): void {
    this.filterForm.reset({ id: '', des: '' });
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

  save(): void {
    const v = this.editForm.value;
    if (v.id === null || v.id === undefined || isNaN(Number(v.id))) {
      this.saveError.set('Il campo ID è obbligatorio e deve essere un numero intero');
      return;
    }
    if (!v.des?.trim()) {
      this.saveError.set('Il campo Descrizione è obbligatorio');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const idNum = Number(v.id);
    const obs = this.isEditMode()
      ? this.service.update(TABLE, idNum, v.des.trim())
      : this.service.insert(TABLE, idNum, v.des.trim());

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => {
        this.isSaving.set(false);
        if (result) {
          this.isFormPopupVisible = false;
          this.search();
        } else {
          this.saveError.set('Operazione non riuscita. Il codice potrebbe essere già presente.');
        }
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.saveError.set(err.message || 'Errore durante il salvataggio');
      }
    });
  }
}
