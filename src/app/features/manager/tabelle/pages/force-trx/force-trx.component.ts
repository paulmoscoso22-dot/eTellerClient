import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxPopupModule,
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ForceTrxService } from '../../services/force-trx.service';
import { IForceTrxItemResponse } from '../../models/force-trx.models';

@Component({
  selector: 'app-force-trx',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxPopupModule,
  ],
  templateUrl: './force-trx.component.html',
  styleUrls: ['./force-trx.component.css'],
})
export class ForceTrxComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly forceTrxService = inject(ForceTrxService);

  items = signal<IForceTrxItemResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  selectedItem = signal<IForceTrxItemResponse | null>(null);
  isDetailPopupVisible = false;

  readonly languages = [
    { id: 'IT', label: 'Italiano' },
    { id: 'EN', label: 'English' },
    { id: 'DE', label: 'Deutsch' },
    { id: 'FR', label: 'Français' },
  ];
  selectedLanCode = signal<string>('IT');

  constructor() {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.forceTrxService.getAll(this.selectedLanCode())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.items.set(data);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Errore nel recupero dei dati');
          this.isLoading.set(false);
        }
      });
  }

  search(): void {
    this.loadAll();
  }

  onLanguageChanged(lanCode: string): void {
    this.selectedLanCode.set(lanCode);
  }

  openDetail(item: IForceTrxItemResponse): void {
    this.selectedItem.set(item);
    this.isDetailPopupVisible = true;
  }

  closeDetail(): void {
    this.isDetailPopupVisible = false;
  }
}
