import { Component, signal, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFormModule, DxButtonModule, DxTextBoxModule, DxCheckBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse } from '../../models/manager.models';
import { ButtonRicercaComponent } from '../../../../../components/buttons/search/button-ricerca.component';
import { AuthFacade } from '../../../../auth/auth.facade';

@Component({
  selector: 'app-info-autorizzazioni',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxFormModule, DxButtonModule, DxTextBoxModule, DxCheckBoxModule, ButtonRicercaComponent],
  templateUrl: './info-autorizzazioni.component.html',
  styleUrls: ['./info-autorizzazioni.component.css'],
})
export class InfoAutorizzazioniComponent implements OnInit, OnDestroy {
  private readonly managerService = inject(ManagerService);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  userAuthorizations = signal<InfoAutorizzazioneUtenteResponse[]>([]);

  filterData = signal<GetAllUsersByUsrIdRequest>({
    usrId: this.authFacade.getAuthTemp().User,
    funlikeName: undefined,
    funlikeDes: undefined,
    tutti: false
  });

  ngOnInit(): void {
    this.loadUserAuthorizations();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    // Cleanup is automatically handled by takeUntilDestroyed
    
  }

  private loadInitialData(): void {
    this.managerService.getAllUsersByUsrId(this.filterData())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error loading user authorizations:', err) });
  }

  private loadUserAuthorizations(): void {
    this.managerService.userAuthorizations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.userAuthorizations.set(data);
        },
        error: (error) => {
          console.error('Error loading user authorizations:', error);
        }
      });
  }

  onSearch(): void {
    this.loadInitialData();
  }

  onClear(): void {
    this.filterData.set({
      usrId: this.authFacade.getAuthTemp().User,
      funlikeName: undefined,
      funlikeDes: undefined,
      tutti: false
    });
    this.loadInitialData();
  }
}
