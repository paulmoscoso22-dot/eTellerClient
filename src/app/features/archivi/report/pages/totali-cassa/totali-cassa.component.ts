import { Component, OnInit, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTotaleCassaResponse } from '../../domain/totale-cassa.models';
import { TotaleCassaFilterComponent } from '../../components/totale-cassa-filter/totale-cassa-filter.component';
import { ApplyFilterMode } from 'devextreme/common/grids';

@Component({
  selector: 'app-totali-cassa',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TotaleCassaFilterComponent
  ],
  templateUrl: './totali-cassa.component.html',
  styleUrls: ['./totali-cassa.component.css'],
})
export class TotaliCassaComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;
  
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
   * Angular lifecycle hook - Cleanup and manage memory leak
   */
  ngOnDestroy(): void {
    this.destroy();
  }

  /**
   * Manually destroy and cleanup subscriptions
   */
  private destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
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
    this.destroy(); // Clean up previous subscription
    this.isLoading.set(true);
    this.error.set(null);

    const data$: Observable<GetTotaleCassaResponse[]> = this.reportFacade.getTotaliCassa(
      tocCliId,
      tocData,
      tocCutId,
      tocBraId
    );

    this.subscription = data$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.totaliCassa.set(data as GetTotaleCassaResponse[]);
        this.isLoading.set(false);
        console.log('Totali Cassa:', data, this.isLoading());
      },
      error: (error: any) => {
        this.error.set(error.message || 'Errore nel recupero totali cassa');
        this.isLoading.set(false);
        console.error('Errore nel recupero totali cassa:', error);
      }
    });
  }
}

