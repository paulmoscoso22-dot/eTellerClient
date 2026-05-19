import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sempione-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sempione-page-header.component.html',
  styleUrls: ['./sempione-page-header.component.css'],
})
export class SempionePageHeaderComponent {
  @Input({ required: true }) title: string = '';
}
