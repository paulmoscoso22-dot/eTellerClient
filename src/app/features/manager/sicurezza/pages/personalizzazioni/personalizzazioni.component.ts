import { Component, signal, computed, inject, OnInit, DestroyRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxToastModule } from 'devextreme-angular/ui/toast';
import { DxTemplateModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import { PersonalisationResponse, UpdatePersonalisationRequest } from '../../models/personalisation.models';

@Component({
  selector: 'app-personalizzazioni',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxTextAreaModule,
    DxButtonModule, DxPopupModule, DxToastModule,
    DxTemplateModule,
  ],
  templateUrl: './personalizzazioni.component.html',
  styleUrls: ['./personalizzazioni.component.css'],
})
export class PersonalizzazioniComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef    = inject(DestroyRef);
  private readonly router        = inject(Router);

  personalisations = signal<PersonalisationResponse[]>([]);

  // ── Filter state ──
  filterParId  = signal<string>('');
  filterParDes = signal<string>('');

  filteredPersonalisations = computed(() => {
    let data = this.personalisations();
    const id  = this.filterParId().trim().toLowerCase();
    const des = this.filterParDes().trim().toLowerCase();
    if (id)  data = data.filter(p => p.parId?.toLowerCase().includes(id));
    if (des) data = data.filter(p => p.parDes?.toLowerCase().includes(des));
    return data;
  });

  // ── Selection state ──
  selectedParId    = signal<string>('');
  selectedParDes   = signal<string>('');
  selectedParValue = signal<string>('');

  // ── UI state ──
  showAddPopup    = signal<boolean>(false);
  showDetailPopup = signal<boolean>(false);
  popupMode       = signal<'view' | 'edit'>('view');
  isLoading       = signal<boolean>(false);
  toastVisible    = signal<boolean>(false);
  toastMessage    = signal<string>('');
  toastType       = signal<'success' | 'error' | 'warning' | 'info'>('success');

  @ViewChild('personalizzazioniGrid') private grid?: DxDataGridComponent;

  addForm = new FormGroup({
    parId:    new FormControl('', [Validators.required]),
    parDes:   new FormControl(''),
    parValue: new FormControl(''),
  });

  ngOnInit(): void {
    this.managerService.personalisation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.personalisations.set(data) });
    this.managerService.getPersonalisation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error loading personalisations:', err) });
  }

  // ── Row selection ──
  onRowSelect(e: any): void {
    const selected = e?.selectedRowsData?.[0];
    if (!selected) { this.clearSelected(); return; }
    this.setSelected(selected);
  }

  // ── Open popup ──
  openViewPopup(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.popupMode.set('view');
    this.showDetailPopup.set(true);
  }

  openEditPopup(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
  }

  switchToEditMode(): void { this.popupMode.set('edit'); }

  // ── Save detail ──
  onSaveDetail(): void {
    const request: UpdatePersonalisationRequest = {
      parId:         this.selectedParId(),
      parDes:        this.selectedParDes(),
      parValue:      this.selectedParValue(),
      originalParId: this.selectedParId(),
    };
    this.isLoading.set(true);
    this.managerService.updatePersonalisation(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          if (result) {
            this.showNotification('Personalizzazione modificata con successo', 'success');
            this.showDetailPopup.set(false);
            this.managerService.getPersonalisation()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({ error: (err) => console.error(err) });
          } else {
            this.showNotification('Errore durante la modifica', 'error');
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showNotification('Errore durante la modifica', 'error');
          console.error(err);
        }
      });
  }

  // ── Add ──
  onAdd(): void { this.showAddPopup.set(true); }

  onSaveAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.showNotification("Funzionalità di inserimento non disponibile", 'warning');
    this.showAddPopup.set(false);
    this.resetAddForm();
  }

  onCancelAdd(): void { this.showAddPopup.set(false); this.resetAddForm(); }

  // ── Trace from row ──
  onTraceFromRow(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'PERSONALISATION', traEntCode: String(data.parId) }
    });
  }

  // ── Delete from row ──
  onDeleteFromRow(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.onDelete();
  }

  // ── Delete ──
  onDelete(): void {
    if (!this.selectedParId()) {
      this.showNotification('Selezionare una personalizzazione da eliminare', 'warning');
      return;
    }
    confirm(`Eliminare la personalizzazione "${this.selectedParId()}"?`, 'Conferma eliminazione')
      .then((confirmed) => {
        if (!confirmed) return;
        this.showNotification('Funzionalità di eliminazione non disponibile', 'warning');
      });
  }

  // ── Trace from popup ──
  onTrace(): void {
    if (!this.selectedParId()) {
      this.showNotification('Selezionare una personalizzazione da tracciare', 'warning');
      return;
    }
    this.showDetailPopup.set(false);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'PERSONALISATION', traEntCode: String(this.selectedParId()) }
    });
  }

  // ── Filters ──
  resetFilters(): void {
    this.filterParId.set('');
    this.filterParDes.set('');
  }

  onSearch(): void {}
  onPrint():  void {}

  // ── Private helpers ──
  private setSelected(data: PersonalisationResponse): void {
    this.selectedParId.set(data.parId ?? '');
    this.selectedParDes.set(data.parDes ?? '');
    this.selectedParValue.set(data.parValue ?? '');
  }

  private clearSelected(): void {
    this.selectedParId.set('');
    this.selectedParDes.set('');
    this.selectedParValue.set('');
  }

  private resetAddForm(): void {
    this.addForm.reset({ parId: '', parDes: '', parValue: '' });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    notify(message, type, 2000);
  }
}
