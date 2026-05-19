import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-alert.component.html',
  styleUrls: ['./sempione-alert.component.css'],
})
export class SempioneAlertComponent {
  @Input() message: string | null = null;
}
