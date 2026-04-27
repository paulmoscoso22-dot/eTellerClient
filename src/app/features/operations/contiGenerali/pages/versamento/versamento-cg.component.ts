import { Component } from '@angular/core';
import { ContiGeneraliFormComponent } from '../../components/conti-generali-form/conti-generali-form.component';

@Component({
  selector: 'app-versamento-cg',
  standalone: true,
  imports: [ContiGeneraliFormComponent],
  template: `<app-conti-generali-form mode="versamento"></app-conti-generali-form>`,
  styles: [':host { display: contents; }']
})
export class VersamentoCgComponent {}
