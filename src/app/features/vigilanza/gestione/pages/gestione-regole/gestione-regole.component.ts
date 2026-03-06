import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule, DxTextBoxModule, DxButtonModule, DxFormModule } from 'devextreme-angular';
import { GestioneRegoleService, AntiRecRule } from '../../services/gestione-regole.service';

@Component({
  selector: 'app-gestione-regole',
  standalone: true,
  imports: [CommonModule, FormsModule, DxDataGridModule, DxTextBoxModule, DxButtonModule, DxFormModule],
  templateUrl: './gestione-regole.component.html',
  styleUrls: ['./gestione-regole.component.scss']
})
export class GestioneRegoleComponent implements OnInit {
  
  rules = signal<AntiRecRule[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  filter = {
    arlOpTypeId: '',
    arlCurTypeId: '',
    arlAcctId: '',
    arlAcctType: ''
  };

  constructor(private gestioneRegoleService: GestioneRegoleService) { }

  ngOnInit(): void {
    //this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.gestioneRegoleService.GetSpAntirecRulesParameters(this.filter).subscribe({
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

  onSearch(): void {
    this.loadData();
  }
}


