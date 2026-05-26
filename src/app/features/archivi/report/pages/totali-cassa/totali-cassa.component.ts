import { Component, OnInit, OnDestroy, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ReportFacade } from '../../services/report.facade';
import { GetTotaleCassaResponse } from '../../domain/totale-cassa.models';
import { TotaleCassaFilterComponent } from '../../components/totale-cassa-filter/totale-cassa-filter.component';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General';

@Component({
  selector: 'app-totali-cassa',
  standalone: true,
  imports: [
    CommonModule,
    TotaleCassaFilterComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempionePageShellComponent,
    SempioneDataGridComponent,
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

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'tocCurId',      caption: 'Unità',           width: 80,  alignment: 'center' },
    { dataField: 'tocSaldoIni',   caption: 'Saldo Iniziale',  width: 130, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'tocTotdare',    caption: 'Dare',            width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'tocTotdareCtv', caption: 'Dare CTV',        width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'tocTotavere',   caption: 'Avere',           width: 120, alignment: 'right', dataType: 'number', format: '#,##0.00' },
    { dataField: 'tocSaldoFin',   caption: 'Saldo Finale',    width: 130, alignment: 'right', dataType: 'number', format: '#,##0.00' },
  ];

  constructor(private reportFacade: ReportFacade) {}

  ngOnInit(): void {
    // ✅ Carica tutti i dati al caricamento della pagina
    this.loadAllTotaliCassa();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  // ✅ Carica tutti i dati senza filtri
  private loadAllTotaliCassa(): void {
    this.getTotaliCassa(null, null, null, null);
  }

  onSearch(filterData: any): void {
    const { tocCliId, tocData, tocCutId, tocBraId } = filterData;

    // ✅ Tutti i filtri sono opzionali — non controllare se vuoti
    this.getTotaliCassa(tocCliId, tocData, tocCutId, tocBraId);
  }

  getTotaliCassa(
    tocCliId: string | null | undefined,
    tocData: Date | null | undefined,
    tocCutId: string | null | undefined,
    tocBraId: string | null | undefined
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
