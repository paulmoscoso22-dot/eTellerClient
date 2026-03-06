import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { GestioneComparentiAdeService } from '../../services/gestione-comparenti-ade.service';
import { CountryResponse } from '../../domain/country.models';
import { UpdateAraRequest } from '../../domain/gestione-comparenti-ade.models';
import notify from 'devextreme/ui/notify';
import { 
  DxButtonModule, 
  DxCheckBoxModule, 
  DxDateBoxModule, 
  DxNumberBoxModule, 
  DxSelectBoxModule, 
  DxTextBoxModule, 
  DxValidatorModule 
} from 'devextreme-angular';

@Component({
  selector: 'app-gestione-comparenti-update',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxValidatorModule
  ],
  templateUrl: './gestione-comparenti-update.component.html',
  styleUrls: ['./gestione-comparenti-update.component.scss']
})
export class GestioneComparentiUpdateComponent implements OnInit {

  private _araId: number | null = null;
  
  @Input() 
  set araId(value: number | null) {
    this._araId = value;
    if (value && this.updateForm) {
      this.loadAppearerData(value);
    }
  }
  get araId(): number | null {
    return this._araId;
  }
  
  @Output() updateSuccess = new EventEmitter<any>();

  updateForm!: FormGroup;
  countries = signal<CountryResponse[]>([]);
  initialData: any = null;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private gestioneComparentiAdeService: GestioneComparentiAdeService
  ) {}

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      AraId: [this._araId, Validators.required],
      AraRecdate: [null, Validators.required],
      AraName: [null, Validators.required],
      AraBirthdate: [null],
      AraBirthplace: [null],
      AraNationality: [null],
      AraIddocnum: [null],
      AraDocexpdate: [null],
      AraRepresents: [null],
      AraAddress: [null],
      AraRecComplete: [false, Validators.required],
      AraIsupdated: [false, Validators.required]
    });
    this.loadCountries();
    if (this._araId) {
      this.loadAppearerData(this._araId);
    }
  }

  loadCountries(): void {
    this.countryService.getAllCountries().subscribe({
      next: (data) => {
        this.countries.set(data);
      },
      error: (err) => {
        console.error('Error loading countries', err);
      }
    });
  }

  loadAppearerData(araId: number): void {
    this.gestioneComparentiAdeService.postGetAppearerAllByAraId(araId).subscribe({
      next: (data: any) => {
        console.log('Appearer data loaded:', data);
        this.initialData = data;
        this.fillForm(data);
      },
      error: (err) => {
        console.error('Error loading appearer data', err);
      }
    });
  }

  fillForm(data: any): void {
    // Map camelCase API response to PascalCase form controls
    this.updateForm.get('AraId')?.setValue(data.araId);
    this.updateForm.get('AraRecdate')?.setValue(data.araRecdate);
    this.updateForm.get('AraName')?.setValue(data.araName);
    this.updateForm.get('AraBirthdate')?.setValue(data.araBirthdate);
    this.updateForm.get('AraBirthplace')?.setValue(data.araBirthplace);
    this.updateForm.get('AraNationality')?.setValue(data.araNationality);
    this.updateForm.get('AraIddocnum')?.setValue(data.araIddocnum);
    this.updateForm.get('AraDocexpdate')?.setValue(data.araDocexpdate);
    this.updateForm.get('AraRepresents')?.setValue(data.araRepresents);
    this.updateForm.get('AraAddress')?.setValue(data.araAddress);
    this.updateForm.get('AraRecComplete')?.setValue(data.araRecComplete);
    this.updateForm.get('AraIsupdated')?.setValue(data.araIsupdated);
  }

  onReset(): void {
    if (this.initialData) {
      this.fillForm(this.initialData);
      notify('Modulo ripristinato ai dati iniziali', 'info', 2000);
    }
  }

  onSubmit() {
    if (this.updateForm.valid) {
      const formValue = this.updateForm.value;
      const request: UpdateAraRequest = {
        TraUser: '',
        TraStation: '',
        AraId: formValue.AraId,
        AraName: formValue.AraName,
        AraBirthdate: formValue.AraBirthdate,
        AraBirthplace: formValue.AraBirthplace,
        AraNationality: formValue.AraNationality,
        AraIddocnum: formValue.AraIddocnum,
        AraDocexpdate: formValue.AraDocexpdate,
        AraRepresents: formValue.AraRepresents,
        AraAddress: formValue.AraAddress,
        AraRecComplete: formValue.AraRecComplete
      };
      this.gestioneComparentiAdeService.updateAra(request).subscribe({
        next: (response) => {
          notify('Aggiornamento avvenuto con successo', 'success', 3000);
          this.updateSuccess.emit(request);
        },
        error: (err) => {
          console.error('Error updating appearer', err);
          notify('Errore durante l\'aggiornamento', 'error', 3000);
        }
      });
    } else {
      notify('Compila tutti i campi obbligatori', 'warning', 3000);
    }
  }
}

