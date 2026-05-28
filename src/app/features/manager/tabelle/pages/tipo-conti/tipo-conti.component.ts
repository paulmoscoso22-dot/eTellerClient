import { Component, signal, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { TabellaVarcharService, TabellaVarcharItem } from '../../services/tabella-varchar.service';
import {
  SempionePageShellComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneSearchModeComponent,
  SempioneDataGridComponent,
  SempioneGridColumn,
  SempioneSimpleCrudPopupComponent,
} from '../../../../../components/General';

const TABLE = 'ST_ACCOUNTTYPE';

@Component({
  selector: 'app-tipo-conti',
  standalone: true,
  imports: [
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneSearchModeComponent,
    SempioneDataGridComponent,
    SempioneSimpleCrudPopupComponent,
  ],
  templateUrl: './tipo-conti.component.html',
  styleUrls: ['./tipo-conti.component.css'],
})
export class TipoContiComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly service = inject(TabellaVarcharService);
  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  items = signal<TabellaVarcharItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'id',  caption: 'ID',         alignment: 'left', width: 140, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'des', caption: 'Descrizione', alignment: 'left', wrap: true, allowFiltering: false, allowHeaderFiltering: true },
  ];

  isFormPopupVisible = false;
  isEditMode = signal(false);
  popupItem = signal<TabellaVarcharItem | null>(null);

  readonly doInsert = (id: string, des: string) => this.service.insert(TABLE, id, des);
  readonly doUpdate = (id: string, des: string) => this.service.update(TABLE, id, des);

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.service.search(TABLE, null, null)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.items.set(data); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        }
      });
  }

  clearGridFilters(): void { this.dataGrid?.clearFilters(); }

  openPopup(): void {
    this.isEditMode.set(false);
    this.popupItem.set(null);
    this.isFormPopupVisible = true;
  }

  openEditPopup(item: TabellaVarcharItem): void {
    this.isEditMode.set(true);
    this.popupItem.set(item);
    this.isFormPopupVisible = true;
  }

  onSaved(): void {
    const message = this.isEditMode()
      ? '✅ Tipo Conto modificato con successo'
      : '✅ Tipo Conto aggiunto con successo';
    notify(message, 'success', 3000);
    this.search();
  }

  onTrace(id?: string | number | null): void {
    this.isFormPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TABLE, traEntCode: id ?? this.popupItem()?.id },
    });
  }
}
