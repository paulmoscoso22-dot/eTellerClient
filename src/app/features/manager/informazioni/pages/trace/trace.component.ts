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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonRicercaComponent } from '../../../../../components/buttons/search/button-ricerca.component';
import { LabelSecondaryComponent } from '../../../../../components/labels/label-secondary/label-secondary.component';
import { TraceDetaillComponent } from '../../components/trace-detaill-component/trace-detaill.component';
import { InformazioniService } from '../../services/informazioni.service';
import { GetTraceAllRequest, TraceResponse, TraceWithFunctionResponse, GetTraceWithFunctionRequest, StTracefunctionResponse, SysUsersActiveAndBlockedResponse, ClientResponse, GetTabellaServVarcharRequest, TabellaServVarcharResponse, GetTraceByIdRequest } from '../../models/informazioni.models';

@Component({
  selector: 'app-trace',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule, DxButtonModule, DxDataGridModule, DxPopupModule, ButtonRicercaComponent, LabelSecondaryComponent, TraceDetaillComponent],
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.css'],
})
export class TraceComponent implements OnInit {
  private readonly informazioniService = inject(InformazioniService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  // placeholder lists for combo boxes
  funzioni: WritableSignal<Array<{ tfcId: string | null; tfcDes: string }>> = signal<Array<{ tfcId: string | null; tfcDes: string }>>([{ tfcId: null, tfcDes: 'ALL' }]);
  utenti: WritableSignal<Array<{ usrId: string | null; des: string }>> = signal<Array<{ usrId: string | null; des: string }>>([{ usrId: null, des: 'ALL' }]);
  clients: WritableSignal<Array<{ cliId: string | null; cliDes: string | null }>> = signal<Array<{ cliId: string | null; cliDes: string | null }>>([{ cliId: null, cliDes: 'ALL' }]);
  casse = ['ALL', 'Cassa1', 'Cassa2'];
  tabellaItems: WritableSignal<Array<{ id: string | null; des: string | null }>> = signal<Array<{ id: string | null; des: string | null }>>([{ id: null, des: 'ALL' }]);
  errorOptions = [
    { id: null, text: 'Tutti' },
    { id: true, text: 'YES' },
    { id: false, text: 'NO' },
  ];
  // reactive form
  private readonly fb = inject(FormBuilder);
  filterForm: FormGroup;
  traces: WritableSignal<TraceResponse[]> = signal<TraceResponse[]>([]);
  selectedTrace: WritableSignal<TraceWithFunctionResponse | null> = signal<TraceWithFunctionResponse | null>(null);
  detailVisible: WritableSignal<boolean> = signal<boolean>(false);

  @ViewChild('dataGrid') dataGrid?: DxDataGridComponent;

  // cache for funzione descriptions (traFunCode -> description)

  constructor() {
    const today = new Date();
    // normalize to start of day (00:00:00.000)
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    this.filterForm = this.fb.group({
      traFunCode: [null],
      traUser: [null],
      traStation: [null],
      traTabNam: [null],
      traEntCode: [null],
      traError: [null],
      dataFrom: [today],
      dataTo: [tomorrow],
    });
  }

  ngOnInit(): void {
    // apply any incoming query params to prefill the filter
    this.applyQueryParamsToPrefillFilters();
    
    this.subscribeToTraces();
    this.subscribeToTraceFunctions();
    this.subscribeToActiveBlockedUsers();
    this.subscribeToClients();
    this.subscribeToTabellaServVarchar();

    // trigger loading of functions and users
    this.loadTraceFunctions();
    this.loadActiveBlockedUsers();
    this.loadClients();
    this.loadTabellaServVarchar();

    this.loadAllTraces(this.buildRequestFromForm() as GetTraceWithFunctionRequest);
  }

  private applyQueryParamsToPrefillFilters(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const traTabNam = params['traTabNam'];
      const traEntCode = params['traEntCode'];

      this.filterForm.get('traFunCode')?.setValue(null);
      this.filterForm.get('traUser')?.setValue(null);
      this.filterForm.get('traStation')?.setValue(null);
      this.filterForm.get('traError')?.setValue(null);
      this.filterForm.get('dataFrom')?.setValue(null);
      this.filterForm.get('dataTo')?.setValue(null);

      if (traTabNam !== undefined) {
        this.filterForm.get('traTabNam')?.setValue(traTabNam);
      }
      if (traEntCode !== undefined) {
        this.filterForm.get('traEntCode')?.setValue(String(traEntCode));
      }
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
    this.informazioniService
      .postGetTraceFunction()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
        error: (err) => console.error('postGetTraceFunction failed', err),
      });
  }

  private subscribeToActiveBlockedUsers(): void {
    this.informazioniService.activeBlockedUsers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: SysUsersActiveAndBlockedResponse[]) => {
        this.utenti.set([{ usrId: null, des: 'ALL' }, ...v.map(x => ({ usrId: x.usrId, des: x.usrId }))]);
      });
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
    this.informazioniService
      .postGetTabellaServVarchar(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => {}, error: (err) => console.error('postGetTabellaServVarchar failed', err) });
  }

  private subscribeToClients(): void {
    this.informazioniService.clients$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: ClientResponse[]) => {
        this.clients.set([{ cliId: null, cliDes: 'ALL' }, ...v.map(x => ({ cliId: x.cliId, cliDes: x.cliDes }))]);
      });
  }

  private loadClients(): void {
    this.informazioniService
      .postGetClient()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => {}, error: (err) => console.error('postGetClient failed', err) });
  }

  private loadActiveBlockedUsers(): void {
    this.informazioniService
      .postGetActiveAndBlockedUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => {}, error: (err) => console.error('postGetActiveAndBlockedUsers failed', err) });
  }

  onVisualizza(): void {
    const req = this.buildRequestFromForm();
    this.loadAllTraces(req);
  }

  openDetail(trace: TraceWithFunctionResponse): void {
    this.selectedTrace.set(trace);
    this.detailVisible.set(true);
  }

  onRowSelectionChanged(e: any): void {
    const row = e.selectedRowsData && e.selectedRowsData[0];
    if (row) {
      this.openDetail(row);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
    this.selectedTrace.set(null);
    // clear selection in the grid when detail popup is closed
    try {
      this.dataGrid?.instance.clearSelection();
    } catch (e) {
      // ignore if widget not initialized
    }
  }

  private buildRequestFromForm(): GetTraceAllRequest {
    const values = this.filterForm.value;
    const req = new GetTraceAllRequest();
    req.traFunCode = values.traFunCode ? values.traFunCode : null;
    req.traUser = values.traUser ? values.traUser : null;
    req.traStation = values.traStation ? values.traStation : null;
    req.traTabNam = values.traTabNam ? values.traTabNam : null;
    req.traEntCode = values.traEntCode ? values.traEntCode : null;
    req.traError = values.traError === undefined ? null : values.traError;
    req.dataFrom = values.dataFrom ?? null;
    req.dataTo = values.dataTo ?? null;
    return req;
  }

  private subscribeToTraces(): void {
    this.informazioniService.traces$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: TraceResponse[]) => {
        // adapt legacy TraceResponse[] into TraceWithFunctionResponse[] by adding empty tfcDes
        const adapted = v.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse));
        this.traces.set(adapted);
        //this.loadFunzioneDescriptionsForTraces(v);
      });
  }

  loadAllTraces(request: GetTraceAllRequest): void {
    const typedReq = request as GetTraceWithFunctionRequest;
    this.informazioniService
      //.postGetAllTracerDesFuction(typedReq)
      .postGetTraceAll(typedReq)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          console.log('Traces with function descriptions loaded', resp);
          this.traces.set(resp);
        },
        error: (err) => {
           console.error('GetAllTracerDesFuction failed, falling back to GetTraceAll', err);
          // this.informazioniService
          //   .postGetTraceAll(request as GetTraceAllRequest)
          //   .pipe(takeUntilDestroyed(this.destroyRef))
          //   .subscribe({ next: (legacy) => this.traces.set(legacy.map(item => ({ ...item, tfcDes: '' } as TraceWithFunctionResponse))), error: (e) => console.error('Fallback GetTraceAll failed', e) });
        },
      });
  }

  // removed unused normalization and description-loading helpers

}
