import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduled-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduled-tasks.component.html',
  styleUrls: ['./scheduled-tasks.component.css'],
})
export class ScheduledTasksComponent {
  constructor() {}
}
