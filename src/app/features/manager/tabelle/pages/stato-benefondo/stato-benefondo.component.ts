import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabellaIntService, TabellaIntItem } from '../../services/tabella-int.service';
import {
  SempionePageHeaderComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempioneDataGridComponent,
  SempioneGridColumn,
  SempioneIdDesFilterComponent,
  SempioneCrudToolbarActionsComponent,
  SempioneSimpleCrudPopupComponent,
} from '../../../../../components/General';

const TABLE = 'ST_BEFSTATUS';

@Component({
  selector: 'app-stato-benefondo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SempionePageHeaderComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempioneDataGridComponent,
    SempioneIdDesFilterComponent,
    SempioneCrudToolbarActionsComponent,
    SempioneSimpleCrudPopupComponent,
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

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'id',  caption: 'ID',          alignment: 'left', width: 100 },
    { dataField: 'des', caption: 'Descrizione',  alignment: 'left', wrap: true },
  ];

  filterForm: FormGroup = this.fb.group({ id: [null], des: [null] });

  isFormPopupVisible = false;
  popupMode = signal<'new' | 'edit' | 'view'>('new');
  popupItem = signal<TabellaIntItem | null>(null);

  readonly doInsert = (id: string, des: string) => this.service.insert(TABLE, +id, des);
  readonly doUpdate = (id: string, des: string) => this.service.update(TABLE, +id, des);

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
    this.popupItem.set(null);
    this.isFormPopupVisible = true;
  }

  openViewPopup(item: TabellaIntItem): void {
    this.popupMode.set('view');
    this.popupItem.set(item);
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaIntItem): void {
    this.popupMode.set('edit');
    this.popupItem.set(item);
    this.isFormPopupVisible = true;
  }

  onTrace(id?: string | number | null): void {
    this.isFormPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TABLE, traEntCode: id ?? this.popupItem()?.id },
    });
  }
}
