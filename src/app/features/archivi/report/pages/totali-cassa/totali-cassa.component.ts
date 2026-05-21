import { Component, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTotaleCassaResponse } from '../../domain/totale-cassa.models';
import { TotaleCassaFilterComponent } from '../../components/totale-cassa-filter/totale-cassa-filter.component';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';

@Component({
  selector: 'app-totali-cassa',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TotaleCassaFilterComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempionePageHeaderComponent,
  ],
  templateUrl: './totali-cassa.component.html',
  styleUrls: ['./totali-cassa.component.css'],
})
export class TotaliCassaComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private subscription: Subscription | null = null;

  totaliCassa = signal<GetTotaleCassaResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(private reportFacade: ReportFacade) {}

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  onSearch(filterData: any): void {
    const { tocCliId, tocData, tocCutId, tocBraId } = filterData;

    if (!tocCliId || !tocData || !tocCutId || !tocBraId) {
      this.error.set('Compila tutti i campi obbligatori');
      return;
    }

    this.getTotaliCassa(tocCliId, tocData, tocCutId, tocBraId);
  }

  getTotaliCassa(
    tocCliId: string,
    tocData: Date,
    tocCutId: string,
    tocBraId: string
  ): void {
    this.destroy();
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
