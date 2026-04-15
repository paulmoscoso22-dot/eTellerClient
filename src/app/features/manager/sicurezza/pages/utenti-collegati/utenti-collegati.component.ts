import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { ManagerService } from '../../services/sicurezza.service';
import { Observable } from 'rxjs';
import { SysUsersUseClientResponse } from '../../models/utenti.models';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-utenti-collegati',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxButtonModule],
  templateUrl: './utenti-collegati.component.html',
  styleUrls: ['./utenti-collegati.component.css'],
})
export class UtentiCollegatiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  
  public userUseClient$: Observable<SysUsersUseClientResponse[]> = this.managerService.userUseClient$;
  public selectedUsrCliId = signal<number | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.managerService.getUserUseClient().subscribe();
  }

  onSelectionChanged(e: any): void {
    const selectedItem = e.selectedRowsData[0];
    if (selectedItem && selectedItem.usrCliId) {
      this.selectedUsrCliId.set(selectedItem.usrCliId);
    } else {
      this.selectedUsrCliId.set(null);
    }
  }

  async forzaUscita(): Promise<void> {
    const usrCliId = this.selectedUsrCliId();
    if (!usrCliId) return;

    const result = await confirm('Sei sicuro di voler forzare l\'uscita di questo utente?', 'Conferma Forza Uscita');
    if (result) {
      this.managerService.updateUserClientExit({ usrCliId }).subscribe({
        next: (response) => {
          notify('Uscita forzata con successo', 'success', 3000);
          this.selectedUsrCliId.set(null); 
          this.managerService.getUserUseClient().subscribe();
        },
        error: (err) => {
          console.error('Errore durante l\'uscita forzata', err);
          notify('Errore durante l\'uscita forzata', 'error', 3000);
        }
      });
    }
  }
}

