import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToastModule } from 'devextreme-angular/ui/toast';
import { DxTemplateModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { ManagerService } from '../../services/sicurezza.service';
import { SysUsersUseClientResponse } from '../../models/utenti.models';

@Component({
  selector: 'app-utenti-collegati',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule, DxTextBoxModule, DxButtonModule,
    DxToastModule, DxTemplateModule,
  ],
  templateUrl: './utenti-collegati.component.html',
  styleUrls: ['./utenti-collegati.component.css'],
})
export class UtentiCollegatiComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef     = inject(DestroyRef);

  // ── Data ──
  users = signal<SysUsersUseClientResponse[]>([]);

  // ── Filter ──
  searchText = signal<string>('');
  filteredUsers = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      (u.usrId   ?? '').toString().toLowerCase().includes(q) ||
      (u.cliId   ?? '').toString().toLowerCase().includes(q)
    );
  });

  // ── Selection ──
  selectedUsrCliId = signal<number | null>(null);

  // ── UI state ──
  isLoading    = signal<boolean>(false);
  toastVisible = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType    = signal<'success' | 'error' | 'warning' | 'info'>('success');

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
      this.showNotification('Selezionare un utente dalla griglia', 'warning');
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
          this.showNotification('Uscita forzata con successo', 'success');
          this.loadData();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showNotification("Errore durante l'uscita forzata", 'error');
          console.error(err);
        }
      });
  }

  private loadData(): void {
    this.managerService.getUserUseClient()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('getUserUseClient failed', err) });
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    notify(message, type, 2000);
  }
}
