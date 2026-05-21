import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SempionePopupComponent } from '../../../components/General/sempione-popup/sempione-popup.component';
import { SempionePopupActionBarComponent } from '../../../components/General/sempione-popup-action-bar/sempione-popup-action-bar.component';

@Component({
  selector: 'app-force-login',
  standalone: true,
  imports: [SempionePopupComponent, SempionePopupActionBarComponent],
  templateUrl: './force-login.component.html',
  styleUrls: ['./force-login.component.css'],
})
export class ForceLoginComponent {
  @Input() visible = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
