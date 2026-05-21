import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportFacade } from '../../services/report.facade';
import { GetTotaleCassaResponse } from '../../domain/totale-cassa.models';
import { TotaleCassaFilterComponent } from '../../components/totale-cassa-filter/totale-cassa-filter.component';
import { ApplyFilterMode } from 'devextreme/common/grids';
import { HeaderCardComponent } from '../../../../../components/header-card/header-card.component';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';

@Component({
  selector: 'app-totali-cassa',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TotaleCassaFilterComponent,
    HeaderCardComponent,
    SempionePageHeaderComponent,
  ],
  templateUrl: './totali-cassa.component.html',
  styleUrls: ['./totali-cassa.component.css'],
})
export class TotaliCassaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  totaliCassa = signal<GetTotaleCassaResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showFilterRow = true;
  showHeaderFilter = true;
  currentFilter: ApplyFilterMode = 'auto';

  constructor(private reportFacade: ReportFacade) {}

  /**
   * Angular lifecycle hook - Initialize component
   */
  ngOnInit(): void {
    // Initialize without search - user will trigger it
  }

  /**
   * Handle search event from filter component
   */
  onSearch(filterData: any): void {
    const { tocCliId, tocData, tocCutId, tocBraId } = filterData;

    if (!tocCliId || !tocData || !tocCutId || !tocBraId) {
      this.error.set('Per favore, compila tutti i campi obbligatori');
      return;
    }

    this.getTotaliCassa(tocCliId, tocData, tocCutId, tocBraId);
  }

  /**
   * Get totali cassa with filters
   * 
   * @param tocCliId - Cassa ID
   * @param tocData - Data
   * @param tocCutId - Currency Type ID
   * @param tocBraId - Branch ID
   */
  getTotaliCassa(
    tocCliId: string,
    tocData: Date,
    tocCutId: string,
    tocBraId: string
  ): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.reportFacade.getTotaliCassa(tocCliId, tocData, tocCutId, tocBraId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.totaliCassa.set(data as GetTotaleCassaResponse[]);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero totali cassa');
        this.isLoading.set(false);
      }
    });
  }
}

