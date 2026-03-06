import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestioneComparentiAdeViewComponent } from '../../components/gestioneComparentiView/gestione-comparenti-ade-view.component';

@Component({
  selector: 'app-gestione-comparenti-ade',
  standalone: true,
  imports: [CommonModule, GestioneComparentiAdeViewComponent],
  templateUrl: './gestione-comparenti-ade.component.html',
  styleUrls: ['./gestione-comparenti-ade.component.css'],
})
export class GestioneComparentiAdeComponent {
  constructor() {}
}
