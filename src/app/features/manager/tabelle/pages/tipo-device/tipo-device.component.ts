import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TabellaVarcharService, TabellaVarcharItem } from '../../services/tabella-varchar.service';
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

const TABLE = 'sys_DEVICETYPE';

@Component({
  selector: 'app-tipo-device',
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
  templateUrl: './tipo-device.component.html',
  styleUrls: ['./tipo-device.component.css'],
})
export class TipoDeviceComponent implements OnInit {

  ngOnInit(): void {
    this.search();
  }
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TabellaVarcharService);
  private readonly router = inject(Router);

  items = signal<TabellaVarcharItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'id',  caption: 'ID',          alignment: 'left', width: 200 },
    { dataField: 'des', caption: 'Descrizione',  alignment: 'left' },
  ];

  filterForm: FormGroup = this.fb.group({
    id: [null],
    des: [null],
  });

  // ── Form popup ──
  isFormPopupVisible = false;
  popupMode = signal<'add' | 'edit' | 'view'>('add');
  selectedId = signal<string | null>(null);
  isSaving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    id: [null],
    des: [null],
  });

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
    this.filterForm.reset({ id: '', des: '' });
    this.search();
  }

  resetFilters(): void {
    this.filterForm.reset({ id: '', des: '' });
    this.items.set([]);
    this.error.set(null);
  }

  openAddPopup(): void {
    this.popupMode.set('add');
    this.selectedId.set(null);
    this.saveError.set(null);
    this.editForm.reset({ id: '', des: '' });
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaVarcharItem): void {
    this.popupMode.set('edit');
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
    this.isFormPopupVisible = true;
  }

  openViewPopup(item: TabellaVarcharItem): void {
    this.popupMode.set('view');
    this.selectedId.set(item.id);
    this.saveError.set(null);
    this.editForm.reset({ id: item.id, des: item.des });
    this.isFormPopupVisible = true;
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
  }

  onTrace(id: string): void {
    this.isFormPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TABLE, traEntCode: id },
    });
  }

  save(): void {
    const v = this.editForm.value;
    if (!v.id?.trim()) {
      this.saveError.set('Il campo ID è obbligatorio');
      return;
    }
    if (!v.des?.trim()) {
      this.saveError.set('Il campo Descrizione è obbligatorio');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    const obs = this.popupMode() === 'edit'
      ? this.service.update(TABLE, v.id.trim(), v.des.trim())
      : this.service.insert(TABLE, v.id.trim(), v.des.trim());

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
