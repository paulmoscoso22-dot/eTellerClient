import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
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
import { GetMsg2HostRequest, Msg2HostResponse } from '../../models/informazioni.models';

function makeToday(): Date    { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function makeTomorrow(): Date { const d = makeToday(); d.setDate(d.getDate() + 1); return d; }

@Component({
  selector: 'app-gestione-messaggi-host',
  standalone: true,
  imports: [
    CommonModule,
    DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule, DxNumberBoxModule, DxTextAreaModule,
    SempionePageShellComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneButtonComponent,
    SempioneDataGridComponent,
    SempionePopupComponent, SempionePopupCardComponent, SempionePopupActionBarComponent,
    SempioneFieldGroupComponent,
  ],
  templateUrl: './gestione-messaggi-host.component.html',
  styleUrls: ['./gestione-messaggi-host.component.css'],
})
export class GestioneMessaggiHostComponent implements OnInit {
  private readonly informazioniService = inject(InformazioniService);
  private readonly destroyRef          = inject(DestroyRef);
  private readonly route               = inject(ActivatedRoute);

  readonly statusOptions = [
    { id: null,          text: 'Tutti'     },
    { id: 'CREATED',     text: 'CREATED'   },
    { id: 'SEND',        text: 'SEND'      },
    { id: 'RECEIVED',    text: 'RECEIVED'  },
    { id: 'COMPLETED',   text: 'COMPLETED' },
  ];

  readonly gridColumns: SempioneGridColumn[] = [
    { dataField: 'msgId',         caption: 'ID Msg',        alignment: 'center', width: 90  },
    { dataField: 'msgStatus',     caption: 'Stato',         alignment: 'center'             },
    { dataField: 'trxId',         caption: 'ID Transaz.',   alignment: 'center', width: 120 },
    { dataField: 'msgModifyDate', caption: 'Data Modifica', alignment: 'center', width: 160, dataType: 'date', format: 'dd/MM/yyyy HH:mm:ss' },
  ];

  filterDateFrom = signal<Date | null>(makeToday());
  filterDateTo   = signal<Date | null>(makeTomorrow());
  filterTrxId    = signal<number | null>(null);
  filterMsgId    = signal<number | null>(null);
  filterStatus   = signal<string | null>(null);

  messages      = signal<Msg2HostResponse[]>([]);
  selectedMsg   = signal<Msg2HostResponse | null>(null);
  isLoading     = signal(false);
  detailVisible = false;

  ngOnInit(): void {
    this.applyQueryParams();
    this.subscribeToMessages();
  }

  onVisualizza(): void {
    this.loadData();
  }

  resetFilters(): void {
    this.filterDateFrom.set(makeToday());
    this.filterDateTo.set(makeTomorrow());
    this.filterTrxId.set(null);
    this.filterMsgId.set(null);
    this.filterStatus.set(null);
    this.messages.set([]);
  }

  openDetail(msg: Msg2HostResponse): void {
    this.selectedMsg.set(msg);
    this.detailVisible = true;
  }

  closeDetail(): void {
    this.detailVisible = false;
    this.selectedMsg.set(null);
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

  private loadData(): void {
    this.isLoading.set(true);
    this.informazioniService.postGetMsg2Host(this.buildRequest())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isLoading.set(false),
        error: (err) => {
          console.error('postGetMsg2Host failed', err);
          notify('Errore nel caricamento dei messaggi', 'error', 3000);
          this.isLoading.set(false);
        },
      });
  }

  private applyQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const trxId = params['TRX_ID'] ?? params['trxId'];
        if (trxId !== undefined) {
          this.filterTrxId.set(Number(trxId));
        }
      });
  }

  private subscribeToMessages(): void {
    this.informazioniService.msg2host$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v: Msg2HostResponse[]) => this.messages.set(v));
  }

  private buildRequest(): GetMsg2HostRequest {
    const req = new GetMsg2HostRequest();
    req.dataFrom  = this.filterDateFrom();
    req.dataTo    = this.filterDateTo();
    req.trxId     = this.filterTrxId();
    req.msgId     = this.filterMsgId();
    req.msgStatus = this.filterStatus();
    return req;
  }
}
