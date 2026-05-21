import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DxDataGridModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxButtonModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
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

@Component({
  selector: 'app-gestione-comparenti-ade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
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

  private subscription: Subscription | null = null;

  // ── Grid data ──
  appearers = signal<AppearerAllResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ── Lookup data ──
  countries = signal<CountryResponse[]>([]);

  // ── Filter form ──
  filterForm: FormGroup = this.fb.group({
    araName: [''],
    araBirthdate: [null],
    araRecComplete: [false],
    showExpiredRecords: [true],
  });

  // ── Form popup (add / edit) ──
  isFormPopupVisible = false;
  isEditMode = signal(false);
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
  }

  search(): void {
    const v = this.filterForm.value;
    const request: GetAppearerByParametersRequest = {
      AraName: v.araName ?? '',
      AraBirthdate: v.araBirthdate ? this.toDateString(v.araBirthdate) : null,
      AraRecComplete: v.araRecComplete ?? false,
      ShowExpiredRecords: v.showExpiredRecords ?? true,
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

  resetFilters(): void {
    this.filterForm.reset({ araName: '', araBirthdate: null, araRecComplete: false, showExpiredRecords: true });
    this.appearers.set([]);
    this.error.set(null);
  }

  // ── Form popup ──

  openAddPopup(): void {
    this.isEditMode.set(false);
    this.selectedAraId.set(null);
    this.saveError.set(null);
    this.editForm.reset({
      araName: '', araRepresents: '', araBirthdate: null, araBirthplace: '',
      araNationality: '', araAddress: '', araIddocnum: '', araDocexpdate: null,
      araRecComplete: false, araIsupdated: false,
    });
    this.isFormPopupVisible = true;
  }

  openEditPopup(row: AppearerAllResponse): void {
    this.isEditMode.set(true);
    this.selectedAraId.set(row.araId);
    this.saveError.set(null);
    this.isLoadingForm.set(true);
    this.isFormPopupVisible = true;

    this.service.getByAraId(row.araId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.editForm.reset({
            araName:       data.araName       ?? '',
            araRepresents: data.araRepresents ?? '',
            araBirthdate:  data.araBirthdate  ? new Date(data.araBirthdate) : null,
            araBirthplace: data.araBirthplace ?? '',
            araNationality:data.araNationality?? '',
            araAddress:    data.araAddress    ?? '',
            araIddocnum:   data.araIddocnum   ?? '',
            araDocexpdate: data.araDocexpdate ? new Date(data.araDocexpdate) : null,
            araRecComplete:data.araRecComplete ?? false,
            araIsupdated:  data.araIsupdated  ?? false,
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
        next: () => { notify('Comparente aggiornato con successo', 'success', 3000); this.isSaving.set(false); this.isFormPopupVisible = false; this.search(); },
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
        next: () => { notify('Comparente inserito con successo', 'success', 3000); this.isSaving.set(false); this.isFormPopupVisible = false; this.search(); },
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
          this.search();
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
