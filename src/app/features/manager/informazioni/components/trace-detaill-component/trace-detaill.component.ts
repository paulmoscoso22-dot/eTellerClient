import { Component, Input, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelSecondaryComponent } from '../../../../../components/labels/label-secondary/label-secondary.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InformazioniService } from '../../services/informazioni.service';
import { GetTabellaServVarcharByIdRequest, TabellaServVarcharResponse, TraceResponse, GetTraceWithFunctionRequest, TraceWithFunctionResponse } from '../../models/informazioni.models';

@Component({
  selector: 'app-trace-detaill-component',
  standalone: true,
  imports: [CommonModule, LabelSecondaryComponent],
  templateUrl: './trace-detaill.component.html',
  styleUrls: ['./trace-detaill.component.scss']
})
export class TraceDetaillComponent implements OnInit {

  @Input() trace: TraceResponse | null = null;

  // signal that holds mapping from traFunCode -> description
  private readonly informazioniService = inject(InformazioniService);
  private readonly destroyRef = inject(DestroyRef);
  desFunzione = signal<string | null>(null);
  tracesWithFunction = signal<TraceWithFunctionResponse[] | null>(null);

  constructor() {}

  ngOnInit(): void {
    console.log('TraceDetaillComponent initialized with traIdOrRow:', this.trace);
    this.loadFunzioneDescriptions(this.trace?.traFunCode || '');
    // initial load already handled by setter when Input is set
  }


  private loadFunzioneDescriptions(traFuncCode: string): void {
    const req: GetTabellaServVarcharByIdRequest = { id: traFuncCode, nomeTabella: 'ST_TRACE_FUNCTION' };
      this.informazioniService.postGetTabellaServVarcharById(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: TabellaServVarcharResponse) => {
            this.desFunzione.set(res.des || null);
        },
        error: () => {
            console.error('Failed to load funzione description for code:', traFuncCode);
        }
      });
    }
}

