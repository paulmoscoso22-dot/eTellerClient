import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DxFormModule,
  DxLoadIndicatorModule,
} from 'devextreme-angular';
import { HelpService } from '../services/help.service';
import { IHelpInfoResponse } from '../models/help.models';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    DxFormModule,
    DxLoadIndicatorModule,
  ],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
})
export class HelpComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly helpService = inject(HelpService);

  helpInfo = signal<IHelpInfoResponse | null>(null);
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.loadHelpInfo();
  }

  private loadHelpInfo(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.helpService.getInfoBase()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: IHelpInfoResponse) => {
          this.helpInfo.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('Errore nel caricamento delle informazioni.');
          this.isLoading.set(false);
        },
      });
  }
}
