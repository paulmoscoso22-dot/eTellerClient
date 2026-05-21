import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { ManagerService } from '../../services/sicurezza.service';
import { SysUsersUseClientResponse } from '../../models/utenti.models';
import { SempionePageHeaderComponent } from '../../../../../components/General/sempione-page-header/sempione-page-header.component';
import { SempioneCardComponent } from '../../../../../components/General/sempione-card/sempione-card.component';
import { SempioneCardHeaderComponent } from '../../../../../components/General/sempione-card-header/sempione-card-header.component';
import { SempioneToolbarComponent } from '../../../../../components/General/sempione-toolbar/sempione-toolbar.component';
import { SempioneDataGridComponent, SempioneGridColumn } from '../../../../../components/General/sempione-data-grid/sempione-data-grid.component';

@Component({
  selector: 'app-utenti-collegati',
  standalone: true,
  imports: [
    CommonModule,
    DxTextBoxModule, DxButtonModule,
    SempionePageHeaderComponent, SempioneCardComponent, SempioneCardHeaderComponent,
    SempioneToolbarComponent, SempioneDataGridComponent,
  ],
  templateUrl: './utenti-collegati.component.html',
  styleUrls: ['./utenti-collegati.component.css'],
})
export class UtentiCollegatiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef     = inject(DestroyRef);

  users = signal<SysUsersUseClientResponse[]>([]);

  searchText = signal<string>('');
  filteredUsers = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      (u.usrId ?? '').toString().toLowerCase().includes(q) ||
      (u.cliId ?? '').toString().toLowerCase().includes(q)
    );
  });

  selectedUsrCliId = signal<number | null>(null);
  isLoading        = signal<boolean>(false);

  readonly columns: SempioneGridColumn[] = [
    { dataField: 'cliId',   caption: 'Client ID',    width: 120 },
    { dataField: 'usrId',   caption: 'User ID',      width: 140 },
    { dataField: 'dataIn',  caption: 'Data Accesso', dataType: 'datetime', format: 'dd/MM/yyyy HH:mm:ss' },
    { dataField: 'dataOut', caption: 'Data Uscita',  dataType: 'datetime', format: 'dd/MM/yyyy HH:mm:ss' },
    { dataField: 'forced',  caption: 'Forzato',      width: 90, type: 'bool-text-inverted' },
  ];

  ngOnInit(): void {
    this.managerService.userUseClient$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.users.set(data));
    this.loadData();
  }

  onSelectionChanged(e: any): void {
    const row = e?.selectedRowsData?.[0];
    this.selectedUsrCliId.set(row?.usrCliId ?? null);
  }

  async forzaUscitaFromRow(data: SysUsersUseClientResponse): Promise<void> {
    this.selectedUsrCliId.set(data.usrCliId ?? null);
    await this.forzaUscita();
  }

  onRefresh(): void {
    this.searchText.set('');
    this.selectedUsrCliId.set(null);
    this.loadData();
  }

  async forzaUscita(): Promise<void> {
    const id = this.selectedUsrCliId();
    if (!id) {
      notify('Selezionare un utente dalla griglia', 'warning', 2000);
      return;
    }
    const confirmed = await confirm(
      "Sei sicuro di voler forzare l'uscita di questo utente?",
      'Conferma Forza Uscita'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    this.managerService.updateUserClientExit({ usrCliId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.selectedUsrCliId.set(null);
          notify('Uscita forzata con successo', 'success', 2000);
          this.loadData();
        },
        error: (err) => {
          this.isLoading.set(false);
          notify("Errore durante l'uscita forzata", 'error', 2000);
          console.error(err);
        }
      });
  }

  private loadData(): void {
    this.managerService.getUserUseClient()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('getUserUseClient failed', err) });
  }
}
