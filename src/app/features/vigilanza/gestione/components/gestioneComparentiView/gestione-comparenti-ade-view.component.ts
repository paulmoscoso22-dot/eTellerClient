import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GestioneComparentiAdeService } from '../../services/gestione-comparenti-ade.service';
import { AppearerAllResponse, GetAppearerByParametersRequest } from '../../domain/gestione-comparenti-ade.models';
import { GestioneComparentiAdeFilterComponent } from '../gestione-comparenti-ade-filter/gestione-comparenti-ade-filter.component';
import { GestioneComparentiAdeTableComponent } from '../gestione-comparenti-ade-table/gestione-comparenti-ade-table.component';
import { DxButtonModule, DxPopupModule } from 'devextreme-angular';
import { GestioneComparentiInsertComponent } from '../gestione-comparenti-insert/gestione-comparenti-insert.component';
import { GestioneComparentiUpdateComponent } from '../gestione-comparenti-update/gestione-comparenti-update.component';

@Component({
  selector: 'app-gestione-comparenti-ade-view',
  standalone: true,
  imports: [
    CommonModule,
    GestioneComparentiAdeFilterComponent,
    GestioneComparentiAdeTableComponent,
    DxButtonModule,
    DxPopupModule,
    GestioneComparentiInsertComponent,
    GestioneComparentiUpdateComponent
  ],
  templateUrl: './gestione-comparenti-ade-view.component.html',
  styleUrls: ['./gestione-comparenti-ade-view.component.scss'],
})
export class GestioneComparentiAdeViewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  
  appearers = signal<AppearerAllResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  hasSearched = signal(false);
  insertPopupVisible = signal(false);
  updatePopupVisible = signal(false);
  selectedAraId = signal<number | null>(null);

  constructor(private gestioneComparentiAdeService: GestioneComparentiAdeService) {}

  ngOnInit(): void {}

  openInsertPopup(): void {
    this.insertPopupVisible.set(true);
  }

  onSaveSuccess(newRow?: any): void {
    this.insertPopupVisible.set(false);
    if (newRow) {
      this.appearers.update(curr => [newRow, ...curr]);
    }
  }

  openUpdatePopup(araId: number): void {
    console.log('openUpdatePopup called with araId:', araId);
    this.selectedAraId.set(araId);
    this.updatePopupVisible.set(true);
    console.log('updatePopupVisible set to:', this.updatePopupVisible());
  }

  onUpdateSuccess(updatedData: any): void {
    this.updatePopupVisible.set(false);
    
    // Update only the specific row in the table
    if (updatedData && updatedData.AraId) {
      this.appearers.update(curr => {
        const index = curr.findIndex(a => a.araId === updatedData.AraId);
        if (index !== -1) {
          const newData = [...curr];
          newData[index] = {
            ...newData[index],
            araBirthplace: updatedData.AraBirthplace,
            araIddocnum: updatedData.AraIddocnum,
            araDocexpdate: updatedData.AraDocexpdate,
            araIsupdated: updatedData.AraIsupdated
          };
          return newData;
        }
        return curr;
      });
    }
  }

  onSearch(formValues: any): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.hasSearched.set(true);
    
    const query: GetAppearerByParametersRequest = {
      AraName: formValues.Nome1 || '',
      AraBirthdate: this.formatDateString(formValues.AraBirthdate),
      AraRecComplete: formValues.AraRecComplete ?? true,
      ShowExpiredRecords: formValues.ShowExpiredRecords ?? true,
      RecordValidityDays: 365
    };

    this.gestioneComparentiAdeService.getByParameters(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.appearers.set(response || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching appearers:', err);
          this.error.set('Si è verificato un errore durante la ricerca.');
          this.isLoading.set(false);
        }
      });
  }

  private formatDateString(dateValue: any): string | null {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    // Extract local year, month, and day to avoid UTC shift
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onReset(): void {
    this.appearers.set([]);
    this.error.set(null);
    this.hasSearched.set(false);
  }
}
