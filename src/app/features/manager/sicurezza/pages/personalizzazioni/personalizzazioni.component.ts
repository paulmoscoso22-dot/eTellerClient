import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import notify from 'devextreme/ui/notify';
import { ManagerService } from '../../services/sicurezza.service';
import { PersonalisationResponse, UpdatePersonalisationRequest } from '../../models/personalisation.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personalizzazioni',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DxDataGridModule, DxTextBoxModule, DxTextAreaModule, DxButtonModule],
  templateUrl: './personalizzazioni.component.html',
  styleUrls: ['./personalizzazioni.component.css'],
})
export class PersonalizzazioniComponent implements OnInit {
  private readonly managerService = inject(ManagerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly router = inject(Router);

  personalisations = signal<PersonalisationResponse[]>([]);
  form = new FormGroup({
    parDes: new FormControl(''),
    parValue: new FormControl('')
  });

  selectedParId: string | null = null;

  ngOnInit(): void {
    this.loadPersonalisations();
    this.subscribeToPersonalisationStream();
  }

  private loadPersonalisations(): void {
    this.managerService.getPersonalisation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: (err) => console.error('Error loading personalisations:', err) });
  }

  private subscribeToPersonalisationStream(): void {
    this.managerService.personalisation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.personalisations.set(data),
        error: (err) => console.error('Error receiving personalisations stream:', err),
      });
  }

  onSelectionChanged(e: any): void {
    const selected = e && e.selectedRowsData && e.selectedRowsData[0];
    if (!selected) {
      this.selectedParId = null;
      this.form.reset();
      return;
    }
    this.selectedParId = selected.parId ?? null;
    this.form.patchValue({
      parDes: selected.parDes ?? '',
      parValue: selected.parValue ?? ''
    });
  }

  onSave(): void {
    if (!this.selectedParId) {
      console.warn('No personalisation selected to update');
      return;
    }
    const payload: UpdatePersonalisationRequest = {
      parId: this.selectedParId ?? '',
      parDes: this.form.value.parDes ?? '',
      parValue: this.form.value.parValue ?? '',
      originalParId: this.selectedParId ?? ''
    };

    this.managerService.updatePersonalisation(payload).subscribe({
      next: (updatedList) => {
        notify('Personalizzazione aggiornata con successo', 'success', 3000);
        if (Array.isArray(updatedList)) {
          this.personalisations.set(updatedList);
        } else {
          // fallback: refresh
          this.managerService.getPersonalisation().subscribe({ error: (err) => console.error('Error refreshing personalisations:', err) });
        }
      },
      error: (err) => {
        console.error('Error updating personalisation:', err);
        notify('Errore durante il salvataggio: ' + (err?.message ?? 'Server error'), 'error', 5000);
      }
    });
  }

  onTrace(): void {
    //if (!this.requireSelection('Selezionare una funzione da tracciare')) return;
    // Navigate to trace page with query params to prefill filter
    this.router.navigate(['/trace'], {
      queryParams: {
        traTabNam: 'PERSONALISATION',
        traEntCode: String(this.selectedParId)
      }
    });
  }

}
