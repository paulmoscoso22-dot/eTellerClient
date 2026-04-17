import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'app-control-assign',
  standalone: true,
  imports: [CommonModule, DxDataGridModule, DxButtonModule],
  templateUrl: './control-assign.component.html',
  styleUrls: ['./control-assign.component.css']
})
export class ControlAssignComponent {
  @Input() assignedRoles = signal<any[]>([]);
  @Input() possibleRoles = signal<any[]>([]);

  @Output() rolesChanged = new EventEmitter<{
    assigned: any[];
    possible: any[];
    movedToLeft: number[];
    movedToRight: number[];
  }>();

  selectedAssignedRoleKeys: number[] = [];
  selectedPossibleRoleKeys: number[] = [];
  private movedToLeft: number[] = [];
  private movedToRight: number[] = [];

  addRole(): void {
    const item = this.selectedPossibleRoleKeys[0];
    const rolesToAdd = this.possibleRoles().filter(r =>
      this.selectedPossibleRoleKeys.includes(r.roleId)
    );
    
    if (rolesToAdd.length > 0) {
      this.assignedRoles.update(roles => [...roles, ...rolesToAdd]);
      this.possibleRoles.update(roles =>
        roles.filter(r => !this.selectedPossibleRoleKeys.includes(r.roleId))
      );

      if (this.movedToRight.includes(item)) {
        this.movedToRight = this.movedToRight.filter(id => id !== item);
      } else {
        this.movedToLeft = [...this.movedToLeft, item];
      }

      this.selectedPossibleRoleKeys = [];
      this.emitChanges();
    }
  }

  removeRole(): void {
    const item = this.selectedAssignedRoleKeys[0];
    const rolesToRemove = this.assignedRoles().filter(r =>
      this.selectedAssignedRoleKeys.includes(r.roleId)
    );

    if (rolesToRemove.length > 0) {
      this.possibleRoles.update(roles => [...roles, ...rolesToRemove]);
      this.assignedRoles.update(roles =>
        roles.filter(r => !this.selectedAssignedRoleKeys.includes(r.roleId))
      );

      if (this.movedToLeft.includes(item)) {
        this.movedToLeft = this.movedToLeft.filter(id => id !== item);
      } else {
        this.movedToRight = [...this.movedToRight, item];
      }

      this.selectedAssignedRoleKeys = [];
      this.emitChanges();
    }
  }

  private emitChanges(): void {
    this.rolesChanged.emit({
      assigned: this.assignedRoles(),
      possible: this.possibleRoles(),
      movedToLeft: this.movedToLeft,
      movedToRight: this.movedToRight,
    });
  }
}
