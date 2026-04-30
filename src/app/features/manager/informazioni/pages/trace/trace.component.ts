import { Component, DestroyRef, inject, OnInit, signal, WritableSignal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DxToastModule } from 'devextreme-angular/ui/toast';
import { DxTemplateModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InformazioniService } from '../../services/informazioni.service';
import { GetTraceAllRequest, TraceResponse, TraceWithFunctionResponse, GetTraceWithFunctionRequest, StTracefunctionResponse, SysUsersActiveAndBlockedResponse, ClientResponse, GetTabellaServVarcharRequest, TabellaServVarcharResponse } from '../../models/informazioni.models';

@Component({
  selector: 'app-trace',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule,
    DxButtonModule, DxDataGridModule, DxPopupModule,
    DxToastModule, DxTemplateModule,
  ],
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.css'],
})
export class TraceComponent implements OnInit {
  private readonly informazioniService = inject(InformazioniService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  funzioni: WritableSignal<Array<{ tfcId: string | null; tfcDes: string }>> = signal([{ tfcId: null, tfcDes: 'ALL' }]);
  utenti: WritableSignal<Array<{ usrId: string | null; des: string }>> = signal([{ usrId: null, des: 'ALL' }]);
  clients: WritableSignal<Array<{ cliId: string | null; cliDes: string | null }>> = signal([{ cliId: null, cliDes: 'ALL' }]);
  tabellaItems: WritableSignal<Array<{ id: string | null; des: string | null }>> = signal([{ id: null, des: 'ALL' }]);

  errorOptions = [
    { id: null,  text: 'Tutti' },
    { id: true,  text: 'YES' },
    { id: false, text: 'NO' },
  ];

  filterForm: FormGroup;
  traces = signal<TraceWithFunctionResponse[]>([]);
  selectedTrace = signal<TraceWithFunctionResponse | null>(null);
  detailVisible: WritableSignal<boolean> = signal(false);
  toastVisible = false;
  toastMessage: WritableSignal<string> = signal('');
  toastType: WritableSignal<'success' | 'error' | 'warning' | 'info'> = signal('info');

  @ViewChild('dataGrid') dataGrid?: DxDataGridComponent;

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
      traFunCode: null,
      traUser:    null,
      traStation: null,
      traTabNam:  null,
      traEntCode: null,
      traError:   null,
      dataFrom:   today,
      dataTo:     tomorrow,
    });
    this.traces.set([]);
  }

  openDetail(trace: TraceWithFunctionResponse): void {
    this.selectedTrace.set(trace);
    this.detailVisible.set(true);
  }

  onRowSelectionChanged(e: any): void {
    const row = e.selectedRowsData?.[0];
    if (row) {
      this.openDetail(row);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
    this.selectedTrace.set(null);
    try {
      this.dataGrid?.instance.clearSelection();
    } catch {}
  }

  loadAllTraces(request: GetTraceAllRequest): void {
    const typedReq = request as GetTraceWithFunctionRequest;
    this.informazioniService
      .postGetTraceAll(typedReq)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          console.log('Traces loaded', resp);
          this.traces.set(resp.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse)));
        },
        error: (err) => {
          console.error('GetTraceAll failed', err);
          this.toastMessage.set('Errore nel caricamento delle tracce');
          this.toastType.set('error');
          this.toastVisible = true;
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
          traFunCode: null,
          traUser:    null,
          traStation: null,
          traError:   null,
          dataFrom:   null,
          dataTo:     null,
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
        const adapted = v.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse));
        this.traces.set(adapted);
      });
  }
}
