import { Component, signal, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, switchMap, tap, of } from 'rxjs';
import {
  DxDataGridModule,
  DxDateBoxModule,
  DxTextBoxModule,
  DxToastModule,
} from 'devextreme-angular';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneButtonComponent } from '../../../../../components/General/sempione-button/sempione-button.component';
import { SempionePageShellComponent } from '../../../../../components/General/sempione-page-shell/sempione-page-shell.component';
import { SempioneTabPanelComponent } from '../../../../../components/General/sempione-tab-panel/sempione-tab-panel.component';
import { SempioneTabDirective } from '../../../../../components/General/sempione-tab-panel/sempione-tab.directive';
import { ReportFacade } from '../../services/report.facade';
import { GetTotaleCassaResponse } from '../../domain/totale-cassa.models';
import { ReportUserContext } from '../../domain/transaction.models';

@Component({
  selector: 'app-totali-cassa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxTextBoxModule,
    DxToastModule,
    SempionePageShellComponent,
    SempioneCardComponent,
    SempioneCardHeaderComponent,
    SempioneButtonComponent,
    SempioneTabPanelComponent,
    SempioneTabDirective,
  ],
  templateUrl: './totali-cassa.component.html',
  styleUrls: ['./totali-cassa.component.css'],
})
export class TotaliCassaComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly reportFacade = inject(ReportFacade);
  private readonly fb = inject(FormBuilder);

  searchForm: FormGroup = this.fb.group({
    tocData:  [new Date()],
    tocCliId: [''],
  });

  totaliCassa    = signal<GetTotaleCassaResponse[]>([]);
  isLoading      = signal(false);
  isSyncing      = signal(false);
  error          = signal<string | null>(null);
  isHostOnline   = signal(false);
  userCtx        = signal<ReportUserContext | null>(null);

  toastVisible   = signal(false);
  toastType      = signal<'success' | 'error' | 'warning' | 'info'>('info');
  toastMessage   = signal('');

  canUseTeller      = computed(() => this.userCtx()?.canUseTeller ?? false);
  canOverrideCassa  = computed(() => this.userCtx()?.canOverrideCassa ?? false);
  canShowActions    = computed(() => this.canUseTeller() || this.canOverrideCassa());

  tabBB = computed(() => this.totaliCassa().filter(r => r.tocCutId === 'BB'));
  tabLL = computed(() => this.totaliCassa().filter(r => r.tocCutId === 'LL'));
  tabMM = computed(() => this.totaliCassa().filter(r => r.tocCutId === 'MM'));

  hasSaldoErrato  = computed(() => this.totaliCassa().some(r => r.saldoErrato));
  hasOfflineOps   = computed(() => this.totaliCassa().some(r => r.hasOfflineOps));

  lastUpdate = computed(() => {
    const times = this.totaliCassa()
      .map(r => r.tocTime)
      .filter((t): t is string => !!t)
      .sort()
      .reverse();
    return times.length > 0 ? times[0] : null;
  });

  ngOnInit(): void {
    // 1. Load UserContext
    this.reportFacade.getUserContext().pipe(
      tap(ctx => {
        this.userCtx.set(ctx);
        this.searchForm.patchValue({ tocCliId: ctx.cashDeskId ?? '' });
        if (!ctx.canOverrideCassa) {
          this.searchForm.get('tocCliId')?.disable();
        }
      }),
      // 2. Check host online
      switchMap(() => this.reportFacade.isHostOnline().pipe(
        tap(online => this.isHostOnline.set(online)),
        catchError(() => { this.isHostOnline.set(false); return of(false); })
      )),
      // 3. Auto-sync if canUseTeller and online
      switchMap(online => {
        if (this.canUseTeller() && online) {
          this.isSyncing.set(true);
          return this.reportFacade.syncBalanceFromHost().pipe(
            tap(() => this.isSyncing.set(false)),
            catchError(err => {
              this.isSyncing.set(false);
              this.showToast('warning', err?.error?.message ?? 'Sincronizzazione boss non riuscita. Dati offline.');
              return of(null);
            })
          );
        }
        if (!this.canUseTeller()) {
          this.isHostOnline.set(false);
        }
        return of(null);
      }),
      // 4. Always load data (even if sync failed)
      tap(() => this.loadData()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  loadData(): void {
    if (!this.canShowActions()) return;

    this.isLoading.set(true);
    this.error.set(null);

    const raw = this.searchForm.getRawValue();
    this.reportFacade.getTotaliCassa(raw.tocCliId, raw.tocData, null, null).pipe(
      tap(data => {
        this.totaliCassa.set(data);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.error.set(err.message ?? 'Errore nel recupero totali cassa.');
        this.isLoading.set(false);
        return of([]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  search(): void {
    this.loadData();
  }

  resetFilters(): void {
    this.searchForm.patchValue({ tocData: new Date() });
    if (this.canOverrideCassa()) {
      this.searchForm.patchValue({ tocCliId: this.userCtx()?.cashDeskId ?? '' });
    }
  }

  syncFromBoss(): void {
    if (!this.canUseTeller() || this.isSyncing()) return;
    this.isSyncing.set(true);
    this.reportFacade.syncBalanceFromHost().pipe(
      tap(res => {
        this.isSyncing.set(false);
        if (res.success) {
          this.showToast('success', 'Sincronizzazione completata.');
          this.loadData();
        } else {
          this.showToast('error', res.message ?? 'Sincronizzazione fallita.');
        }
      }),
      catchError(err => {
        this.isSyncing.set(false);
        this.showToast('error', err?.error?.message ?? 'Errore di comunicazione con il Boss.');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private showToast(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    this.toastType.set(type);
    this.toastMessage.set(message);
    this.toastVisible.set(true);
  }
}
