import { Component } from '@angular/core';
import { ContoCorrenteFormComponent } from '../../components/conto-corrente-form/conto-corrente-form.component';

@Component({
  selector: 'app-prelievo',
  standalone: true,
  imports: [ContoCorrenteFormComponent],
  template: `<app-conto-corrente-form mode="prelevamento"></app-conto-corrente-form>`,
  styles: [':host { display: contents; }']
})
export class PrelievoComponent {}
