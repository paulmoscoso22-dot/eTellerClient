import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule } from 'devextreme-angular';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
} from '../../../../../components/General';
import notify from 'devextreme/ui/notify';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CoppieDiviseService } from '../../services/coppie-divise.service';
import { UserService } from '../../../../../services/user.service';
import { ICurrencyCouple, ICurrencyDv } from '../../models/divisa.models';

@Component({
  selector: 'app-coppie-divise',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneCrudToolbarActionsComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent, SempioneConfirmDeleteComponent,
  ],
  templateUrl: './coppieDivise.component.html',
  styleUrls: ['./coppieDivise.component.css'],
})
export class CoppieDiviseComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private service     = inject(CoppieDiviseService);
  private userService = inject(UserService);
  private router      = inject(Router);
  private destroyRef  = inject(DestroyRef);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'cucCur1',   caption: 'Divisa 1',        type: 'currency', width: 110 },
    { dataField: 'cucCur2',   caption: 'Divisa 2',        type: 'currency', width: 110 },
    { dataField: 'cucLondes', caption: 'Descrizione',      alignment: 'left'            },
    { dataField: 'cucShodes', caption: 'Des. Abbreviata',  alignment: 'left', width: 150 },
    { dataField: 'cucSize',   caption: 'Taglio',           alignment: 'center', width: 90, dataType: 'number' },
  ];

  private coppie       = signal<ICurrencyCouple[]>([]);
  currencies           = signal<ICurrencyDv[]>([]);
  searchValue          = signal<string>('');
  popupMode            = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible   = false;
  isLoading              = signal<boolean>(false);
  isConfirmDeleteVisible = signal(false);
  pendingDeleteData      = signal<ICurrencyCouple | null>(null);
  selectedLabel        = signal<string>('');

  readonly taglioOptions = [1, 100];

  filteredCoppie = computed(() => {
    const q = this.searchValue().toLowerCase().trim();
    const all = this.coppie();
    if (!q) return all;
    return all.filter(c =>
      c.cucCur1.toLowerCase().includes(q) ||
      c.cucCur2.toLowerCase().includes(q) ||
      (c.cucLondes ?? '').toLowerCase().includes(q) ||
      (c.cucShodes ?? '').toLowerCase().includes(q)
    );
  });

  currencyIds = computed(() => this.currencies().map(c => c.curId));

  coppiaForm: FormGroup = this.fb.group({
    cucCur1:   ['', Validators.required],
    cucCur2:   ['', Validators.required],
    cucLondes: ['', Validators.required],
    cucShodes: ['', Validators.required],
    cucSize:   [1,  Validators.required],
    cucExcdir: [null],
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => { this.coppie.set(data); this.isLoading.set(false); },
      error: () => { notify('Errore caricamento coppie divise', 'error', 3000); this.isLoading.set(false); }
    });
    this.service.getCurrenciesDV().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.currencies.set(data);
      },
      error: () => notify('Errore caricamento divise', 'error', 3000)
    });
  }

  onCerca(): void { this.loadData(); }

  openNewPopup(): void {
    this.coppiaForm.reset({ cucSize: 1 });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: ICurrencyCouple): void {
    this.selectedLabel.set(`${data.cucCur1} / ${data.cucCur2}`);
    this.coppiaForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: ICurrencyCouple): void {
    this.selectedLabel.set(`${data.cucCur1} / ${data.cucCur2}`);
    this.coppiaForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ICurrencyCouple): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.requestDelete(data);  break;
      case 'trace':  this.router.navigate(['/trace'], {
        queryParams: { traTabNam: 'CURRENCY_COUPLE', traEntCode: `${data.cucCur1}_${data.cucCur2}` }
      }); break;
    }
  }

  requestDelete(data: ICurrencyCouple): void {
    this.pendingDeleteData.set(data);
    this.isConfirmDeleteVisible.set(true);
  }

  async confirmDelete(): Promise<void> {
    const data = this.pendingDeleteData();
    if (!data) return;
    this.cancelDelete();
    const user = await firstValueFrom(this.userService.getCurrentUser());
    this.isLoading.set(true);
    this.service.delete(data.cucCur1, data.cucCur2, user.userId ?? '', user.station ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.coppie.update(list => list.filter(c => !(c.cucCur1 === data.cucCur1 && c.cucCur2 === data.cucCur2)));
          notify(`Coppia "${data.cucCur1}/${data.cucCur2}" eliminata`, 'success', 3000);
          this.isLoading.set(false);
        },
        error: () => { notify('Errore durante la cancellazione', 'error', 3000); this.isLoading.set(false); }
      });
  }

  cancelDelete(): void {
    this.isConfirmDeleteVisible.set(false);
    this.pendingDeleteData.set(null);
  }

  async onInsert(): Promise<void> {
    if (!this.coppiaForm.valid) { notify('Compilare tutti i campi obbligatori', 'error', 3000); return; }
    const val  = this.coppiaForm.getRawValue();
    const user = await firstValueFrom(this.userService.getCurrentUser());
    this.isLoading.set(true);
    this.service.insert({ ...val, traUser: user.userId ?? '', traStation: user.station ?? '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: created => {
          this.coppie.update(list => [...list, created]);
          notify('Coppia creata con successo', 'success', 3000);
          this.isLoading.set(false);
          this.closePopup();
        },
        error: () => { notify('Errore durante la creazione', 'error', 3000); this.isLoading.set(false); }
      });
  }

  async onUpdate(): Promise<void> {
    if (!this.coppiaForm.valid) { notify('Compilare tutti i campi obbligatori', 'error', 3000); return; }
    const val  = this.coppiaForm.getRawValue();
    const user = await firstValueFrom(this.userService.getCurrentUser());
    this.isLoading.set(true);
    this.service.update({ ...val, traUser: user.userId ?? '', traStation: user.station ?? '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.coppie.update(list => list.map(c =>
            c.cucCur1 === updated.cucCur1 && c.cucCur2 === updated.cucCur2 ? updated : c
          ));
          notify('Coppia aggiornata con successo', 'success', 3000);
          this.isLoading.set(false);
          this.closePopup();
        },
        error: () => { notify('Errore durante l\'aggiornamento', 'error', 3000); this.isLoading.set(false); }
      });
  }

  onTrace(): void {
    const val = this.coppiaForm.getRawValue();
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'CURRENCY_COUPLE', traEntCode: `${val.cucCur1}_${val.cucCur2}` }
    });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.coppiaForm.reset({ cucSize: 1 });
    this.selectedLabel.set('');
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }
}
