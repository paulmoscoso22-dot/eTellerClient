import { Component, signal, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxButtonModule, DxTextBoxModule, DxTemplateModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from '../../services/sicurezza.service';
import { GetAllUsersByUsrIdRequest, InfoAutorizzazioneUtenteResponse } from '../../models/manager.models';
import { IStFunAcctypResponse } from '../../models/function.models';
import { AuthFacade } from '../../../../auth/auth.facade';

@Component({
  selector: 'app-info-autorizzazioni',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxButtonModule, DxTextBoxModule, DxTemplateModule],
  templateUrl: './info-autorizzazioni.component.html',
  styleUrls: ['./info-autorizzazioni.component.css'],
})
export class InfoAutorizzazioniComponent implements OnInit, OnDestroy {
  private readonly managerService = inject(ManagerService);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);

  userAuthorizations = signal<InfoAutorizzazioneUtenteResponse[]>([]);
  funcAccTyp = signal<IStFunAcctypResponse[]>([]);

  filterData = signal<GetAllUsersByUsrIdRequest>({
    usrId: this.authFacade.getAuthTemp().User,
    funlikeName: undefined,
    funlikeDes: undefined,
    tutti: false
  });

  ngOnInit(): void {
    this.loadUserAuthorizations();
    this.loadFuncAccTyp();
    this.loadInitialData();
  }

  ngOnDestroy(): void {}

  private loadInitialData(): void {
    this.managerService.getAllUsersByUsrId(this.filterData())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error loading user authorizations:', err) });
  }

  private loadFuncAccTyp(): void {
    this.managerService.funcAccTyp$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.funcAccTyp.set(data));
    this.managerService.getFuncAccTyp()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error loading access types:', err) });
  }

  private loadUserAuthorizations(): void {
    this.managerService.userAuthorizations$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.userAuthorizations.set(data),
        error: (err) => console.error('Error loading user authorizations:', err)
      });
  }

  setFunlikeName(v: string): void {
    this.filterData.update(d => ({ ...d, funlikeName: v || undefined }));
  }

  setFunlikeDes(v: string): void {
    this.filterData.update(d => ({ ...d, funlikeDes: v || undefined }));
  }

  onSearch(): void { this.loadInitialData(); }

  onClear(): void {
    this.filterData.set({
      usrId: this.authFacade.getAuthTemp().User,
      funlikeName: undefined,
      funlikeDes: undefined,
      tutti: false
    });
    this.loadInitialData();
  }

  getAccessLabel(id: number): string {
    return this.funcAccTyp().find(a => a.fatId === id)?.fatDes ?? String(id);
  }

  getAccessBadgeClass(id: number): string {
    const label = this.getAccessLabel(id).toLowerCase();
    if (label.includes('vis') || label.includes('read') || label.includes('lett')) return 'access--view';
    if (label.includes('mod') || label.includes('edit') || label.includes('scrit')) return 'access--edit';
    if (label.includes('full') || label.includes('admin') || label.includes('tutto')) return 'access--full';
    return 'access--default';
  }

  getRoleBadgeClass(role: string): string {
    if (!role) return 'role--default';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'role--admin';
    if (r.includes('manager') || r.includes('respons') || r.includes('dirett')) return 'role--manager';
    if (r.includes('oper') || r.includes('teller') || r.includes('cassier')) return 'role--operator';
    return 'role--default';
  }
}
