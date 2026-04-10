import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-label-primary-h1',
  standalone: true,
  imports: [],
  templateUrl: './label-primary-h1.component.html',
  styleUrl: './label-primary-h1.component.css'
})
export class LabelPrimaryH1Component {
  @Input() label = '';
  @Input() fontSize: string = '24px';
}
