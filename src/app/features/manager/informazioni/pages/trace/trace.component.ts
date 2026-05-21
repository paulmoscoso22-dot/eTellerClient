import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import {
  SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
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

@Component({
  selector: 'app-trace',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

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

  filterForm: FormGroup;
  traces        = signal<TraceWithFunctionResponse[]>([]);
  selectedTrace = signal<TraceWithFunctionResponse | null>(null);
  isLoading     = signal(false);
  detailVisible = false;

  constructor() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    this.filterForm = this.fb.group({
      traFunCode: [null],
      traUser:    [null],
      traStation: [null],
      traTabNam:  [null],
      traEntCode: [null],
      traError:   [null],
      dataFrom:   [today],
      dataTo:     [tomorrow],
    });
  }

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
    this.loadAllTraces(this.buildRequestFromForm() as GetTraceWithFunctionRequest);
  }

  onVisualizza(): void {
    this.loadAllTraces(this.buildRequestFromForm());
  }

  resetFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    this.filterForm.reset({
      traFunCode: null, traUser: null, traStation: null,
      traTabNam:  null, traEntCode: null, traError: null,
      dataFrom: today, dataTo: tomorrow,
    });
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

  loadAllTraces(request: GetTraceAllRequest): void {
    this.isLoading.set(true);
    this.informazioniService
      .postGetTraceAll(request as GetTraceWithFunctionRequest)
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
        const traTabNam  = params['traTabNam'];
        const traEntCode = params['traEntCode'];
        this.filterForm.patchValue({
          traFunCode: null, traUser: null, traStation: null,
          traError:   null, dataFrom: null, dataTo: null,
          traTabNam:  traTabNam  !== undefined ? traTabNam  : null,
          traEntCode: traEntCode !== undefined ? String(traEntCode) : null,
        });
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

  private buildRequestFromForm(): GetTraceAllRequest {
    const v = this.filterForm.value;
    const req = new GetTraceAllRequest();
    req.traFunCode = v.traFunCode ?? null;
    req.traUser    = v.traUser    ?? null;
    req.traStation = v.traStation ?? null;
    req.traTabNam  = v.traTabNam  ?? null;
    req.traEntCode = v.traEntCode ?? null;
    req.traError   = v.traError === undefined ? null : v.traError;
    req.dataFrom   = v.dataFrom ?? null;
    req.dataTo     = v.dataTo   ?? null;
    return req;
  }

  private subscribeToTraces(): void {
    this.informazioniService.traces$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: TraceResponse[]) => {
        this.traces.set(v.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse)));
      });
  }
}
