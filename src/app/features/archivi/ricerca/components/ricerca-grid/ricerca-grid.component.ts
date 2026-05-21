import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';

import { GiornaleAntiriciclaggioTransaction } from '../../../report/domain/transaction.models';

@Component({
  selector: 'app-ricerca-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
  ],
  templateUrl: './ricerca-grid.component.html',
  styleUrls: ['./ricerca-grid.component.css']
})
export class RicercaGridComponent {
  @Input() transactions = signal<GiornaleAntiriciclaggioTransaction[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
}
