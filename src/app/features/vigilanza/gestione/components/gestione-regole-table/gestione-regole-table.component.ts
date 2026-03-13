import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { AntiRecRule } from '../../services/gestione-regole.service';

@Component({
  selector: 'app-gestione-regole-table',
  standalone: true,
  imports: [CommonModule, DxDataGridModule],
  templateUrl: './gestione-regole-table.component.html',
  styleUrl: './gestione-regole-table.component.scss',
})
export class GestioneRegoleTableComponent {
  @Input() rules: AntiRecRule[] = [];
  @Input() isLoading = false;
  @Input() error: string | null = null;
}
