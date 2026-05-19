import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-popup-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-popup-card.component.html',
  styleUrls: ['./sempione-popup-card.component.css'],
})
export class SempionePopupCardComponent {
  @Input({ required: true }) title: string = '';
}
