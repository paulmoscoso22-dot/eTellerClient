import { Component } from '@angular/core';
import { TravelersChequesFormComponent } from '../../components/travelers-cheques-form/travelers-cheques-form.component';

@Component({
  selector: 'app-acquisto-travelers',
  standalone: true,
  imports: [TravelersChequesFormComponent],
  template: `<app-travelers-cheques-form mode="acquisto"></app-travelers-cheques-form>`,
  styles: [':host { display: contents; }']
})
export class AcquistoTravelersComponent {}
