import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import {
  DxPopupModule, DxTextBoxModule, DxSelectBoxModule,
  DxButtonModule, DxValidatorModule
} from 'devextreme-angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { CassePeriferichService } from '../../services/casse-periferiche.service';
import { IClientResponse, IGetClientByIdQuery } from '../../models/cliente.models';
import { IDeviceResponse, IGetDeviceByBraIdNotCliIdRequest, IGetDeviceByCliIdRequest } from '../../models/device.models';
import { TableClientiComponent } from '../../components/table-clienti/table-clienti.component';
import { ControlAssignComponent } from '../../../../../components/control-assign/control-assign.component';
import { Service } from '../../../../../core/services/service';
import { Branch } from '../../../../../core/domain/branch.domain';
import { ISTLanguageResponse } from '../../../../../core/domain/laguage.domain';
import { ISTStatoEntitaResponse } from '../../../../../core/domain/stato-entita.domain';

@Component({
  selector: 'app-casse',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DxPopupModule, DxTextBoxModule, DxSelectBoxModule, DxButtonModule, DxValidatorModule,
    TableClientiComponent, ControlAssignComponent, TranslocoPipe
  ],
  templateUrl: './casse.component.html',
  styleUrls: ['./casse.component.css'],
})
export class CasseComponent implements OnInit {
  private readonly cassePeriferichService = inject(CassePeriferichService);
  private readonly coreService = inject(Service);
  private readonly fb = inject(FormBuilder);

  public clients$: Observable<IClientResponse[]> = this.cassePeriferichService.clients$;
  public branches$: Observable<Branch[]> = this.coreService.branches$;
  public languages$: Observable<ISTLanguageResponse[]> = this.coreService.languages$;
  public statiEntita$: Observable<ISTStatoEntitaResponse[]> = this.coreService.allStatiEntita$;

  isPopupVisible = false;
  popupMode = signal<'view' | 'edit'>('view');
  selectedCliId = signal<string | null>(null);

  assignedDevices = signal<any[]>([]);
  possibleDevices = signal<any[]>([]);

  clientForm: FormGroup = this.fb.group({
    cliId:      [{ value: '', disabled: true }],
    cliIp:      [''],
    cliMac:     [''],
    cliAuthcode:[''],
    cliBraId:   [''],
    cliDes:     [''],
    cliOff:     [''],
    cliStatus:  [''],
    cliLingua:  [''],
  });

  ngOnInit(): void {
    this.cassePeriferichService.postGetClient().subscribe();
    this.coreService.getBranches().subscribe();
    this.coreService.GetLanguages().subscribe();
    this.coreService.GetAllStatiEntita().subscribe();
  }

  onSelectionChanged(_e: any): void {}

  onTableAction(event: { action: string; data: IClientResponse }): void {
    switch (event.action) {
      case 'view':
        this.popupMode.set('view');
        this.openPopup(event.data);
        break;
      case 'edit':
        this.popupMode.set('edit');
        this.openPopup(event.data);
        break;
    }
  }

  private openPopup(data: IClientResponse): void {
    this.selectedCliId.set(data.cliId);
    this.isPopupVisible = true;

    // Load full client detail
    const clientReq: IGetClientByIdQuery = { cliId: data.cliId };
    this.cassePeriferichService.postGetClientById(clientReq).subscribe({
      next: (client: IClientResponse) => {
        this.clientForm.patchValue({
          cliId:       client.cliId,
          cliIp:       client.cliIp,
          cliMac:      client.cliMac,
          cliAuthcode: client.cliAuthcode,
          cliBraId:    client.cliBraId,
          cliDes:      client.cliDes,
          cliOff:      client.cliOff,
          cliStatus:   client.cliStatus,
          cliLingua:   client.cliLingua,
        });

        // Load possible devices using braId + cliId
        const possibleReq: IGetDeviceByBraIdNotCliIdRequest = {
          braId: data.cliBraId,
          cliId: data.cliId,
        };
        console.log('possibleReq', possibleReq);
        this.cassePeriferichService.postGetDeviceByBraIdNotCliId(possibleReq).subscribe({
          next: (devices: IDeviceResponse[]) => {
            console.log('Possible devices:', possibleReq);
            this.possibleDevices.set(this.mapDevices(devices));
          }
        });
      }
    });

    // Load assigned devices for this client
    const deviceReq: IGetDeviceByCliIdRequest = { cliId: data.cliId };
    this.cassePeriferichService.postGetDeviceByCliId(deviceReq).subscribe({
      next: (devices: IDeviceResponse[]) => {
        this.assignedDevices.set(this.mapDevices(devices));
      }
    });
  }

  private mapDevices(devices: IDeviceResponse[]): any[] {
    return devices.map(d => ({
      roleId:   d.devId,
      roleName: `${d.devType}||${d.devName}`,
    }));
  }

  onDevicesChanged(e: { assigned: any[]; possible: any[] }): void {
    this.assignedDevices.set(e.assigned);
    this.possibleDevices.set(e.possible);
  }

  onReset(): void {
    this.clientForm.reset();
    this.assignedDevices.set([]);
    this.possibleDevices.set([]);
  }

  onPopupHidden(): void {
    this.onReset();
    this.selectedCliId.set(null);
  }

  get isReadOnly(): boolean {
    return this.popupMode() === 'view';
  }
}

