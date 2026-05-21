import { Component, signal, computed, inject, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import { PersonalisationResponse, UpdatePersonalisationRequest } from '../../models/personalisation.models';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneToolbarComponent } from '../../../../../components/General/sempione-toolbar/sempione-toolbar.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General/sempione-data-grid/sempione-data-grid.component';
import { SempionePopupComponent } from '../../../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempionePopupCardComponent } from '../../../../../components/General/sempione-popup-card/sempione-popup-card.component';
import { SempioneFieldGroupComponent } from '../../../../../components/General/sempione-field-group/sempione-field-group.component';

@Component({
  selector: 'app-personalizzazioni',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule, DxTextAreaModule, DxButtonModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupActionBarComponent,
    SempionePopupCardComponent, SempioneFieldGroupComponent,
  ],
  templateUrl: './personalizzazioni.component.html',
  styleUrls: ['./personalizzazioni.component.css'],
})
export class PersonalizzazioniComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef    = inject(DestroyRef);
  private readonly router        = inject(Router);

  personalisations = signal<PersonalisationResponse[]>([]);

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

  selectedParId    = signal<string>('');
  selectedParDes   = signal<string>('');
  selectedParValue = signal<string>('');

  showDetailPopup = signal<boolean>(false);
  showAddPopup    = signal<boolean>(false);
  popupMode       = signal<'view' | 'edit'>('view');
  isLoading       = signal<boolean>(false);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'parId',    caption: 'ID',          width: 220 },
    { dataField: 'parDes',   caption: 'Descrizione' },
    { dataField: 'parValue', caption: 'Valore',      width: 180 },
  ];

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

  onRowSelect(e: any): void {
    const selected = e?.selectedRowsData?.[0];
    if (!selected) { this.clearSelected(); return; }
    this.setSelected(selected);
  }

  openEditPopup(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.popupMode.set('edit');
    this.showDetailPopup.set(true);
  }

  switchToEditMode(): void { this.popupMode.set('edit'); }

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
            notify('Personalizzazione modificata con successo', 'success', 2000);
            this.showDetailPopup.set(false);
            this.managerService.getPersonalisation()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({ error: (err) => console.error(err) });
          } else {
            notify('Errore durante la modifica', 'error', 2000);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          notify('Errore durante la modifica', 'error', 2000);
          console.error(err);
        }
      });
  }

  onAdd(): void { this.showAddPopup.set(true); }

  onSaveAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    notify('Funzionalità di inserimento non disponibile', 'warning', 2000);
    this.showAddPopup.set(false);
    this.resetAddForm();
  }

  onCancelAdd(): void { this.showAddPopup.set(false); this.resetAddForm(); }

  onTraceFromRow(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'PERSONALISATION', traEntCode: String(data.parId) }
    });
  }

  onDeleteFromRow(data: PersonalisationResponse): void {
    this.setSelected(data);
    this.onDelete();
  }

  onDelete(): void {
    if (!this.selectedParId()) {
      notify('Selezionare una personalizzazione da eliminare', 'warning', 2000);
      return;
    }
    confirm(`Eliminare la personalizzazione "${this.selectedParId()}"?`, 'Conferma eliminazione')
      .then((confirmed) => {
        if (!confirmed) return;
        notify('Funzionalità di eliminazione non disponibile', 'warning', 2000);
      });
  }

  onTrace(): void {
    if (!this.selectedParId()) {
      notify('Selezionare una personalizzazione da tracciare', 'warning', 2000);
      return;
    }
    this.showDetailPopup.set(false);
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'PERSONALISATION', traEntCode: String(this.selectedParId()) }
    });
  }

  resetFilters(): void {
    this.filterParId.set('');
    this.filterParDes.set('');
  }

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
}
