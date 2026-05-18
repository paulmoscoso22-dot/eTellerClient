import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxDataGridModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule,
  DxPopupModule, DxTextAreaModule, DxValidatorModule, DxDropDownButtonModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabelleService } from '../../services/tabelle.service';
import { IServiziResponse } from '../../models/Servizi.models';

const TRACE_TABLE = 'SERVIZI';

@Component({
  selector: 'app-servizi',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxCheckBoxModule,
    DxButtonModule, DxPopupModule, DxTextAreaModule, DxValidatorModule, DxDropDownButtonModule
  ],
  templateUrl: './servizi.component.html',
  styleUrls: ['./servizi.component.css'],
})
export class ServiziComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tabelleService = inject(TabelleService);

  private servizi = signal<IServiziResponse[]>([]);
  searchValue = signal<string>('');
  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedSerId = signal<string | null>(null);

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
        notify('Servizio creato con successo', 'success', 3000);
        this.loadServizi();
        this.closePopup();
      },
      error: () => notify('Errore durante la creazione', 'error', 3000),
    });
  }

  onUpdate(): void {
    if (!this.serviziForm.valid) {
      notify('Compilare tutti i campi obbligatori', 'error', 3000);
      return;
    }
    const v = this.serviziForm.getRawValue();
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
        notify('Servizio aggiornato con successo', 'success', 3000);
        this.loadServizi();
        this.closePopup();
      },
      error: () => notify('Errore durante l\'aggiornamento', 'error', 3000),
    });
  }

  onTrace(): void {
    const id = this.selectedSerId();
    this.closePopup();
    this.router.navigate(['/trace'], {
      queryParams: { ENTNAME: TRACE_TABLE, traEntCode: id },
    });
  }

  onTraceFromRow(data: IServiziResponse): void {
    this.router.navigate(['/trace'], {
      queryParams: { ENTNAME: TRACE_TABLE, traEntCode: data.serId },
    });
  }

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
