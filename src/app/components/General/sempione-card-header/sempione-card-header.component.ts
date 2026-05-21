import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-card-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-card-header.component.html',
  styleUrls: ['./sempione-card-header.component.css'],
})
export class SempioneCardHeaderComponent {
  @Input({ required: true }) title: string = '';
  @Input() count?: number;
}
