import { Component } from '@angular/core';
import { MoneteMetalliFormComponent } from '../../components/monete-metalli-form/monete-metalli-form.component';

@Component({
  selector: 'app-acquisto',
  standalone: true,
  imports: [MoneteMetalliFormComponent],
  template: `<app-monete-metalli-form mode="acquisto"></app-monete-metalli-form>`,
  styles: [':host { display: contents; }']
})
export class AcquistoComponent {}
