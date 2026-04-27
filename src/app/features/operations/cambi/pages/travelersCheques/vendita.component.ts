import { Component } from '@angular/core';
import { TravelersChequesFormComponent } from '../../components/travelers-cheques-form/travelers-cheques-form.component';

@Component({
  selector: 'app-vendita-travelers',
  standalone: true,
  imports: [TravelersChequesFormComponent],
  template: `<app-travelers-cheques-form mode="vendita"></app-travelers-cheques-form>`,
  styles: [':host { display: contents; }']
})
export class VenditaTravelersComponent {}
