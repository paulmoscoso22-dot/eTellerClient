import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import {
  SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
  SempioneToolbarComponent, SempioneButtonComponent,
  SempioneDataGridComponent, SempioneGridColumn,
  SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
  SempioneFieldGroupComponent,
} from '../../../../../components/General';
import { InformazioniService } from '../../services/informazioni.service';
import {
  GetTraceAllRequest, TraceResponse, TraceWithFunctionResponse, GetTraceWithFunctionRequest,
  StTracefunctionResponse, SysUsersActiveAndBlockedResponse,
  GetTabellaServVarcharRequest, TabellaServVarcharResponse,
} from '../../models/informazioni.models';
import { ClientResponse } from '../../../../../core/domain/client.domain';

function makeToday(): Date    { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function makeTomorrow(): Date { const d = makeToday(); d.setDate(d.getDate() + 1); return d; }

@Component({
  selector: 'app-trace',
  standalone: true,
  imports: [
    CommonModule,
    DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneButtonComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  ],
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.css'],
})
export class TraceComponent implements OnInit {
  private readonly informazioniService = inject(InformazioniService);
  private readonly destroyRef          = inject(DestroyRef);
  private readonly route               = inject(ActivatedRoute);

  funzioni: WritableSignal<Array<{ tfcId: string | null; tfcDes: string }>> =
    signal([{ tfcId: null, tfcDes: 'ALL' }]);
  utenti: WritableSignal<Array<{ usrId: string | null; des: string }>> =
    signal([{ usrId: null, des: 'ALL' }]);
  clients: WritableSignal<Array<{ cliId: string | null; cliDes: string | null }>> =
    signal([{ cliId: null, cliDes: 'ALL' }]);
  tabellaItems: WritableSignal<Array<{ id: string | null; des: string | null }>> =
    signal([{ id: null, des: 'ALL' }]);

  readonly errorOptions = [
    { id: null,  text: 'Tutti' },
    { id: true,  text: 'Sì'    },
    { id: false, text: 'No'    },
  ];

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'traId',      caption: 'ID',           alignment: 'center', width: 70  },
    { dataField: 'traTime',    caption: 'Data e Ora',    alignment: 'center', width: 160, dataType: 'date', format: 'dd/MM/yyyy HH:mm:ss' },
    { dataField: 'traUser',    caption: 'Utente',        alignment: 'left',   width: 110 },
    { dataField: 'traFunCode', caption: 'Funzione',      alignment: 'left'               },
    { dataField: 'traSubFun',  caption: 'Sottofunzione', alignment: 'left',   width: 130 },
    { dataField: 'traStation', caption: 'Stazione',      alignment: 'left',   width: 100 },
    { dataField: 'traTabNam',  caption: 'Tabella',       alignment: 'left'               },
    { dataField: 'traEntCode', caption: 'Entità',        alignment: 'left',   width: 100 },
    { dataField: 'traError',   caption: 'Errore',        type: 'bool',        width: 80  },
  ];

  filterFunCode  = signal<string | null>(null);
  filterUser     = signal<string | null>(null);
  filterStation  = signal<string | null>(null);
  filterTabNam   = signal<string | null>(null);
  filterEntCode  = signal<string | null>(null);
  filterError    = signal<boolean | null>(null);
  filterDateFrom = signal<Date | null>(makeToday());
  filterDateTo   = signal<Date | null>(makeTomorrow());

  traces        = signal<TraceWithFunctionResponse[]>([]);
  selectedTrace = signal<TraceWithFunctionResponse | null>(null);
  isLoading     = signal(false);
  detailVisible = false;

  ngOnInit(): void {
    this.applyQueryParamsToPrefillFilters();
    this.subscribeToTraces();
    this.subscribeToTraceFunctions();
    this.subscribeToActiveBlockedUsers();
    this.subscribeToClients();
    this.subscribeToTabellaServVarchar();
    this.loadTraceFunctions();
    this.loadActiveBlockedUsers();
    this.loadClients();
    this.loadTabellaServVarchar();
    this.loadAllTraces(this.buildRequest() as GetTraceWithFunctionRequest);
  }

  onVisualizza(): void {
    this.loadAllTraces(this.buildRequest() as GetTraceWithFunctionRequest);
  }

  resetFilters(): void {
    this.filterFunCode.set(null);
    this.filterUser.set(null);
    this.filterStation.set(null);
    this.filterTabNam.set(null);
    this.filterEntCode.set(null);
    this.filterError.set(null);
    this.filterDateFrom.set(makeToday());
    this.filterDateTo.set(makeTomorrow());
    this.traces.set([]);
  }

  openDetail(trace: TraceWithFunctionResponse): void {
    this.selectedTrace.set(trace);
    this.detailVisible = true;
  }

  closeDetail(): void {
    this.detailVisible = false;
    this.selectedTrace.set(null);
  }

  formatDateTime(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    } catch { return String(value); }
  }

  loadAllTraces(request: GetTraceWithFunctionRequest): void {
    this.isLoading.set(true);
    this.informazioniService
      .postGetTraceAll(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.traces.set(resp.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse)));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('GetTraceAll failed', err);
          notify('Errore nel caricamento delle tracce', 'error', 3000);
          this.isLoading.set(false);
        },
      });
  }

  private applyQueryParamsToPrefillFilters(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.filterFunCode.set(null);
        this.filterUser.set(null);
        this.filterStation.set(null);
        this.filterError.set(null);
        this.filterDateFrom.set(null);
        this.filterDateTo.set(null);
        this.filterTabNam.set(params['traTabNam']  !== undefined ? params['traTabNam']          : null);
        this.filterEntCode.set(params['traEntCode'] !== undefined ? String(params['traEntCode']) : null);
      });
  }

  private buildRequest(): GetTraceAllRequest {
    const req    = new GetTraceAllRequest();
    req.traFunCode = this.filterFunCode();
    req.traUser    = this.filterUser();
    req.traStation = this.filterStation();
    req.traTabNam  = this.filterTabNam();
    req.traEntCode = this.filterEntCode();
    req.traError   = this.filterError();
    req.dataFrom   = this.filterDateFrom();
    req.dataTo     = this.filterDateTo();
    return req;
  }

  private subscribeToTraces(): void {
    this.informazioniService.traces$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: TraceResponse[]) => {
        this.traces.set(v.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse)));
      });
  }

  private subscribeToTraceFunctions(): void {
    this.informazioniService.traceFunctions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: StTracefunctionResponse[]) => {
        this.funzioni.set([{ tfcId: null, tfcDes: 'ALL' }, ...v.map(x => ({ tfcId: x.tfcId, tfcDes: x.tfcDes }))]);
      });
  }

  private loadTraceFunctions(): void {
    this.informazioniService.postGetTraceFunction()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('postGetTraceFunction failed', err) });
  }

  private subscribeToActiveBlockedUsers(): void {
    this.informazioniService.activeBlockedUsers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: SysUsersActiveAndBlockedResponse[]) => {
        this.utenti.set([{ usrId: null, des: 'ALL' }, ...v.map(x => ({ usrId: x.usrId, des: x.usrId }))]);
      });
  }

  private loadActiveBlockedUsers(): void {
    this.informazioniService.postGetActiveAndBlockedUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('postGetActiveAndBlockedUsers failed', err) });
  }

  private subscribeToClients(): void {
    this.informazioniService.clients$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: ClientResponse[]) => {
        this.clients.set([{ cliId: null, cliDes: 'ALL' }, ...v.map(x => ({ cliId: x.cliId, cliDes: x.cliDes }))]);
      });
  }

  private loadClients(): void {
    this.informazioniService.postGetClient()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('postGetClient failed', err) });
  }

  private subscribeToTabellaServVarchar(): void {
    this.informazioniService.tabellaServVarchar$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: TabellaServVarcharResponse[]) => {
        this.tabellaItems.set([{ id: null, des: 'ALL' }, ...v.map(x => ({ id: x.id, des: x.des }))]);
      });
  }

  private loadTabellaServVarchar(): void {
    const req = new GetTabellaServVarcharRequest();
    req.nomeTabella = 'ST_TABLENAME';
    this.informazioniService.postGetTabellaServVarchar(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('postGetTabellaServVarchar failed', err) });
  }
}
