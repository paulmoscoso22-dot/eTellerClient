import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxButtonModule } from 'devextreme-angular';
import { GestioneRegoleService, AntiRecRule, AntiRecRuleSearchParams } from '../../services/gestione-regole.service';
import { GestioneRegoleTableComponent } from '../../components/gestione-regole-table/gestione-regole-table.component';
import { GestioneRegoleFilterComponent } from '../../components/gestione-regole-filter/gestione-regole-filter.component';

@Component({
  selector: 'app-gestione-regole',
  standalone: true,
  imports: [CommonModule, FormsModule, DxButtonModule, GestioneRegoleTableComponent, GestioneRegoleFilterComponent],
  templateUrl: './gestione-regole.component.html',
  styleUrls: ['./gestione-regole.component.scss']
})
export class GestioneRegoleComponent implements OnInit {
  
  rules = signal<AntiRecRule[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private gestioneRegoleService: GestioneRegoleService) { }

  ngOnInit(): void {
    //this.loadData();
  }

  loadData(filter: AntiRecRuleSearchParams): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.gestioneRegoleService.GetSpAntirecRulesParameters(filter).subscribe({
      next: (data: AntiRecRule[]) => {
        this.rules.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Errore durante il caricamento dei dati');
        this.isLoading.set(false);
        console.error('Error loading data:', err);
      }
    });
  }

  onSearch(filterValues: any): void {
    const filter: AntiRecRuleSearchParams = {
      arlOpTypeId: filterValues.arlOpTypeId || '',
      arlCurTypeId: filterValues.arlCurTypeId || '',
      arlAcctId: filterValues.arlAcctId || '',
      arlAcctType: filterValues.arlAcctType || ''
    };
    this.loadData(filter);
  }

  onReset(): void {
    this.rules.set([]);
    this.error.set(null);
  }
}


