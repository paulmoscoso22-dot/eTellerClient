import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderCardComponent } from '../../header-card/header-card.component';

@Component({
  selector: 'op-card-section',
  standalone: true,
  imports: [CommonModule, HeaderCardComponent],
  templateUrl: './op-card-section.component.html',
  styleUrls: ['./op-card-section.component.css'],
})
export class OpCardSectionComponent {
  @Input({ required: true }) title: string = '';
  @Input() fill: boolean = false;
}
