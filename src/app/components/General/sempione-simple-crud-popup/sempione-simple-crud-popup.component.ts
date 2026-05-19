import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, inject, signal, DestroyRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DxTextBoxModule, DxNumberBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SempionePopupComponent } from '../sempione-popup/sempione-popup.component';
import { SempionePopupCardComponent } from '../sempione-popup-card/sempione-popup-card.component';
import { SempionePopupActionBarComponent } from '../sempione-popup-action-bar/sempione-popup-action-bar.component';
import { SempioneFieldGroupComponent } from '../sempione-field-group/sempione-field-group.component';
import { SempioneAlertComponent } from '../sempione-alert/sempione-alert.component';
import { PopupTitlePipe } from '../pipes/popup-title.pipe';

@Component({
  selector: 'app-sempione-simple-crud-popup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    SempionePopupComponent,
    SempionePopupCardComponent,
    SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
    SempioneAlertComponent,
    PopupTitlePipe,
  ],
  templateUrl: './sempione-simple-crud-popup.component.html',
  styleUrls: ['./sempione-simple-crud-popup.component.css'],
})
export class SempioneSimpleCrudPopupComponent implements OnChanges {

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  // ── Visibility (two-way binding) ──
  _visible = false;

  @Input()
  set visible(v: boolean) {
    this._visible = v;
  }
  get visible(): boolean { return this._visible; }

  @Output() visibleChange = new EventEmitter<boolean>();

  // ── Popup mode ──
  @Input() mode: 'new' | 'edit' | 'view' = 'new';

  // ── Record data (pass to pre-fill the form in edit/view mode) ──
  @Input() item: { id: string | number; des: string } | null = null;

  // ── Labels and configuration ──
  @Input({ required: true }) tableName: string = '';
  @Input({ required: true }) entityLabel: string = '';
  @Input({ required: true }) newTitle: string = '';
  @Input() cardTitle: string = '';
  @Input() idLabel: string = 'ID';
  @Input() desLabel: string = 'Descrizione';
  @Input() idPlaceholder: string = 'Codice...';
  @Input() desPlaceholder: string = 'Descrizione...';
  @Input() idMaxLength: number = 50;
  @Input() desMaxLength: number = 50;
  @Input() idInputType: 'text' | 'number' = 'text';
  @Input() maxWidth: number = 480;

  // ── Service callbacks (page provides these) ──
  @Input() onInsert?: (id: string, des: string) => Observable<boolean>;
  @Input() onUpdate?: (id: string, des: string) => Observable<boolean>;

  // ── Outputs ──
  @Output() saved = new EventEmitter<void>();
  @Output() storico = new EventEmitter<string | number | null>();

  // ── Internal form state ──
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({ id: [null], des: [null] });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.saveError.set(null);
      this.editForm.reset({
        id: this.item?.id ?? null,
        des: this.item?.des ?? null,
      });
    }
  }

  onHidden(): void {
    this._visible = false;
    this.visibleChange.emit(false);
  }

  close(): void {
    this._visible = false;
    this.visibleChange.emit(false);
  }

  get saveText(): string {
    return this.mode === 'edit' ? 'Salva Modifiche' : `Crea ${this.entityLabel}`;
  }

  save(): void {
    const v = this.editForm.value;

    if (this.idInputType === 'number') {
      if (v.id === null || v.id === undefined || isNaN(Number(v.id))) {
        this.saveError.set(`Il campo ${this.idLabel} è obbligatorio e deve essere un numero intero`);
        return;
      }
    } else {
      if (!v.id?.toString().trim()) {
        this.saveError.set(`Il campo ${this.idLabel} è obbligatorio`);
        return;
      }
    }

    if (!v.des?.trim()) {
      this.saveError.set(`Il campo ${this.desLabel} è obbligatorio`);
      return;
    }

    const idStr = v.id?.toString() ?? '';
    const des = v.des.trim();
    const callback = this.mode === 'edit' ? this.onUpdate : this.onInsert;
    if (!callback) return;

    this.isSaving.set(true);
    this.saveError.set(null);

    callback(idStr, des)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: boolean) => {
          this.isSaving.set(false);
          if (result) {
            this.visibleChange.emit(false);
            this._visible = false;
            this.saved.emit();
          } else {
            this.saveError.set('Operazione non riuscita. Il codice potrebbe essere già presente.');
          }
        },
        error: (err: any) => {
          this.isSaving.set(false);
          this.saveError.set(err.message || 'Errore durante il salvataggio');
        },
      });
  }
}
