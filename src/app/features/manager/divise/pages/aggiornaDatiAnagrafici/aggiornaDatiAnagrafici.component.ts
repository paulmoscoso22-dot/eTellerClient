import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
  DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DiviseService } from '../../services/divise.service';
import { Router } from '@angular/router';
import { IDivisaAnagrafica, UpdateDivisaRequest } from '../../models/divisa.models';
import { UserService } from '../../../../../services/user.service';

export type { IDivisaAnagrafica } from '../../models/divisa.models';

@Component({
  selector: 'app-aggiorna-dati-anagrafici',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule, DxPopupModule,
    DxValidatorModule, DxNumberBoxModule, DxSelectBoxModule
  ],
  templateUrl: './aggiornaDatiAnagrafici.component.html',
  styleUrls: ['./aggiornaDatiAnagrafici.component.css'],
})
export class AggiornaDAtiAnagraficiComponent implements OnInit {
  private fb = inject(FormBuilder);
  private diviseService = inject(DiviseService);
  private router = inject(Router);

  private divise = signal<IDivisaAnagrafica[]>([]);

  filterCodice      = signal<string>('');
  filterDescrizione = signal<string>('');

  popupMode = signal<'view' | 'edit'>('view');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');
  isLoading = signal<boolean>(false);

  readonly tipoOptions = [
    { id: 'BB', des: 'Biglietti Banca' },
    { id: 'MM', des: 'Monete e Metalli' },
    { id: 'TR', des: 'Travelers Cheques' },
  ];

  filteredDivise = computed(() => {
    const q    = this.filterCodice().toLowerCase().trim();
    const qDes = this.filterDescrizione().toLowerCase().trim();

    return this.divise().filter(d => {
      if (q && !d.curId.toLowerCase().includes(q)) return false;
      if (qDes && !d.curLondes.toLowerCase().includes(qDes) &&
                  !d.curShodes.toLowerCase().includes(qDes)) return false;
      return true;
    });
  });

  divisaForm: FormGroup = this.fb.group({
    curId:      [''],
    curCutId:   [''],
    curShodes:  [''],
    curLondes:  [''],
    curMinamn:  [null, [Validators.required, Validators.min(0), Validators.max(10000000)]],
    curTolrat:  [null, [Validators.required, Validators.min(0), Validators.max(1000000)]],
    curFinezza: [''],
    curModdat:  [''],
  });

  ngOnInit(): void {
    this.loadDivise();
  }

  private loadDivise(): void {
    this.isLoading.set(true);
    this.diviseService.getAll().subscribe({
      next: (data) => {
        this.divise.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento divise:', err);
        notify('Errore nel caricamento delle divise', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  onCerca(): void {
    notify('Ricerca applicata', 'info', 1500);
  }

  onResetFiltri(): void {
    this.filterCodice.set('');
    this.filterDescrizione.set('');
  }

  openViewPopup(data: IDivisaAnagrafica): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  openEditPopup(data: IDivisaAnagrafica): void {
    this.selectedLabel.set(`${data.curId} — ${data.curShodes}`);
    this.divisaForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: IDivisaAnagrafica): void {
    switch (action) {
      case 'view': this.openViewPopup(data); break;
      case 'edit': this.openEditPopup(data); break;
    }
  }

  onUpdate(): void {
    if (this.divisaForm.get('curMinamn')?.invalid ||
        this.divisaForm.get('curTolrat')?.invalid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const val = this.divisaForm.getRawValue() as IDivisaAnagrafica;

    const request: UpdateDivisaRequest = {
      curId:      val.curId,
      curCutId:   val.curCutId,
      curMinamn:  val.curMinamn,
      curFinezza: val.curFinezza ?? '',
      curTolrat:  val.curTolrat,
      traUser:    'SYSTEM',
      traStation: 'WEB'
    };

    this.isLoading.set(true);
    this.diviseService.update(request).subscribe({
      next: (updated) => {
        this.divise.update(list => list.map(d =>
          d.curId === updated.curId && d.curCutId === updated.curCutId ? updated : d
        ));
        notify(`Divisa "${val.curId}" aggiornata con successo`, 'success', 3000);
        this.isLoading.set(false);
        this.closePopup();
      },
      error: (err) => {
        console.error('Errore aggiornamento divisa:', err);
        notify('Errore durante l\'aggiornamento della divisa', 'error', 3000);
        this.isLoading.set(false);
      }
    });
  }

  onTrace(): void {
    const val = this.divisaForm.getRawValue();
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'CURRENCY', traEntCode: `${val.curId}_${val.curCutId}` }
    });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.divisaForm.reset();
    this.selectedLabel.set('');
  }
}
