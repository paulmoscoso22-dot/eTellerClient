import { Component, OnDestroy, signal, DestroyRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { Subscription } from 'rxjs';
import { AuthStore } from '../../../../auth/auth.store';
import { GestioneComparentiAdeService } from '../../services/gestione-comparenti-ade.service';
import { CountryService } from '../../services/country.service';
import {
  AppearerAllResponse,
  AppearerHistoryItem,
  GetAppearerByParametersRequest,
  InsertAraRequest,
  UpdateAraRequest,
  DeleteAraRequest,
} from '../../domain/gestione-comparenti-ade.models';
import { CountryResponse } from '../../domain/country.models';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent,
  SempionePopupActionBarComponent, SempioneFieldGroupComponent,
  SempioneSearchModeComponent,
} from '../../../../../components/General';

@Component({
  selector: 'app-gestione-comparenti-ade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxTextBoxModule, DxDateBoxModule, DxSelectBoxModule, DxCheckBoxModule, DxLoadIndicatorModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent, SempioneFieldGroupComponent,
    SempioneSearchModeComponent,
  ],
  templateUrl: './gestione-comparenti-ade.component.html',
  styleUrls: ['./gestione-comparenti-ade.component.css'],
})
export class GestioneComparentiAdeComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(GestioneComparentiAdeService);
  private readonly countryService = inject(CountryService);
  private readonly authStore = inject(AuthStore);

  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  private subscription: Subscription | null = null;

  readonly boolHeaderFilter = [
    { text: 'Sì', value: true },
    { text: 'No', value: false },
  ];

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'araName',        caption: 'Nome e cognome',  alignment: 'left',                     allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'araRepresents',  caption: 'Rappresentanza',  alignment: 'left',   width: 130,        allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'araBirthdate',   caption: 'Data nascita',    alignment: 'center', width: 155,        allowFiltering: false, allowHeaderFiltering: true, dataType: 'date',    format: 'dd.MM.yyyy', headerFilterType: 'calendar', cssClass: 'col-date' },
    { dataField: 'araNationality', caption: 'Nazionalità',     alignment: 'left',   width: 120,        allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'araAddress',     caption: 'Domicilio',       alignment: 'left',   width: 160,        allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'araIddocnum',    caption: 'Nr doc identità', alignment: 'left',   width: 155,        allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'araDocexpdate',  caption: 'Scad. doc.',      alignment: 'center', width: 130,        allowFiltering: false, allowHeaderFiltering: true, dataType: 'date',    format: 'dd.MM.yyyy', headerFilterType: 'calendar', cssClass: 'col-date' },
    { dataField: 'araRecComplete', caption: 'Completo',        alignment: 'center', width: 130, type: 'bool-text', allowFiltering: false, allowHeaderFiltering: true, dataType: 'boolean', headerFilterDataSource: this.boolHeaderFilter },
  ];

  readonly historyColumns: SempioneGridColumn[] = [
    { dataField: 'hisDate',        caption: 'Data modifica',  alignment: 'center', width: 140, dataType: 'datetime', format: 'dd.MM.yyyy HH:mm' },
    { dataField: 'araName',        caption: 'Nome e cognome', alignment: 'left' },
    { dataField: 'araRepresents',  caption: 'Rappresentanza', alignment: 'left',   width: 120 },
    { dataField: 'araBirthdate',   caption: 'Data nascita',   alignment: 'center', width: 105, dataType: 'date', format: 'dd.MM.yyyy' },
    { dataField: 'araNationality', caption: 'Nazionalità',    alignment: 'left',   width: 110 },
    { dataField: 'araAddress',     caption: 'Domicilio',      alignment: 'left',   width: 140 },
    { dataField: 'araIddocnum',    caption: 'Nr doc',         alignment: 'left',   width: 110 },
    { dataField: 'araDocexpdate',  caption: 'Scad. doc.',     alignment: 'center', width: 100, dataType: 'date', format: 'dd.MM.yyyy' },
    { dataField: 'araRecComplete', caption: 'Completo',       alignment: 'center', width: 80,  type: 'bool-text' },
  ];

  // ── Grid data ──
  appearers = signal<AppearerAllResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ── Lookup data ──
  countries = signal<CountryResponse[]>([]);

  // ── Form popup (add / edit / view) ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
  isViewMode = signal(false);
  selectedAraId = signal<number | null>(null);
  isSaving = signal(false);
  isLoadingForm = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    araName: [''],
    araRepresents: [''],
    araBirthdate: [null],
    araBirthplace: [''],
    araNationality: [''],
    araAddress: [''],
    araIddocnum: [''],
    araDocexpdate: [null],
    araRecComplete: [false],
    araIsupdated: [false],
  });

  // ── History popup ──
  isHistoryPopupVisible = false;
  historyItems = signal<AppearerHistoryItem[]>([]);
  isLoadingHistory = signal(false);
  historyAraId = signal<number | null>(null);

  constructor() {
    this.countryService.getAllCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.countries.set(data));

    this.loadAll();
  }

  loadAll(): void {
    const request: GetAppearerByParametersRequest = {
      AraName: '',
      AraBirthdate: null,
      AraRecComplete: false,
      ShowExpiredRecords: true,
      RecordValidityDays: 365,
    };
    this.destroy();
    this.isLoading.set(true);
    this.error.set(null);
    this.subscription = this.service.getByParameters(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.appearers.set(data ?? []); this.isLoading.set(false); },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei comparenti');
          this.isLoading.set(false);
        }
      });
  }

  clearGridFilters(): void {
    this.dataGrid?.clearFilters();
  }

  // ── Form popup ──

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.isViewMode.set(false);
    this.selectedAraId.set(null);
    this.saveError.set(null);
    this.editForm.reset({
      araName: '', araRepresents: '', araBirthdate: null, araBirthplace: '',
      araNationality: '', araAddress: '', araIddocnum: '', araDocexpdate: null,
      araRecComplete: false, araIsupdated: false,
    });
    this.isFormPopupVisible = true;
  }

  openViewPopup(row: AppearerAllResponse): void {
    this.isEditMode.set(false);
    this.isViewMode.set(true);
    this.selectedAraId.set(row.araId);
    this.saveError.set(null);
    this.isLoadingForm.set(true);
    this.isFormPopupVisible = true;
    this.loadFormData(row.araId);
  }

  openEditPopup(row: AppearerAllResponse): void {
    this.isEditMode.set(true);
    this.isViewMode.set(false);
    this.selectedAraId.set(row.araId);
    this.saveError.set(null);
    this.isLoadingForm.set(true);
    this.isFormPopupVisible = true;
    this.loadFormData(row.araId);
  }

  private loadFormData(araId: number): void {
    this.service.getByAraId(araId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.editForm.reset({
            araName:        data.araName        ?? '',
            araRepresents:  data.araRepresents  ?? '',
            araBirthdate:   data.araBirthdate   ? new Date(data.araBirthdate)  : null,
            araBirthplace:  data.araBirthplace  ?? '',
            araNationality: data.araNationality ?? '',
            araAddress:     data.araAddress     ?? '',
            araIddocnum:    data.araIddocnum    ?? '',
            araDocexpdate:  data.araDocexpdate  ? new Date(data.araDocexpdate) : null,
            araRecComplete: data.araRecComplete ?? false,
            araIsupdated:   data.araIsupdated   ?? false,
          });
          this.isLoadingForm.set(false);
        },
        error: () => {
          this.saveError.set('Errore nel caricamento dei dati');
          this.isLoadingForm.set(false);
        }
      });
  }

  closeFormPopup(): void {
    this.isFormPopupVisible = false;
    this.isViewMode.set(false);
  }

  save(): void {
    const v = this.editForm.value;
    if (!v.araName?.trim()) {
      this.saveError.set('Il campo "Nome e cognome" è obbligatorio');
      return;
    }
    this.isSaving.set(true);
    this.saveError.set(null);

    if (this.isEditMode()) {
      const req: UpdateAraRequest = {
        traUser:        this.authStore.currentUser()?.userId ?? '',
        traStation:     window.location.hostname,
        AraId:          this.selectedAraId()!,
        AraName:        v.araName,
        AraBirthdate:   v.araBirthdate  ? this.toDateString(v.araBirthdate) : null,
        AraBirthplace:  v.araBirthplace || null,
        AraNationality: v.araNationality || null,
        AraAddress:     v.araAddress    || null,
        AraIddocnum:    v.araIddocnum   || null,
        AraDocexpdate:  v.araDocexpdate ? this.toDateString(v.araDocexpdate) : null,
        AraRepresents:  v.araRepresents || null,
        AraRecComplete: v.araRecComplete ?? false,
        AraIsupdated:   v.araIsupdated  ?? false,
      };
      this.service.updateAra(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { notify('Comparente aggiornato con successo', 'success', 3000); this.isSaving.set(false); this.isFormPopupVisible = false; this.loadAll(); },
        error: (err: any) => { this.isSaving.set(false); this.saveError.set(err.message || 'Errore durante il salvataggio'); }
      });
    } else {
      const req: InsertAraRequest = {
        traUser:        this.authStore.currentUser()?.userId ?? '',
        traStation:     window.location.hostname,
        AraRecdate:     new Date(),
        AraName:        v.araName,
        AraBirthdate:   v.araBirthdate  ? this.toDateString(v.araBirthdate) : null,
        AraBirthplace:  v.araBirthplace || null,
        AraNationality: v.araNationality || null,
        AraAddress:     v.araAddress    || null,
        AraIddocnum:    v.araIddocnum   || null,
        AraDocexpdate:  v.araDocexpdate ? this.toDateString(v.araDocexpdate) : null,
        AraRepresents:  v.araRepresents || null,
        AraRecComplete: v.araRecComplete ?? false,
      };
      this.service.insertAra(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => { notify('Comparente inserito con successo', 'success', 3000); this.isSaving.set(false); this.isFormPopupVisible = false; this.loadAll(); },
        error: (err: any) => { this.isSaving.set(false); this.saveError.set(err.message || 'Errore durante il salvataggio'); }
      });
    }
  }

  // ── History popup ──

  openHistoryPopup(row: AppearerAllResponse): void {
    this.historyAraId.set(row.araId);
    this.historyItems.set([]);
    this.isLoadingHistory.set(true);
    this.isHistoryPopupVisible = true;
    this.service.getHistory(row.araId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.historyItems.set(data ?? []); this.isLoadingHistory.set(false); },
        error: () => { this.isLoadingHistory.set(false); }
      });
  }

  closeHistoryPopup(): void {
    this.isHistoryPopupVisible = false;
  }

  // ── Delete ──

  openDeletePopup(row: AppearerAllResponse): void {
    const confirmed = confirm(`Eliminare il comparente "${row.araName}"?`);
    if (!confirmed) return;

    const req: DeleteAraRequest = {
      traUser:    this.authStore.currentUser()?.userId ?? '',
      traStation: window.location.hostname,
      AraId:      row.araId,
    };

    this.service.deleteAra(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notify('Comparente eliminato con successo', 'success', 3000);
          this.loadAll();
        },
        error: () => {
          notify('Errore durante l\'eliminazione', 'error', 3000);
        }
      });
  }

  // ── Utils ──

  private toDateString(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnDestroy(): void { this.destroy(); }

  private destroy(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
