import { Component, signal, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxTextBoxModule,
  DxValidatorModule, DxSelectBoxModule, DxCheckBoxModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { TipoOperazioneService } from '../../services/tipo-operazione.service';
import {
  ITipoOperazioneVm,
  IUpsertOperationTypeCommand,
} from '../../models/tipo-operazione.models';
import {
  SempionePageShellComponent,
  SempioneCardComponent,
  SempioneCardHeaderComponent,
  SempioneToolbarComponent,
  SempionePopupComponent,
  SempionePopupCardComponent,
  SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,


  SempioneDataGridComponent,
  SempioneGridColumn,
  SempioneCrudToolbarActionsComponent,
} from '../../../../../components/General';

@Component({
  selector: 'app-tipo-operazione',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxTextBoxModule,
    DxValidatorModule, DxSelectBoxModule, DxCheckBoxModule,
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneToolbarComponent,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  
  
    SempioneDataGridComponent,
    SempioneCrudToolbarActionsComponent,
  ],
  templateUrl: './tipo-operazione.component.html',
  styleUrls: ['./tipo-operazione.component.css'],
})
export class TipoOperazioneComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly tipoOperazioneService = inject(TipoOperazioneService);
  private readonly router = inject(Router);

  private operazioni = signal<ITipoOperazioneVm[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  filterId  = signal<string>('');
  filterDes = signal<string>('');

  popupMode = signal<'new' | 'view' | 'edit'>('new');
  isDetailPopupVisible = false;
  selectedLabel = signal<string>('');

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'optId',       caption: 'ID',           alignment: 'left',   width: 110              },
    { dataField: 'optDes',      caption: 'Descrizione',  alignment: 'left', wrap: true               },
    { dataField: 'optHoscod',   caption: 'Host Code',    alignment: 'left',   width: 130              },
    { dataField: 'optAptId',    caption: 'Applicazione', alignment: 'center', width: 110              },
    { dataField: 'optIscredit', caption: 'Segno',        alignment: 'center', width: 90,  type: 'segno' },
    { dataField: 'optPrtdv',    caption: 'Stampa fiche', alignment: 'center', width: 110, type: 'bool'  },
  ];

  readonly segnoOptions = [
    { id: '',   des: 'Seleziona...' },
    { id: '1',  des: '1  — Credito' },
    { id: '-1', des: '-1 — Debito'  },
  ];

  filteredOperazioni = computed(() => {
    const id  = this.filterId().toLowerCase().trim();
    const des = this.filterDes().toLowerCase().trim();
    return this.operazioni().filter(o =>
      (!id  || o.optId.toLowerCase().includes(id)) &&
      (!des || o.optDes.toLowerCase().includes(des))
    );
  });

  operazioneForm: FormGroup = this.fb.group({
    optId:      ['', [Validators.required, Validators.maxLength(5)]],
    optDes:     ['', [Validators.required, Validators.maxLength(50)]],
    optHoscod:  ['', [Validators.required, Validators.maxLength(25)]],
    optAptId:   ['', [Validators.required, Validators.maxLength(5)]],
    optIscredit:[null, Validators.required],
    optPrtdv:   [false],
    optAdvId:   [''],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.tipoOperazioneService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.operazioni.set(data);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          const msg = err.message || 'Errore nel recupero dei dati';
          this.error.set(msg);
          this.isLoading.set(false);
          notify(msg, 'error', 4000);
        },
      });
  }

  onFilterIdChanged(e: { value?: string }): void {
    this.filterId.set(e.value ?? '');
  }

  onFilterDesChanged(e: { value?: string }): void {
    this.filterDes.set(e.value ?? '');
  }

  resetSearch(): void {
    this.filterId.set('');
    this.filterDes.set('');
  }

  openNewPopup(): void {
    this.operazioneForm.reset({ optIscredit: '', optPrtdv: false });
    this.selectedLabel.set('');
    this.popupMode.set('new');
    this.isDetailPopupVisible = true;
  }

  private openViewPopup(data: ITipoOperazioneVm): void {
    this.selectedLabel.set(data.optId);
    this.operazioneForm.patchValue(data);
    this.popupMode.set('view');
    this.isDetailPopupVisible = true;
  }

  private openEditPopup(data: ITipoOperazioneVm): void {
    data.optIscredit = data.optIscredit.trim();
    this.selectedLabel.set(data.optId);
    this.operazioneForm.patchValue(data);
    this.popupMode.set('edit');
    this.isDetailPopupVisible = true;
  }

  onTableAction(action: string, data: ITipoOperazioneVm): void {
    switch (action) {
      case 'view':  this.openViewPopup(data); break;
      case 'edit':  this.openEditPopup(data); break;
      case 'trace': this.router.navigate(['/trace'], {
        queryParams: { traTabNam: 'OPT_TYPE', traEntCode: data.optId },
      }); break;
    }
  }

  private buildCommand(): IUpsertOperationTypeCommand {
    const v = this.operazioneForm.getRawValue();
    return {
      optId:      v.optId,
      optDes:     v.optDes,
      optHoscod:  v.optHoscod,
      optIscredit: v.optIscredit,
      optAptId:   v.optAptId,
      optPrtdv:   v.optPrtdv,
      optAdvId:   v.optAdvId || null,
      traUser:    '',
      traStation: '',
    };
  }

  onSubmit(): void {
    if (!this.operazioneForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const cmd = this.buildCommand();
    this.isLoading.set(true);
    this.tipoOperazioneService.insert(cmd)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: boolean) => {
          this.isLoading.set(false);
          if (result) {
            this.isDetailPopupVisible = false;
            notify(`Tipo operazione "${cmd.optId}" aggiunto con successo`, 'success', 3000);
            this.loadAll();
          } else {
            notify('Operazione non riuscita. Il codice potrebbe essere già presente.', 'error', 4000);
          }
        },
        error: (err: any) => {
          this.isLoading.set(false);
          notify(err.message || 'Errore durante il salvataggio', 'error', 4000);
        },
      });
  }

  onUpdate(): void {
    if (!this.operazioneForm.valid) {
      notify('Compilare tutti i campi obbligatori con valori validi', 'error', 3000);
      return;
    }
    const cmd = this.buildCommand();
    this.isLoading.set(true);
    this.tipoOperazioneService.update(cmd)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: boolean) => {
          this.isLoading.set(false);
          if (result) {
            this.isDetailPopupVisible = false;
            notify(`Tipo operazione "${cmd.optId}" aggiornato con successo`, 'success', 3000);
            this.loadAll();
          } else {
            notify('Operazione non riuscita.', 'error', 4000);
          }
        },
        error: (err: any) => {
          this.isLoading.set(false);
          notify(err.message || 'Errore durante il salvataggio', 'error', 4000);
        },
      });
  }

  onTrace(): void {
    const id = this.operazioneForm.get('optId')?.value;
    this.isDetailPopupVisible = false;
    this.router.navigate(['/trace'], {
      queryParams: { traTabNam: 'OPT_TYPE', traEntCode: id },
    });
  }

  closePopup(): void {
    this.isDetailPopupVisible = false;
    this.operazioneForm.reset({ optIscredit: '1', optPrtdv: false });
    this.selectedLabel.set('');
  }
}
