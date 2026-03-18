import { Component, signal, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFormModule, DxButtonModule, DxTextBoxModule, DxCheckBoxModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/manager.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse } from '../../models/manager.models';
import { ButtonRicercaComponent } from '../../../../../components/buttons/search/button-ricerca.component';

@Component({
  selector: 'app-info-autorizzazioni',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxFormModule, DxButtonModule, DxTextBoxModule, DxCheckBoxModule, ButtonRicercaComponent],
  templateUrl: './info-autorizzazioni.component.html',
  styleUrls: ['./info-autorizzazioni.component.css'],
})
export class InfoAutorizzazioniComponent implements OnInit, OnDestroy {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef = inject(DestroyRef);
  userAuthorizations = signal<InfoAutorizzazioneUtenteResponse[]>([]);
  
  filterData = signal<GetAllUsersByUsrIdRequest>({
    usrId: '',
    funlikeName: undefined,
    funlikeDes: undefined,
    tutti: false
  });

  ngOnInit(): void {
    this.loadUserAuthorizations();
  }

  ngOnDestroy(): void {
    // Cleanup is automatically handled by takeUntilDestroyed
    
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
    const request = this.filterData();
    this.managerService.getAllUsersByUsrId(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.userAuthorizations.set(data);
        },
        error: (error) => {
          console.error('Error searching user authorizations:', error);
        }
      });
  }

  onClear(): void {
    this.filterData.set({
      usrId: '',
      funlikeName: undefined,
      funlikeDes: undefined,
      tutti: false
    });
  }
}
