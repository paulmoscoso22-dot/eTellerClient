import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxTextBoxModule, DxCheckBoxModule,
  DxTextAreaModule, DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabelleService } from '../../services/tabelle.service';
import { IServiziResponse } from '../../models/Servizi.models';
import {
  SempionePageShellComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,


  SempioneDataGridComponent,
  SempioneGridColumn,
  SempioneSearchModeComponent,
} from '../../../../../components/General';

const TRACE_TABLE = 'SERVIZI';

@Component({
  selector: 'app-servizi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxCheckBoxModule,
    DxTextAreaModule, DxValidatorModule,
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,


    SempioneDataGridComponent,
    SempioneSearchModeComponent,
  ],
  templateUrl: './servizi.component.html',
  styleUrls: ['./servizi.component.css'],
})
export class ServiziComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tabelleService = inject(TabelleService);
  @ViewChild(SempioneDataGridComponent) private dataGrid?: SempioneDataGridComponent;

  servizi = signal<IServiziResponse[]>([]);
  searchValue = signal<string>('');
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedSerId = signal<string | null>(null);
  isSaving = signal(false);

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'serId',      caption: 'ID',                 alignment: 'left',   width: 130, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'serDes',     caption: 'Descrizione',        alignment: 'left', wrap: true, allowFiltering: false, allowHeaderFiltering: true },
    { dataField: 'serRunning', caption: 'Running',   type: 'bool', alignment: 'center', width: 90, allowFiltering: false, allowHeaderFiltering: false },
    { dataField: 'serTrace',   caption: 'Traccia',   type: 'bool', alignment: 'center', width: 90, allowFiltering: false, allowHeaderFiltering: false },
    { dataField: 'serEmail',   caption: 'Email',     type: 'bool', alignment: 'center', width: 80, allowFiltering: false, allowHeaderFiltering: false },
    { dataField: 'serEnable',  caption: 'Abilitato', type: 'bool', alignment: 'center', width: 90, allowFiltering: false, allowHeaderFiltering: false },
    { dataField: 'serLastRun', caption: 'Ultima esecuzione',  alignment: 'left',   width: 160, allowFiltering: false, allowHeaderFiltering: false },
  ];

  moreActions = [
    { id: 'storico', text: 'Storico (Traccia)', icon: 'clock' },
    { id: 'delete',  text: 'Elimina',           icon: 'trash' },
  ];

  filteredServizi = computed(() => {
    const q = this.searchValue().toLowerCase().trim();
    const all = this.servizi();
    if (!q) return all;
    return all.filter(s =>
      s.serId.toLowerCase().includes(q) || s.serDes.toLowerCase().includes(q)
    );
  });

  serviziForm: FormGroup = this.fb.group({
    serId: ['', Validators.required],
    serDes: ['', Validators.required],
    serDeserr: [''],
    serSyserrmail: [''],
    serApperrmail: [''],
    serEmail: [false],
    serEnable: [true],
    serTrace: [false],
  });

  ngOnInit(): void {
    this.loadServizi();
  }

  loadServizi(): void {
    this.tabelleService.getServizi().subscribe({
      next: data => this.servizi.set(data),
      error: () => notify('Errore nel caricamento dei servizi', 'error', 3000),
    });
  }

  openNewPopup(): void {
    this.serviziForm.reset({ serEmail: false, serEnable: true, serTrace: false });
    this.selectedSerId.set(null);
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  openViewPopup(data: IServiziResponse): void {
    this.selectedSerId.set(data.serId);
    this.serviziForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IServiziResponse): void {
    this.selectedSerId.set(data.serId);
    this.serviziForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IServiziResponse): void {
    switch (action) {
      case 'view':   this.openViewPopup(data); break;
      case 'edit':   this.openEditPopup(data); break;
      case 'delete': this.onDelete(data);      break;
      case 'trace':  this.onTraceFromRow(data); break;
    }
  }

  onMoreAction(e: any, data: IServiziResponse): void {
    if (e.itemData.id === 'storico') this.onStorico(data.serId);
    if (e.itemData.id === 'delete')  this.onDelete(data);
  }

  onStorico(serId: string): void {
    // TODO: navigate to storico
    notify(`Storico del servizio "${serId}"`, 'info', 3000);
  }

  onDelete(data: IServiziResponse): void {
    // TODO: call backend delete
    this.servizi.update(list => list.filter(s => s.serId !== data.serId));
    notify(`Servizio "${data.serId}" eliminato`, 'success', 3000);
  }

  onSubmit(): void {
    if (!this.serviziForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const v = this.serviziForm.getRawValue();
    this.isSaving.set(true);
    this.tabelleService.insertServizio({
      traUser: 'USR',
      traStation: 'WEB',
      serId: v.serId,
      serDes: v.serDes,
      serTrace: v.serTrace ?? false,
      serEmail: v.serEmail ?? false,
      serSyserrmail: v.serSyserrmail || null,
      serApperrmail: v.serApperrmail || null,
      serEnable: v.serEnable ?? true,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        notify('Servizio creato con successo', 'success', 3000);
        this.loadServizi();
        this.closePopup();
      },
      error: () => { this.isSaving.set(false); notify('Errore durante la creazione', 'error', 3000); },
    });
  }

  onUpdate(): void {
    if (!this.serviziForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const v = this.serviziForm.getRawValue();
    this.isSaving.set(true);
    this.tabelleService.updateServizio({
      traUser: 'USR',
      traStation: 'WEB',
      serId: v.serId,
      serDes: v.serDes,
      serTrace: v.serTrace ?? false,
      serEmail: v.serEmail ?? false,
      serSyserrmail: v.serSyserrmail || null,
      serApperrmail: v.serApperrmail || null,
      serEnable: v.serEnable ?? true,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        notify('Servizio aggiornato con successo', 'success', 3000);
        this.loadServizi();
        this.closePopup();
      },
      error: () => { this.isSaving.set(false); notify('Errore durante l\'aggiornamento', 'error', 3000); },
    });
  }

  onTrace(): void {
    const id = this.selectedSerId();
    this.closePopup();
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TRACE_TABLE, traEntCode: id },
    });
  }

  onTraceFromRow(data: IServiziResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: TRACE_TABLE, traEntCode: data.serId },
    });
  }

  clearGridFilters(): void { this.dataGrid?.clearFilters(); }

  onRefresh(): void {
    this.loadServizi();
  }

  onResetForm(): void {
    this.searchValue.set('');
    this.loadServizi();
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.serviziForm.reset({ serEmail: false, serEnable: true, serTrace: false });
    this.selectedSerId.set(null);
  }

  onSearchChanged(e: any): void {
    this.searchValue.set(e.value ?? '');
  }
}
