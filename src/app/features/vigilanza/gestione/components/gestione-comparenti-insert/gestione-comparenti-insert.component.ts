import { Component, OnInit, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GestioneComparentiAdeService } from '../../services/gestione-comparenti-ade.service';
import { CountryService } from '../../services/country.service';
import { InsertAraRequest } from '../../domain/gestione-comparenti-ade.models';
import { switchMap } from 'rxjs';
import { CountryResponse } from '../../domain/country.models';
import { DxDateBoxModule, DxNumberBoxModule, DxTextBoxModule, DxCheckBoxModule, DxButtonModule, DxValidatorModule, DxSelectBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-gestione-comparenti-insert',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxValidatorModule,
    DxSelectBoxModule
  ],
  templateUrl: './gestione-comparenti-insert.component.html',
  styleUrls: ['./gestione-comparenti-insert.component.scss']
})
export class GestioneComparentiInsertComponent implements OnInit {
  insertForm!: FormGroup;
  @Output() saveSuccess = new EventEmitter<any>();

  countries = signal<CountryResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private gestioneComparentiAdeService: GestioneComparentiAdeService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCountries();
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

  initForm(): void {
    this.insertForm = this.fb.group({
      hisDate: ['', Validators.required],
      araRecdate: ['', Validators.required],
      araName: ['', Validators.required],
      araBirthdate: [null],
      araBirthplace: [null],
      araNationality: [null],
      araIddocnum: [null],
      araDocexpdate: [null],
      araRecComplete: [false, Validators.required],
      araRepresents: [null],
      araAddress: [null]
    });
  }

  onSubmit(): void {
    if (this.insertForm.valid) {
      const formValue = this.insertForm.value;
      const request: InsertAraRequest = {
        TraUser: '', // Default or fetch from a user service
        TraStation: '', // Default or fetch from a config service
        AraRecdate: formValue.araRecdate,
        AraName: formValue.araName,
        AraBirthdate: formValue.araBirthdate,
        AraBirthplace: formValue.araBirthplace,
        AraNationality: formValue.araNationality,
        AraIddocnum: formValue.araIddocnum,
        AraDocexpdate: formValue.araDocexpdate,
        AraRecComplete: formValue.araRecComplete,
        AraRepresents: formValue.araRepresents,
        AraAddress: formValue.araAddress
      };
      
      this.gestioneComparentiAdeService.insertAra(request).pipe(
        switchMap((response: any) => {
          const araId = response?.success ?? response;
          return this.gestioneComparentiAdeService.postGetAppearerAllByAraId(araId);
        })
      ).subscribe({
        next: (newRow) => {
          notify('Comparente inserito con successo!', 'success', 3000);
          this.insertForm.reset();
          this.saveSuccess.emit(newRow);
        },
        error: (error) => {
          console.error('Error inserting comparente', error);
          const errorMessage = error.error?.message || error.message || 'Errore durante il salvataggio dei dati';
          notify(`Errore: ${errorMessage}`, 'error', 5000);
        }
      });
    } else {
      notify('Compila tutti i campi obbligatori per procedere.', 'warning', 3000);
      this.insertForm.markAllAsTouched();
    }
  }
}
