import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxLoadIndicatorModule } from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { HelpService } from '../services/help.service';
import { IHelpInfoResponse } from '../models/help.models';
import { SempionePageHeaderComponent } from '../../../components/General/sempione-page-header/sempione-page-header.component';
import { SempioneFieldGroupComponent } from '../../../components/General/sempione-field-group/sempione-field-group.component';
import { OpCardSectionComponent } from '../../../components/Operazioni/op-card-section/op-card-section.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    DxLoadIndicatorModule, DxTextBoxModule, DxCheckBoxModule,
    SempionePageHeaderComponent, OpCardSectionComponent,
    SempioneFieldGroupComponent,
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
