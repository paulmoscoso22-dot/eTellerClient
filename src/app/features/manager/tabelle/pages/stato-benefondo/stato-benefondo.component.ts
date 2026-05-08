import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxNumberBoxModule,
  DxButtonModule,
  DxPopupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { TabellaIntService, TabellaIntItem } from '../../services/tabella-int.service';

const TABLE = 'ST_BEFSTATUS';

@Component({
  selector: 'app-stato-benefondo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxValidatorModule,
  ],
  templateUrl: './stato-benefondo.component.html',
  styleUrls: ['./stato-benefondo.component.css'],
})
export class StatoBenefondoComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TabellaIntService);
  private readonly router = inject(Router);
  
  items = signal<TabellaIntItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  filterForm: FormGroup = this.fb.group({
    id: [null],
    des: [null],
  });
  
  // ── Form popup ──
  isFormPopupVisible = false;
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  selectedId = signal<number | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);
  
  editForm: FormGroup = this.fb.group({
    id: [null, Validators.required],
    des: [null, [Validators.required, Validators.maxLength(50)]],
  });
  
  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const { id, des } = this.filterForm.value;
    this.isLoading.set(true);
    this.error.set(null);

    this.service.search(TABLE, id ?? null, des ?? null)
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
    this.filterForm.reset({ id: null, des: null });
    this.search();
  }

  resetFilters(): void {
    this.filterForm.reset({ id: null, des: null });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.popupMode.set('new');
    this.selectedId.set(null);
    this.saveError.set(null);
    this.editForm.reset({ id: null, des: null });
    this.isFormPopupVisible = true;
  }

  openViewPopup(item: TabellaIntItem): void {
    this.popupMode.set('view');
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaIntItem): void {
    this.popupMode.set('edit');
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  onTrace(): void {
    const id = this.editForm.get('id')?.value;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TABLE, traEntCode: id },
    });
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
    const obs = this.popupMode() === 'edit'
      ? this.service.update(TABLE, idNum, v.des.trim())
      : this.service.insert(TABLE, idNum, v.des.trim());

    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result: boolean) => {
        this.isSaving.set(false);
        if (result) {
          this.isFormPopupVisible = false;
          const action = this.popupMode() === 'edit' ? 'aggiornato' : 'aggiunto';
          notify(`Stato bene fondo "${idNum}" ${action} con successo`, 'success', 3000);
          this.search();
        } else {
          this.saveError.set('Operazione non riuscita. Il codice potrebbe essere già presente.');
          notify('Operazione non riuscita. Il codice potrebbe essere già presente.', 'error', 4000);
        }
      },
      error: (err: any) => {
        this.isSaving.set(false);
        const msg = err.message || 'Errore durante il salvataggio';
        this.saveError.set(msg);
        notify(msg, 'error', 4000);
      }
    });
  }
}
