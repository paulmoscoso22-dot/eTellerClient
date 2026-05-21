import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';

import { GetTransactionWithFiltersResponse } from '../../domain/transaction.models';

@Component({
  selector: 'app-attesa-benefondo-grid',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
  ],
  templateUrl: './attesa-benefondo-grid.component.html',
  styleUrls: ['./attesa-benefondo-grid.component.css']
})
export class AttesaBenefondoGridComponent {
  @Input() transactions = signal<GetTransactionWithFiltersResponse[]>([]);
  @Input() isLoading = signal(false);
  @Input() error = signal<string | null>(null);
}
