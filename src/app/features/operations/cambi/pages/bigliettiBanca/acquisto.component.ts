import { Component } from '@angular/core';
import { BigliettiBancaFormComponent } from '../../components/biglietti-banca-form/biglietti-banca-form.component';

@Component({
  selector: 'app-acquisto',
  standalone: true,
  imports: [BigliettiBancaFormComponent],
  template: `<app-biglietti-banca-form mode="acquisto"></app-biglietti-banca-form>`,
  styles: [':host { display: contents; }']
})
export class AcquistoComponent {}
